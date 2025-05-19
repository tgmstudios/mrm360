const express = require('express');
const router = express.Router();
const { authenticate, requirePermission } = require('../../middleware/auth');
const { inventoryManager } = require('../../index');
const logger = require('../../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management endpoints
 */

/**
 * @swagger
 * /v1/inventory:
 *   get:
 *     summary: List all inventory items
 *     tags: [Inventory]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering items
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, checked_out]
 *         description: Filter by item status
 *     responses:
 *       200:
 *         description: List of inventory items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                     enum: [available, checked_out]
 *                   created_by:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/', 
    authenticate, 
    requirePermission('inventory.view'),
    async (req, res) => {
        try {
            logger.info(`Listing inventory items with filters: ${JSON.stringify(req.query)}`);
            const items = await inventoryManager.listItems(req.query);
            logger.debug(`Found ${items.length} inventory items`);
            res.json(items);
        } catch (error) {
            logger.error(`Error listing inventory items: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/inventory/{id}:
 *   get:
 *     summary: Get item details
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [available, checked_out]
 *                 created_by:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 current_checkout:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: string
 *                     checked_out_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.get('/:id', 
    authenticate, 
    requirePermission('inventory.view'),
    async (req, res) => {
        try {
            logger.info(`Fetching inventory item: ${req.params.id}`);
            const item = await inventoryManager.getItem(req.params.id);
            if (!item) {
                logger.warn(`Inventory item not found: ${req.params.id}`);
                return res.status(404).json({ error: 'Item not found' });
            }
            logger.debug(`Found inventory item: ${JSON.stringify(item)}`);
            res.json(item);
        } catch (error) {
            logger.error(`Error fetching inventory item ${req.params.id}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item created successfully
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
router.post('/', 
    authenticate, 
    requirePermission('inventory.create'),
    async (req, res) => {
        try {
            logger.info(`Creating new inventory item: ${JSON.stringify(req.body)}`);
            const itemId = await inventoryManager.createItem({
                ...req.body,
                created_by: req.user.sub
            });
            logger.info(`Created inventory item with ID: ${itemId}`);
            res.status(201).json({ id: itemId });
        } catch (error) {
            logger.error(`Error creating inventory item: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/inventory/{id}:
 *   put:
 *     summary: Update inventory item
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
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
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.put('/:id', 
    authenticate, 
    requirePermission('inventory.edit'),
    async (req, res) => {
        try {
            logger.info(`Updating inventory item ${req.params.id}: ${JSON.stringify(req.body)}`);
            const success = await inventoryManager.updateItem(req.params.id, req.body);
            if (!success) {
                logger.warn(`Inventory item not found for update: ${req.params.id}`);
                return res.status(404).json({ error: 'Item not found' });
            }
            logger.info(`Updated inventory item: ${req.params.id}`);
            res.json({ success: true });
        } catch (error) {
            logger.error(`Error updating inventory item ${req.params.id}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/inventory/{id}:
 *   delete:
 *     summary: Delete inventory item
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item deleted successfully
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
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', 
    authenticate, 
    requirePermission('inventory.delete'),
    async (req, res) => {
        try {
            logger.info(`Deleting inventory item: ${req.params.id}`);
            const success = await inventoryManager.deleteItem(req.params.id);
            if (!success) {
                logger.warn(`Inventory item not found for deletion: ${req.params.id}`);
                return res.status(404).json({ error: 'Item not found' });
            }
            logger.info(`Deleted inventory item: ${req.params.id}`);
            res.json({ success: true });
        } catch (error) {
            logger.error(`Error deleting inventory item ${req.params.id}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/inventory/{id}/checkout:
 *   post:
 *     summary: Check out an item
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item checked out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Checkout log ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.post('/:id/checkout', 
    authenticate, 
    requirePermission('inventory.checkout'),
    async (req, res) => {
        try {
            logger.info(`Checking out inventory item ${req.params.id} for user ${req.user.sub}`);
            const logId = await inventoryManager.checkOutItem(req.params.id, req.user.sub);
            logger.info(`Checked out inventory item ${req.params.id}, log ID: ${logId}`);
            res.json({ id: logId });
        } catch (error) {
            logger.error(`Error checking out inventory item ${req.params.id}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/inventory/{id}/checkin:
 *   post:
 *     summary: Check in an item
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item checked in successfully
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
 *         description: Item not found
 *       500:
 *         description: Server error
 */
router.post('/:id/checkin', 
    authenticate, 
    requirePermission('inventory.checkin'),
    async (req, res) => {
        try {
            logger.info(`Checking in inventory item: ${req.params.id}`);
            const success = await inventoryManager.checkInItem(req.params.id);
            if (!success) {
                logger.warn(`Inventory item not found for check-in: ${req.params.id}`);
                return res.status(404).json({ error: 'Item not found' });
            }
            logger.info(`Checked in inventory item: ${req.params.id}`);
            res.json({ success: true });
        } catch (error) {
            logger.error(`Error checking in inventory item ${req.params.id}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/inventory/{id}/history:
 *   get:
 *     summary: Get item checkout history
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item checkout history
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
 *                   checked_out_at:
 *                     type: string
 *                     format: date-time
 *                   checked_in_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/:id/history', 
    authenticate, 
    requirePermission('inventory.view'),
    async (req, res) => {
        try {
            logger.info(`Fetching history for inventory item: ${req.params.id}`);
            const history = await inventoryManager.getItemHistory(req.params.id);
            logger.debug(`Found ${history.length} history entries for item ${req.params.id}`);
            res.json(history);
        } catch (error) {
            logger.error(`Error fetching history for inventory item ${req.params.id}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

/**
 * @swagger
 * /v1/inventory/user/{userId}/history:
 *   get:
 *     summary: Get user's checkout history
 *     tags: [Inventory]
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
 *         description: User's checkout history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   item_id:
 *                     type: string
 *                   item_name:
 *                     type: string
 *                   checked_out_at:
 *                     type: string
 *                     format: date-time
 *                   checked_in_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/user/:userId/history', 
    authenticate, 
    requirePermission('inventory.view'),
    async (req, res) => {
        try {
            logger.info(`Fetching checkout history for user: ${req.params.userId}`);
            const history = await inventoryManager.getUserHistory(req.params.userId);
            logger.debug(`Found ${history.length} history entries for user ${req.params.userId}`);
            res.json(history);
        } catch (error) {
            logger.error(`Error fetching history for user ${req.params.userId}: ${error.message}`);
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router; 