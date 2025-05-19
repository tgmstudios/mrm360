const { db } = require('../index.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class InventoryManager {
    async createItem(itemData) {
        try {
            logger.debug('Creating new inventory item:', itemData);
            const itemId = uuidv4();
            
            // Insert item into database
            await db.insert('inventory', [
                'id', 'name', 'description', 'in_stock', 'created_by'
            ], [
                itemId, itemData.name, itemData.description,
                true, itemData.created_by
            ]);

            logger.info(`Created new inventory item with ID ${itemId}`);
            return itemId;
        } catch (error) {
            logger.error('Error in createItem:', error);
            throw error;
        }
    }

    async updateItem(itemId, updates) {
        try {
            logger.debug(`Updating inventory item ${itemId}:`, updates);
            const item = await db.search('inventory', 'id', itemId);
            if (!item) return false;

            // Update item in database
            const fields = [];
            const values = [];
            
            Object.entries(updates).forEach(([key, value]) => {
                if (['name', 'description', 'in_stock'].includes(key)) {
                    fields.push(key);
                    values.push(value);
                }
            });

            if (fields.length > 0) {
                await db.update('inventory', fields, values, 'id', itemId);
            }

            logger.info(`Update successful for inventory item ${itemId}`);
            return true;
        } catch (error) {
            logger.error(`Error in updateItem for id ${itemId}:`, error);
            throw error;
        }
    }

    async deleteItem(itemId) {
        try {
            logger.debug(`Deleting inventory item ${itemId}`);
            const item = await db.search('inventory', 'id', itemId);
            if (!item) return false;

            // Check if item is currently checked out
            const activeLogs = await db.executeQuery(
                'SELECT * FROM inventory_log WHERE item_id = ? AND checked_in_at IS NULL',
                [itemId]
            );

            if (activeLogs.length > 0) {
                throw new Error('Cannot delete item that is currently checked out');
            }

            // Delete item logs
            await db.executeQuery('DELETE FROM inventory_log WHERE item_id = ?', [itemId]);
            
            // Delete item
            await db.executeQuery('DELETE FROM inventory WHERE id = ?', [itemId]);

            logger.info(`Deletion successful for inventory item ${itemId}`);
            return true;
        } catch (error) {
            logger.error(`Error in deleteItem for id ${itemId}:`, error);
            throw error;
        }
    }

    async getItem(itemId) {
        try {
            logger.debug(`Fetching inventory item ${itemId}`);
            const item = await db.search('inventory', 'id', itemId);
            if (!item) return null;

            // Get current status
            const activeLog = await db.executeQuery(
                'SELECT il.*, u.email, u.username FROM inventory_log il ' +
                'JOIN users u ON il.user_id = u.id ' +
                'WHERE il.item_id = ? AND il.checked_in_at IS NULL',
                [itemId]
            );

            logger.debug(`Found inventory item ${itemId}:`, { ...item, current_status: activeLog[0] || null });
            return {
                ...item,
                current_status: activeLog[0] || null
            };
        } catch (error) {
            logger.error(`Error in getItem for id ${itemId}:`, error);
            throw error;
        }
    }

    async listItems(filters = {}) {
        try {
            logger.debug('Building inventory items query with filters:', filters);
            const query = 'SELECT * FROM inventory';
            const params = [];

            if (filters.in_stock !== undefined) {
                query += ' WHERE in_stock = ?';
                params.push(filters.in_stock);
            }

            logger.debug('Executing inventory items query:', { query, params });
            const items = await db.executeQuery(query, params);
            logger.debug(`Retrieved ${items.length} inventory items`);

            // Get current status for each item
            for (const item of items) {
                const activeLog = await db.executeQuery(
                    'SELECT il.*, u.email, u.username FROM inventory_log il ' +
                    'JOIN users u ON il.user_id = u.id ' +
                    'WHERE il.item_id = ? AND il.checked_in_at IS NULL',
                    [item.id]
                );
                item.current_status = activeLog[0] || null;
            }

            return items;
        } catch (error) {
            logger.error('Error in listItems:', error);
            throw error;
        }
    }

    async checkOutItem(itemId, userId) {
        try {
            logger.debug(`Checking out item ${itemId} for user ${userId}`);
            
            // Start transaction
            await db.beginTransaction();
            
            try {
                // Check if item exists and is in stock
                const item = await db.search('inventory', 'id', itemId);
                if (!item) return false;
                if (!item.in_stock) return false;

                // Check if item is already checked out
                const activeLog = await db.executeQuery(
                    'SELECT * FROM inventory_log WHERE item_id = ? AND checked_in_at IS NULL',
                    [itemId]
                );

                if (activeLog.length > 0) {
                    throw new Error('Item is already checked out');
                }

                // Create checkout log
                const logId = uuidv4();
                await db.insert('inventory_log', [
                    'id', 'item_id', 'user_id', 'checked_out_at'
                ], [
                    logId, itemId, userId, new Date()
                ]);

                // Update item status
                await db.update('inventory', 'in_stock', false, 'id', itemId);

                await db.commit();
                logger.info(`Successfully checked out item ${itemId} for user ${userId}`);
                return logId;
            } catch (error) {
                await db.rollback();
                throw error;
            }
        } catch (error) {
            logger.error(`Error in checkOutItem for item ${itemId}:`, error);
            throw error;
        }
    }

    async checkInItem(itemId) {
        try {
            logger.debug(`Checking in item ${itemId}`);
            
            // Start transaction
            await db.beginTransaction();
            
            try {
                // Check if item exists
                const item = await db.search('inventory', 'id', itemId);
                if (!item) return false;

                // Get active checkout log
                const activeLog = await db.executeQuery(
                    'SELECT * FROM inventory_log WHERE item_id = ? AND checked_in_at IS NULL',
                    [itemId]
                );

                if (activeLog.length === 0) {
                    throw new Error('Item is not currently checked out');
                }

                // Update log with check-in time
                await db.update('inventory_log', 'checked_in_at', new Date(), 'id', activeLog[0].id);

                // Update item status
                await db.update('inventory', 'in_stock', true, 'id', itemId);

                await db.commit();
                logger.info(`Successfully checked in item ${itemId}`);
                return true;
            } catch (error) {
                await db.rollback();
                throw error;
            }
        } catch (error) {
            logger.error(`Error in checkInItem for item ${itemId}:`, error);
            throw error;
        }
    }

    async getItemHistory(itemId) {
        try {
            logger.debug(`Fetching history for item ${itemId}`);
            const history = await db.executeQuery(
                'SELECT il.*, u.email, u.username FROM inventory_log il ' +
                'JOIN users u ON il.user_id = u.id ' +
                'WHERE il.item_id = ? ' +
                'ORDER BY il.checked_out_at DESC',
                [itemId]
            );
            logger.debug(`Found ${history.length} history entries for item ${itemId}`);
            return history;
        } catch (error) {
            logger.error(`Error in getItemHistory for item ${itemId}:`, error);
            throw error;
        }
    }

    async getUserHistory(userId) {
        try {
            logger.debug(`Fetching checkout history for user ${userId}`);
            const history = await db.executeQuery(
                'SELECT il.*, i.name as item_name, i.description as item_description ' +
                'FROM inventory_log il ' +
                'JOIN inventory i ON il.item_id = i.id ' +
                'WHERE il.user_id = ? ' +
                'ORDER BY il.checked_out_at DESC',
                [userId]
            );
            logger.debug(`Found ${history.length} history entries for user ${userId}`);
            return history;
        } catch (error) {
            logger.error(`Error in getUserHistory for user ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = new InventoryManager();
