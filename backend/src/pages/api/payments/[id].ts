import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '../../../middleware/authMiddleware';
import { PaymentService } from '../../../services/paymentService';
import { prisma } from '../../../models/prismaClient';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';
import { PaymentStatus } from '@prisma/client';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const paymentService = new PaymentService(prisma);

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Payment ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetPayment(req, res, paymentService, id);
      case 'PUT':
        return await handleUpdatePayment(req, res, paymentService, id);
      case 'DELETE':
        return await handleDeletePayment(req, res, paymentService, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Payment API error', { error, method: req.method, paymentId: id });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetPayment(req: NextApiRequest, res: NextApiResponse, paymentService: PaymentService, paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            paidStatus: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    return res.status(200).json({ payment });
  } catch (error) {
    logger.error('Failed to get payment', { error, paymentId });
    return res.status(500).json({ error: 'Failed to retrieve payment' });
  }
}

async function handleUpdatePayment(req: NextApiRequest, res: NextApiResponse, paymentService: PaymentService, paymentId: string) {
  const { status, transactionId } = req.body;

  // Validate status if provided
  if (status && !Object.values(PaymentStatus).includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid payment status' 
    });
  }

  try {
    let payment;

    switch (status) {
      case PaymentStatus.COMPLETED:
        payment = await paymentService.completePayment(paymentId, transactionId);
        break;
      
      case PaymentStatus.FAILED:
        payment = await paymentService.failPayment(paymentId, req.body.reason);
        break;
      
      default:
        // For other status updates, use direct Prisma update
        payment = await prisma.payment.update({
          where: { id: paymentId },
          data: { status, transactionId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        });
    }

    logger.info('Payment updated', { 
      paymentId, 
      status, 
      transactionId 
    });

    return res.status(200).json({ payment });
  } catch (error) {
    logger.error('Failed to update payment', { error, paymentId, status });
    return res.status(500).json({ error: 'Failed to update payment' });
  }
}

async function handleDeletePayment(req: NextApiRequest, res: NextApiResponse, paymentService: PaymentService, paymentId: string) {
  try {
    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { id: true, userId: true, status: true }
    });

    if (!existingPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Only allow deletion of pending or failed payments
    if (existingPayment.status === PaymentStatus.COMPLETED) {
      return res.status(400).json({ 
        error: 'Cannot delete completed payments' 
      });
    }

    await prisma.payment.delete({
      where: { id: paymentId }
    });

    logger.info('Payment deleted', { paymentId });

    return res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete payment', { error, paymentId });
    return res.status(500).json({ error: 'Failed to delete payment' });
  }
}

export default withCORS(withAuth(handler));
