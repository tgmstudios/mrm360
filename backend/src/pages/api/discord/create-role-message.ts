import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';
import { withCORS } from '@/middleware/corsMiddleware';
import { DiscordRoleReactionsService } from '@/services/discordRoleReactionsService';

export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if required environment variables are set
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const channelId = process.env.DISCORD_ROLE_SELECTION_CHANNEL_ID;

    if (!botToken || !guildId || !channelId) {
      return res.status(500).json({ 
        error: 'Discord configuration missing. Please check environment variables.' 
      });
    }

    // Create role reactions service
    const roleReactionsService = new DiscordRoleReactionsService({
      botToken,
      guildId,
      channelId
    });

    // Connect to Discord
    await roleReactionsService.connect();

    // Create the role selection message
    const messageId = await roleReactionsService.createRoleSelectionMessage();

    // Disconnect the service
    await roleReactionsService.disconnect();

    logger.info('Discord role selection message created successfully', { messageId });

    return res.status(200).json({
      success: true,
      message: 'Role selection message created successfully',
      data: { messageId }
    });

  } catch (error) {
    logger.error('Failed to create Discord role selection message:', error);
    return res.status(500).json({ 
      error: 'Failed to create role selection message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
