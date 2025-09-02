import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../models/prismaClient';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';
import { verifyJWT } from '../../../utils/jwt';
import { ListMonkServiceFactory } from '../../../services/listmonkServiceFactory';

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

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize ListMonk service
    const listmonkService = ListMonkServiceFactory.createServiceFromEnv();

    // Check if user is subscribed to the newsletter
    let subscribed = false;
    try {
      const subscriber = await listmonkService.getSubscriberByEmail(user.email);
      if (subscriber) {
        // Check if user is subscribed to the newsletter list
        subscribed = subscriber.lists.some(listId => listId === parseInt(process.env.LISTMONK_NEWSLETTER_LIST_ID!));
      }
    } catch (error) {
      logger.warn('Failed to check newsletter status from ListMonk', { error, userId: decoded.id });
      // If we can't check from ListMonk, assume not subscribed
      subscribed = false;
    }

    return res.status(200).json({
      subscribed
    });

  } catch (error) {
    logger.error('Newsletter status check error', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
