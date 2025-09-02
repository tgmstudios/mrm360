import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../models/prismaClient';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';
import { verifyJWT } from '../../../utils/jwt';
import { DiscordRoleManager } from '../../../utils/discordRoleManager';

export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user has Discord account linked
    const discordAccount = await prisma.discordAccount.findUnique({
      where: { userId: decoded.id }
    });

    if (!discordAccount) {
      return res.status(404).json({ error: 'No Discord account linked' });
    }

    // Remove Discord roles if needed
    await removeDiscordRoles(decoded.id, discordAccount.discordId);

    // Delete Discord account link
    await prisma.discordAccount.delete({
      where: { userId: decoded.id }
    });

    logger.info('Discord account unlinked successfully', { 
      userId: decoded.id, 
      discordId: discordAccount.discordId 
    });

    return res.status(200).json({
      success: true,
      message: 'Discord account unlinked successfully'
    });

  } catch (error) {
    logger.error('Discord unlink error', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

async function removeDiscordRoles(userId: string, discordId: string) {
  await DiscordRoleManager.removeRoles(userId, discordId);
}
