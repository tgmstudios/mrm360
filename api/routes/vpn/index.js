const express = require('express');
const router = express.Router();
const { authenticate, requirePermission } = require('../../middleware/auth');
const { vpnManager } = require('../../index');

/**
 * @swagger
 * tags:
 *   name: VPN
 *   description: VPN access management endpoints
 */

/**
 * @swagger
 * /v1/vpn/requests:
 *   get:
 *     summary: List all VPN requests
 *     tags: [VPN]
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
 *           enum: [pending, approved, denied]
 *         description: Filter by request status
 *     responses:
 *       200:
 *         description: List of VPN requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   user_id:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [pending, approved, denied]
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/requests', 
    authenticate, 
    requirePermission('vpn.approve'),
    async (req, res) => {
        try {
            const requests = await vpnManager.listVPNRequests(req.query);
            res.json(requests);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/vpn/requests/{id}:
 *   get:
 *     summary: Get VPN request details
 *     tags: [VPN]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: VPN request details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 user_id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, approved, denied]
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                 approved_by:
 *                   type: string
 *                 approved_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.get('/requests/:id', 
    authenticate, 
    requirePermission('vpn.approve'),
    async (req, res) => {
        try {
            const request = await vpnManager.getVPNRequest(req.params.id);
            if (!request) {
                return res.status(404).json({ error: 'Request not found' });
            }
            res.json(request);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/vpn/requests:
 *   post:
 *     summary: Create a new VPN request
 *     tags: [VPN]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: VPN request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.post('/requests', 
    authenticate, 
    requirePermission('vpn.request'),
    async (req, res) => {
        try {
            const requestId = await vpnManager.createVPNRequest(req.user.sub);
            res.status(201).json({ id: requestId });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/vpn/requests/{id}/approve:
 *   post:
 *     summary: Approve a VPN request
 *     tags: [VPN]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request approved successfully
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
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.post('/requests/:id/approve', 
    authenticate, 
    requirePermission('vpn.approve'),
    async (req, res) => {
        try {
            const success = await vpnManager.approveVPNRequest(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Request not found' });
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/vpn/requests/{id}/deny:
 *   post:
 *     summary: Deny a VPN request
 *     tags: [VPN]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Request denied successfully
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
 *         description: Request not found
 *       500:
 *         description: Server error
 */
router.post('/requests/:id/deny', 
    authenticate, 
    requirePermission('vpn.approve'),
    async (req, res) => {
        try {
            const success = await vpnManager.denyVPNRequest(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Request not found' });
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/vpn/revoke/{userId}:
 *   post:
 *     summary: Revoke VPN access for a user
 *     tags: [VPN]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: VPN access revoked successfully
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
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/revoke/:userId', 
    authenticate, 
    requirePermission('vpn.revoke'),
    async (req, res) => {
        try {
            const success = await vpnManager.revokeVPNAccess(req.params.userId);
            if (!success) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/vpn/status/{userId}:
 *   get:
 *     summary: Get user's VPN access status
 *     tags: [VPN]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User's VPN status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 has_access:
 *                   type: boolean
 *                 granted_at:
 *                   type: string
 *                   format: date-time
 *                 granted_by:
 *                   type: string
 *                 last_used:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/status/:userId', 
    authenticate, 
    requirePermission('vpn.view'),
    async (req, res) => {
        try {
            const status = await vpnManager.getUserVPNStatus(req.params.userId);
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router; 