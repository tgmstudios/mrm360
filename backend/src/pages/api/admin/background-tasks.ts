import { NextApiRequest, NextApiResponse } from 'next';
import { withCORS } from '../../../middleware/corsMiddleware';
import { withAuth } from '../../../middleware/authMiddleware';
import { withPermissions } from '../../../middleware/permissionMiddleware';
import { backgroundTaskService } from '../../../services/backgroundTaskService';
import { logger } from '../../../utils/logger';
import { handleApiError, ApiError } from '../../../middleware/errorHandler';

/**
 * @swagger
 * /api/admin/background-tasks:
 *   get:
 *     summary: Get background tasks
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter tasks by type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, completed, failed]
 *         description: Filter tasks by status
 *     responses:
 *       200:
 *         description: Background tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       data:
 *                         type: object
 *                       result:
 *                         type: object
 *                       error:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       startedAt:
 *                         type: string
 *                       completedAt:
 *                         type: string
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new background task
 *     tags: [Admin]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - data
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [authentik_group_membership, authentik_user_sync]
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Background task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 taskId:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - invalid task data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const { type, status } = req.query;
      
      logger.info('Getting background tasks', { type, status });

      let tasks = await backgroundTaskService.getTasks(type as string);
      
      if (status) {
        tasks = tasks.filter(task => task.status === status);
      }

      res.status(200).json({
        success: true,
        tasks,
        count: tasks.length,
        message: `Retrieved ${tasks.length} background tasks`
      });
    } else if (req.method === 'POST') {
      const { type, data } = req.body;

      if (!type || !data) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: type and data'
        });
      }

      logger.info('Creating background task', { type, data });

      const taskId = await backgroundTaskService.addTask(type, data);

      res.status(200).json({
        success: true,
        taskId,
        message: 'Background task created successfully'
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Error in background tasks API', { error });
    
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
