import { NextApiRequest, NextApiResponse } from 'next';
import { withCORS } from '../../../middleware/corsMiddleware';
import { logger } from '../../../utils/logger';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear session
 *     tags: [Authentication]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Frontend will handle clearing the JWT token
    // Backend just returns success
    logger.info('Logout request received');
    
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
});
