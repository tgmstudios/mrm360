const { db, taskQueue } = require('../index.js');
const { v4: uuidv4 } = require('uuid');

class VPNManager {
    async createVPNRequest(userId) {
        // Check if user exists
        const user = await db.search('users', 'id', userId);
        if (!user) return false;

        // Check if user already has a pending or approved request
        const existingRequest = await db.executeQuery(
            'SELECT * FROM vpn_requests WHERE user_id = ? AND status IN (?, ?)',
            [userId, 'pending', 'approved']
        );

        if (existingRequest.length > 0) {
            throw new Error('User already has an active VPN request');
        }

        // Create VPN request
        const requestId = uuidv4();
        await db.insert('vpn_requests', [
            'id', 'user_id', 'status'
        ], [
            requestId, userId, 'pending'
        ]);

        return requestId;
    }

    async approveVPNRequest(requestId) {
        // Get request
        const request = await db.search('vpn_requests', 'id', requestId);
        if (!request) return false;
        if (request.status !== 'pending') {
            throw new Error('Request is not pending');
        }

        // Update request status
        await db.update('vpn_requests', 'status', 'approved', 'id', requestId);

        // Create task to create Pritunl user
        await taskQueue.createTask('CREATE_PRITUNL_USER', {
            userId: request.user_id
        });

        return true;
    }

    async denyVPNRequest(requestId) {
        // Get request
        const request = await db.search('vpn_requests', 'id', requestId);
        if (!request) return false;
        if (request.status !== 'pending') {
            throw new Error('Request is not pending');
        }

        // Update request status
        await db.update('vpn_requests', 'status', 'denied', 'id', requestId);

        return true;
    }

    async revokeVPNAccess(userId) {
        // Get user's approved request
        const request = await db.executeQuery(
            'SELECT * FROM vpn_requests WHERE user_id = ? AND status = ?',
            [userId, 'approved']
        );

        if (request.length === 0) {
            throw new Error('User does not have approved VPN access');
        }

        // Create task to delete Pritunl user
        await taskQueue.createTask('DELETE_PRITUNL_USER', {
            userId
        });

        // Update request status
        await db.update('vpn_requests', 'status', 'denied', 'id', request[0].id);

        return true;
    }

    async getVPNRequest(requestId) {
        const request = await db.search('vpn_requests', 'id', requestId);
        if (!request) return null;

        // Get user info
        const user = await db.search('users', 'id', request.user_id);
        if (user) {
            request.user = {
                email: user.email,
                username: user.username
            };
        }

        return request;
    }

    async listVPNRequests(filters = {}) {
        let query = 'SELECT vr.*, u.email, u.username FROM vpn_requests vr ' +
                   'JOIN users u ON vr.user_id = u.id';
        const params = [];

        if (filters.status) {
            query += ' WHERE vr.status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY vr.created_at DESC';

        return await db.executeQuery(query, params);
    }

    async getUserVPNStatus(userId) {
        const request = await db.executeQuery(
            'SELECT * FROM vpn_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );

        return request[0] || null;
    }
}

module.exports = new VPNManager();
