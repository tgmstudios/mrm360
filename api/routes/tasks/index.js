const express = require('express');
const router = express.Router();
const { authenticate, requirePermission } = require('../../middleware/auth');
const { taskQueue } = require('../../index');

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task queue management endpoints
 */

/**
 * @swagger
 * /v1/tasks:
 *   get:
 *     summary: List all tasks
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, running, completed, failed, cancelled]
 *         description: Filter by task status
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [pending, running, completed, failed, cancelled]
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   started_at:
 *                     type: string
 *                     format: date-time
 *                   completed_at:
 *                     type: string
 *                     format: date-time
 *                   error:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', 
    authenticate, 
    requirePermission('admin'),
    async (req, res) => {
        try {
            const tasks = await taskQueue.listTasks(req.query);
            res.json(tasks);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/tasks/{id}:
 *   get:
 *     summary: Get task details
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, running, completed, failed, cancelled]
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 started_at:
 *                   type: string
 *                   format: date-time
 *                 completed_at:
 *                   type: string
 *                   format: date-time
 *                 error:
 *                   type: string
 *                 progress:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 100
 *                 result:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.get('/:id', 
    authenticate, 
    requirePermission('admin'),
    async (req, res) => {
        try {
            const task = await taskQueue.getTask(req.params.id);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json(task);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/tasks/{id}/retry:
 *   post:
 *     summary: Retry a failed task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retry initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.post('/:id/retry', 
    authenticate, 
    requirePermission('admin'),
    async (req, res) => {
        try {
            const success = await taskQueue.retryTask(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/tasks/{id}/cancel:
 *   post:
 *     summary: Cancel a task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */
router.post('/:id/cancel', 
    authenticate, 
    requirePermission('admin'),
    async (req, res) => {
        try {
            const success = await taskQueue.cancelTask(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/tasks/status/queue:
 *   get:
 *     summary: Get task queue status
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Task queue status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_tasks:
 *                   type: integer
 *                 pending_tasks:
 *                   type: integer
 *                 running_tasks:
 *                   type: integer
 *                 completed_tasks:
 *                   type: integer
 *                 failed_tasks:
 *                   type: integer
 *                 cancelled_tasks:
 *                   type: integer
 *                 queue_size:
 *                   type: integer
 *                 active_workers:
 *                   type: integer
 *                 average_processing_time:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/status/queue', 
    authenticate, 
    requirePermission('admin'),
    async (req, res) => {
        try {
            const status = await taskQueue.getQueueStatus();
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router; 