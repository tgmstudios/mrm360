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
    logger.info('Attempting to verify JWT token', { tokenLength: token.length });
    
    const decoded = verifyJWT(token);
    
    if (!decoded || !decoded.id) {
      logger.warn('JWT verification failed or invalid payload', { decoded });
      return res.status(401).json({ error: 'Invalid token' });
    }

    logger.info('JWT verified successfully', { userId: decoded.id });

    // Get user profile with class rank and interests
    logger.info('Attempting to fetch user from database', { userId: decoded.id });
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        role: true,
        paidStatus: true,
        qrCode: true,
        createdAt: true,
        updatedAt: true,
        userClassRank: {
          select: {
            classRank: true,
            createdAt: true,
            updatedAt: true
          }
        },
        userInterests: {
          select: {
            interest: true,
            createdAt: true
          }
        },
        discordAccount: {
          select: {
            discordId: true,
            username: true,
            discriminator: true,
            avatar: true,
            linkedAt: true
          }
        }
      }
    });

    if (!user) {
      logger.warn('User not found in database', { userId: decoded.id });
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info('User profile retrieved successfully', { userId: decoded.id });

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        classRank: user.userClassRank?.classRank || null,
        interests: user.userInterests.map(interest => interest.interest),
        hasDiscordLinked: !!user.discordAccount
      }
    });

  } catch (error) {
    logger.error('Get user profile error', { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
