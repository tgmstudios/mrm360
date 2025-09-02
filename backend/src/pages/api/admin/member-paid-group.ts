import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../models/prismaClient';
import { MemberPaidStatusService } from '../../../services/memberPaidStatusService';
import { withCORS } from '../../../middleware/corsMiddleware';
import { withAuth } from '../../../middleware/authMiddleware';
import { withPermissions } from '../../../middleware/permissionMiddleware';
import { logger } from '../../../utils/logger';
import { handleApiError, ApiError } from '../../../middleware/errorHandler';

/**
 * @swagger
 * /api/admin/member-paid-group:
 *   get:
 *     summary: Get current members of the "member-paid" Authentik group
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Group members retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 members:
 *                   type: array
 *                   items:
 *                     type: string
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Getting member-paid group members');

    const memberPaidStatusService = new MemberPaidStatusService(prisma);
    const memberIds = await memberPaidStatusService.getMemberPaidGroupMembers();

    // Get user details for the member IDs
    const users = await prisma.user.findMany({
      where: {
        authentikId: {
          in: memberIds
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true,
        authentikId: true,
        paidStatus: true
      }
    });

    logger.info('Retrieved member-paid group members', { count: users.length });

    res.status(200).json({
      success: true,
      members: users,
      count: users.length,
      message: `Found ${users.length} members in the "member-paid" group`
    });
  } catch (error) {
    logger.error('Error getting member-paid group members', { error });
    
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
