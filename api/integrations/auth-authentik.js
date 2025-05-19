const axios = require('axios');

class AuthentikIntegration {
    constructor() {
        this.baseUrl = process.env.AUTHENTIK_URL;
        this.token = process.env.AUTHENTIK_TOKEN;
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    async createUser(userData) {
        try {
            const response = await this.client.post('/api/v3/core/users/', {
                username: userData.username,
                email: userData.email,
                name: userData.name,
                is_active: true
            });
            return response.data;
        } catch (error) {
            console.error('Error creating Authentik user:', error);
            throw error;
        }
    }

    async updateUser(userData) {
        try {
            const response = await this.client.patch(`/api/v3/core/users/${userData.id}/`, {
                username: userData.username,
                email: userData.email,
                name: userData.name
            });
            return response.data;
        } catch (error) {
            console.error('Error updating Authentik user:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            await this.client.delete(`/api/v3/core/users/${userId}/`);
            return true;
        } catch (error) {
            console.error('Error deleting Authentik user:', error);
            throw error;
        }
    }

    async createGroup(groupData) {
        try {
            const response = await this.client.post('/api/v3/core/groups/', {
                name: groupData.name,
                parent: groupData.parent
            });
            return response.data;
        } catch (error) {
            console.error('Error creating Authentik group:', error);
            throw error;
        }
    }

    async addUserToGroup(userId, groupId) {
        try {
            const response = await this.client.post(`/api/v3/core/groups/${groupId}/users/`, {
                user: userId
            });
            return response.data;
        } catch (error) {
            console.error('Error adding user to Authentik group:', error);
            throw error;
        }
    }

    async removeUserFromGroup(userId, groupId) {
        try {
            await this.client.delete(`/api/v3/core/groups/${groupId}/users/${userId}/`);
            return true;
        } catch (error) {
            console.error('Error removing user from Authentik group:', error);
            throw error;
        }
    }

    async getUserGroups(userId) {
        try {
            const response = await this.client.get(`/api/v3/core/users/${userId}/groups/`);
            return response.data;
        } catch (error) {
            console.error('Error getting user groups from Authentik:', error);
            throw error;
        }
    }
}

module.exports = new AuthentikIntegration();
