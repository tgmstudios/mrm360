const { db, taskQueue } = require('../utils/services.js');
const { v4: uuidv4 } = require('uuid');

class UserManager {
    async createUser(userData) {
        const userId = uuidv4();
        
        // Insert user into database
        await db.insert('users', [
            'id', 'email', 'username', 'discord_id', 'github_id',
            'ssh_key', 'newsletter_subscribed', 'enabled'
        ], [
            userId, userData.email, userData.username, userData.discord_id,
            userData.github_id, userData.ssh_key, userData.newsletter_subscribed || false,
            true
        ]);

        // Create tasks for integrations
        await taskQueue.createTask('CREATE_AUTHENTIK_USER', {
            userId,
            email: userData.email,
            username: userData.username
        });

        if (userData.newsletter_subscribed) {
            await taskQueue.createTask('SUBSCRIBE_NEWSLETTER', {
                userId,
                email: userData.email
            });
        }

        if (userData.ssh_key) {
            await taskQueue.createTask('ADD_SSH_KEY', {
                userId,
                sshKey: userData.ssh_key
            });
        }

        return userId;
    }

    async updateUser(userId, updates) {
        // Update user in database
        const fields = [];
        const values = [];
        
        Object.entries(updates).forEach(([key, value]) => {
            if (['email', 'username', 'discord_id', 'github_id', 'ssh_key', 'newsletter_subscribed'].includes(key)) {
                fields.push(key);
                values.push(value);
            }
        });

        if (fields.length > 0) {
            await db.update('users', fields, values, 'id', userId);
        }

        // Create tasks for integration updates
        if (updates.email || updates.username) {
            await taskQueue.createTask('UPDATE_AUTHENTIK_USER', {
                userId,
                email: updates.email,
                username: updates.username
            });
        }

        if (updates.newsletter_subscribed !== undefined) {
            const taskType = updates.newsletter_subscribed ? 'SUBSCRIBE_NEWSLETTER' : 'UNSUBSCRIBE_NEWSLETTER';
            await taskQueue.createTask(taskType, {
                userId,
                email: updates.email
            });
        }

        if (updates.ssh_key) {
            await taskQueue.createTask('ADD_SSH_KEY', {
                userId,
                sshKey: updates.ssh_key
            });
        }

        return true;
    }

    async deleteUser(userId) {
        // Get user data before deletion
        const user = await db.search('users', 'id', userId);
        if (!user) return false;

        // Create tasks for integration cleanup
        await taskQueue.createTask('DELETE_AUTHENTIK_USER', { userId });
        
        if (user.newsletter_subscribed) {
            await taskQueue.createTask('UNSUBSCRIBE_NEWSLETTER', {
                userId,
                email: user.email
            });
        }

        if (user.ssh_key) {
            await taskQueue.createTask('REMOVE_SSH_KEY', { userId });
        }

        // Soft delete user in database
        await db.update('users', 'deleted', true, 'id', userId);
        await db.update('users', 'enabled', false, 'id', userId);

        return true;
    }

    async getUser(userId) {
        return await db.search('users', 'id', userId);
    }

    async getUserByEmail(email) {
        return await db.search('users', 'email', email);
    }

    async getUserByDiscordId(discordId) {
        return await db.search('users', 'discord_id', discordId);
    }

    async getUserByGithubId(githubId) {
        return await db.search('users', 'github_id', githubId);
    }

    async listUsers(filters = {}) {
        let query = 'SELECT * FROM users WHERE deleted = false';
        const params = [];

        if (filters.enabled !== undefined) {
            query += ' AND enabled = ?';
            params.push(filters.enabled);
        }

        if (filters.newsletter_subscribed !== undefined) {
            query += ' AND newsletter_subscribed = ?';
            params.push(filters.newsletter_subscribed);
        }

        return await db.executeQuery(query, params);
    }
}

module.exports = new UserManager();
