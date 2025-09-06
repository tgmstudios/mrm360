import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/authMiddleware';
import { PaymentService } from '../../../services/paymentService';
import { prisma } from '../../../models/prismaClient';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const paymentService = new PaymentService(prisma);

  try {
    const stats = await paymentService.getPaymentStats();
    
    logger.info('Payment stats retrieved', { stats });
    
    return res.status(200).json({ stats });
  } catch (error) {
    logger.error('Failed to get payment stats', { error });
    return res.status(500).json({ error: 'Failed to retrieve payment statistics' });
  }
}

export default withCORS(withAuth(handler));
