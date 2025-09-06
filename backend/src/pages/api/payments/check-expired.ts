import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/authMiddleware';
import { PaymentService } from '../../../services/paymentService';
import { TaskManager } from '../../../managers/taskManager';
import { prisma } from '../../../models/prismaClient';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { immediate = false } = req.body;
  const paymentService = new PaymentService(prisma);
  const taskManager = new TaskManager();

  try {
    if (immediate) {
      // Run the check immediately
      logger.info('Running immediate payment expiration check');
      
      const results = await paymentService.checkExpiredPayments();
      
      logger.info('Immediate payment expiration check completed', {
        usersProcessed: results.length
      });
      
      return res.status(200).json({
        message: 'Payment expiration check completed',
        results: {
          usersProcessed: results.length,
          details: results
        }
      });
    } else {
      // Enqueue a background job
      logger.info('Enqueueing payment expiration check job');
      
      const jobId = await taskManager.enqueuePaymentStatusJob({
        type: 'check-expired'
      });
      
      logger.info('Payment expiration check job enqueued', { jobId });
      
      return res.status(202).json({
        message: 'Payment expiration check job enqueued',
        jobId
      });
    }
  } catch (error) {
    logger.error('Failed to check expired payments', { error });
    return res.status(500).json({ error: 'Failed to check expired payments' });
  }
}

export default withCORS(withAuth(handler));
