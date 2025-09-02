import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../models/prismaClient';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';
import { verifyJWT } from '../../../utils/jwt';
import { ListMonkServiceFactory } from '../../../services/listmonkServiceFactory';

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

    const { subscribe } = req.body;

    // Validate input
    if (typeof subscribe !== 'boolean') {
      return res.status(400).json({ error: 'Missing or invalid subscribe field' });
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize ListMonk service
    const listmonkService = ListMonkServiceFactory.createServiceFromEnv();

    if (subscribe) {
      // Subscribe to newsletter using async queue
      await listmonkService.subscribeToListAsync(
        process.env.LISTMONK_NEWSLETTER_LIST_ID!,
        user.email,
        {
          firstName: user.firstName,
          lastName: user.lastName,
          displayName: user.displayName || `${user.firstName} ${user.lastName}`
        },
        {
          priority: 'normal',
          retryOnFailure: true,
          notifyOnFailure: false
        }
      );
      
      logger.info('User newsletter subscription queued', { userId: decoded.id, email: user.email });
    } else {
      // Unsubscribe from newsletter using async queue
      await listmonkService.unsubscribeFromListAsync(
        process.env.LISTMONK_NEWSLETTER_LIST_ID!,
        user.email,
        {
          priority: 'normal',
          retryOnFailure: true,
          notifyOnFailure: false
        }
      );
      
      logger.info('User newsletter unsubscription queued', { userId: decoded.id, email: user.email });
    }

    return res.status(200).json({
      success: true,
      message: subscribe ? 'Subscribed to newsletter' : 'Unsubscribed from newsletter'
    });

  } catch (error) {
    logger.error('Newsletter preference update error', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
