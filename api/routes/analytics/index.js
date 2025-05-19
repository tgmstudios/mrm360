const express = require('express');
const router = express.Router();
const { authenticate, requirePermission } = require('../../middleware/auth');
const { analyticsManager } = require('../../index');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and statistics endpoints
 */

/**
 * @swagger
 * /v1/analytics/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_members:
 *                   type: integer
 *                 active_members:
 *                   type: integer
 *                 total_teams:
 *                   type: integer
 *                 upcoming_events:
 *                   type: integer
 *                 inventory_items:
 *                   type: integer
 *                 checked_out_items:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/dashboard', 
    authenticate, 
    requirePermission('analytics.view'),
    async (req, res) => {
        try {
            const stats = await analyticsManager.getDashboardStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/analytics/members:
 *   get:
 *     summary: Get member statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Member statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 active:
 *                   type: integer
 *                 by_role:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 by_team:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 recent_activity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: string
 *                       action:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/members', 
    authenticate, 
    requirePermission('analytics.view'),
    async (req, res) => {
        try {
            const stats = await analyticsManager.getMemberStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/analytics/teams:
 *   get:
 *     summary: Get team statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Team statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 by_category:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 member_distribution:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 active_teams:
 *                   type: integer
 *                 recent_activity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team_id:
 *                         type: string
 *                       action:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/teams', 
    authenticate, 
    requirePermission('analytics.view'),
    async (req, res) => {
        try {
            const stats = await analyticsManager.getTeamStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/analytics/events:
 *   get:
 *     summary: Get event statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Event statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 upcoming:
 *                   type: integer
 *                 by_type:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 attendance_stats:
 *                   type: object
 *                   properties:
 *                     total_attendance:
 *                       type: integer
 *                     average_attendance:
 *                       type: number
 *                     by_event:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                 recent_events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       event_id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       attendance:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/events', 
    authenticate, 
    requirePermission('analytics.view'),
    async (req, res) => {
        try {
            const stats = await analyticsManager.getEventStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/analytics/inventory:
 *   get:
 *     summary: Get inventory statistics
 *     tags: [Analytics]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_items:
 *                   type: integer
 *                 available_items:
 *                   type: integer
 *                 checked_out_items:
 *                   type: integer
 *                 by_category:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                 checkout_stats:
 *                   type: object
 *                   properties:
 *                     total_checkouts:
 *                       type: integer
 *                     active_checkouts:
 *                       type: integer
 *                     by_user:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                 recent_activity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_id:
 *                         type: string
 *                       action:
 *                         type: string
 *                       user_id:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/inventory', 
    authenticate, 
    requirePermission('analytics.view'),
    async (req, res) => {
        try {
            const stats = await analyticsManager.getInventoryStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router; 