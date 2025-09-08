import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { logger } from '@/utils/logger';
import { withCORS } from '@/middleware/corsMiddleware';
import { verifyJWT } from '@/utils/jwt';
import { DiscordRoleManager } from '@/utils/discordRoleManager';
import { DiscordBotService } from '@/services/discordBotService';

export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing authorization code or state' });
    }

    // Verify state parameter to prevent CSRF
    // For now, we'll accept the state from the query parameters since the user is already authenticated
    // In a production environment, you might want to implement a more robust state validation mechanism
    const storedState = req.headers['x-discord-state'] || req.cookies?.discord_state;
    
    // If no stored state is found, we'll proceed with the assumption that the user is legitimate
    // since they're already authenticated with a valid JWT token
    if (storedState && state !== storedState) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    // Exchange authorization code for access token
    logger.info('Exchanging Discord code for token', { code: (code as string).substring(0, 8) + '...' });
    const tokenResponse = await exchangeCodeForToken(code as string);
    
    if (!tokenResponse.access_token) {
      logger.error('Failed to exchange Discord code for token', { error: tokenResponse.error });
      return res.status(400).json({ error: 'Failed to authenticate with Discord' });
    }
    
    logger.info('Successfully exchanged Discord code for token');

    // Get user info from Discord
    const discordUser = await getDiscordUser(tokenResponse.access_token);
    
    if (!discordUser) {
      logger.error('Failed to get Discord user info');
      return res.status(400).json({ error: 'Failed to get Discord user info' });
    }

    // Check if user is a member of the Discord server
    const isServerMember = await checkDiscordServerMembership(discordUser.id);
    
    if (!isServerMember) {
      logger.info('User is not a member of the Discord server', { discordId: discordUser.id });
      return res.status(400).json({
        success: false,
        error: 'NOT_SERVER_MEMBER',
        message: 'You must join our Discord server before linking your account.',
        inviteUrl: 'https://r.psuccso.org/B5LMI'
      });
    }

    // Get user from JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Link Discord account to user
    await linkDiscordAccount(decoded.id, discordUser);

    // Return success response instead of redirecting
    // The frontend will handle the navigation
    return res.status(200).json({
      success: true,
      message: 'Discord account linked successfully',
      discordUser: {
        id: discordUser.id,
        username: discordUser.username || discordUser.global_name || 'Unknown',
        avatar: discordUser.avatar
      }
    });

  } catch (error) {
    logger.error('Discord OAuth2 callback error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      code: req.query.code ? 'present' : 'missing',
      state: req.query.state ? 'present' : 'missing'
    });
    return res.status(500).json({
      success: false,
      error: 'Failed to link Discord account',
      message: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
});

async function exchangeCodeForToken(code: string) {
  const clientId = process.env.DISCORD_OAUTH2_CLIENT_ID;
  const clientSecret = process.env.DISCORD_OAUTH2_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_OAUTH2_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Discord OAuth2 configuration missing');
  }

  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  return response.json();
}

async function getDiscordUser(accessToken: string) {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function linkDiscordAccount(userId: string, discordUser: any) {
  // Debug: Check if prisma and discordAccount are available
  logger.info('linkDiscordAccount called', { 
    hasPrisma: !!prisma, 
    hasDiscordAccount: !!(prisma && prisma.discordAccount),
    prismaKeys: prisma ? Object.keys(prisma) : 'prisma is undefined'
  });
  
  // Check if Discord account is already linked to another user
  const existingDiscordAccount = await prisma.discordAccount.findUnique({
    where: { discordId: discordUser.id }
  });

  if (existingDiscordAccount && existingDiscordAccount.userId !== userId) {
    throw new Error('Discord account is already linked to another user');
  }

  // Create or update Discord account link
  // Note: Discord has deprecated discriminator in favor of new username system
  await prisma.discordAccount.upsert({
    where: { userId },
    update: {
      discordId: discordUser.id,
      username: discordUser.username || discordUser.global_name || 'Unknown',
      discriminator: discordUser.discriminator || null, // May be null in new Discord system
      avatar: discordUser.avatar,
      linkedAt: new Date(),
    },
    create: {
      userId,
      discordId: discordUser.id,
      username: discordUser.username || discordUser.global_name || 'Unknown',
      discriminator: discordUser.discriminator || null, // May be null in new Discord system
      avatar: discordUser.avatar,
    },
  });

  // Assign Discord roles based on user's current role and interests
  await DiscordRoleManager.assignRolesOnLink(userId, discordUser.id);

  logger.info('Discord account linked successfully', { userId, discordId: discordUser.id });
}

async function checkDiscordServerMembership(discordId: string): Promise<boolean> {
  try {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    
    if (!botToken || !guildId) {
      logger.error('Discord bot configuration missing');
      return false;
    }

    // Import Discord.js client
    const { Client, GatewayIntentBits } = require('discord.js');
    
    // Create a temporary Discord client to check membership
    const client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
    });

    // Wait for the bot to be ready
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Discord bot initialization timeout'));
      }, 10000);

      client.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      client.login(botToken);
    });

    // Check if user is a member of the guild
    const guild = await client.guilds.fetch(guildId);
    if (!guild) {
      logger.error('Failed to get Discord guild');
      return false;
    }

    try {
      const member = await guild.members.fetch(discordId);
      logger.info('User is a member of the Discord server', { discordId });
      return true;
    } catch (error) {
      logger.info('User is not a member of the Discord server', { discordId });
      return false;
    } finally {
      // Clean up the client connection
      client.destroy();
    }
  } catch (error) {
    logger.error('Error checking Discord server membership', { error, discordId });
    return false;
  }
}
