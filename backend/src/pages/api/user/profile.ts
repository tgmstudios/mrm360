import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../middleware/authMiddleware';
import { logger } from '../../utils/logger';

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       500:
 *         description: Internal server error
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user } = req;
    
    logger.info('User profile accessed', { userId: user.id, email: user.email });
    
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    logger.error('Failed to get user profile', { error, userId: req.user.id });
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve profile' 
    });
  }
}

export default withAuth(handler);
