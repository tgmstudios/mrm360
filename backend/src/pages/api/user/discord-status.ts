import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../models/prismaClient';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';
import { verifyJWT } from '../../../utils/jwt';

export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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
      where: { userId: decoded.id },
      select: {
        id: true,
        discordId: true,
        username: true,
        discriminator: true,
        avatar: true,
        linkedAt: true,
      }
    });

    return res.status(200).json({
      hasDiscord: !!discordAccount,
      discordAccount: discordAccount || null
    });

  } catch (error) {
    logger.error('Discord status check error', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
