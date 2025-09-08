import { NextApiRequest, NextApiResponse } from 'next';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { backgroundTaskService } from '@/services/backgroundTaskService';
import { logger } from '@/utils/logger';
import { handleApiError, ApiError } from '@/middleware/errorHandler';

/**
 * @swagger
 * /api/admin/background-tasks/{taskId}:
 *   get:
 *     summary: Get a specific background task by ID
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: Background task ID
 *     responses:
 *       200:
 *         description: Background task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     type:
 *                       type: string
 *                     status:
 *                       type: string
 *                     data:
 *                       type: object
 *                     result:
 *                       type: object
 *                     error:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                     startedAt:
 *                       type: string
 *                     completedAt:
 *                       type: string
 *       404:
 *         description: Task not found
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
    const { taskId } = req.query;

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }

    logger.info('Getting background task', { taskId });

    const task = await backgroundTaskService.getTask(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      task,
      message: 'Background task retrieved successfully'
    });
  } catch (error) {
    logger.error('Error getting background task', { error });
    
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
