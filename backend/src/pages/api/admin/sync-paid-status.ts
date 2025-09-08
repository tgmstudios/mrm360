import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { MemberPaidStatusService } from '@/services/memberPaidStatusService';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';
import { handleApiError, ApiError } from '@/middleware/errorHandler';

/**
 * @swagger
 * /api/admin/sync-paid-status:
 *   post:
 *     summary: Sync all user paid statuses with Authentik groups
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Sync completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 processed:
 *                   type: integer
 *                 errors:
 *                   type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Starting paid status sync with Authentik');

    const memberPaidStatusService = new MemberPaidStatusService(prisma);
    const result = await memberPaidStatusService.syncAllPaidStatuses();

    logger.info('Paid status sync completed', result);

    res.status(200).json({
      success: true,
      processed: result.processed,
      errors: result.errors,
      message: `Sync completed: ${result.processed} users processed, ${result.errors} errors`
    });
  } catch (error) {
    logger.error('Error in paid status sync', { error });
    
    if (error instanceof Error && (error as ApiError).statusCode) {
      return handleApiError(error, req, res);
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Apply middleware: CORS, authentication then permissions (admin only)
export default withCORS(
  withAuth(
    withPermissions(handler, ['admin'])
  )
);
