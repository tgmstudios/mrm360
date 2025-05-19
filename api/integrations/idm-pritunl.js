const axios = require('axios');
const crypto = require('crypto');

class PritunlIntegration {
    constructor() {
        this.baseUrl = process.env.PRITUNL_API_URL;
        this.token = process.env.PRITUNL_API_TOKEN;
        this.secret = process.env.PRITUNL_API_SECRET;
        this.serverId = process.env.PRITUNL_SERVER_ID;
    }

    generateAuthHeaders(method, path, timestamp) {
        const authString = `${this.token}${timestamp}${method}${path}`;
        const authSignature = crypto
            .createHmac('sha256', this.secret)
            .update(authString)
            .digest('base64');

        return {
            'Auth-Token': this.token,
            'Auth-Timestamp': timestamp,
            'Auth-Signature': authSignature,
            'Content-Type': 'application/json'
        };
    }

    async createUser(userData) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = `/server/${this.serverId}/user`;
            const headers = this.generateAuthHeaders('POST', path, timestamp);

            const response = await axios.post(`${this.baseUrl}${path}`, {
                name: userData.username,
                email: userData.email,
                type: 'client',
                disabled: false
            }, { headers });

            return response.data;
        } catch (error) {
            console.error('Error creating Pritunl user:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = `/server/${this.serverId}/user/${userId}`;
            const headers = this.generateAuthHeaders('DELETE', path, timestamp);

            await axios.delete(`${this.baseUrl}${path}`, { headers });
            return true;
        } catch (error) {
            console.error('Error deleting Pritunl user:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = `/server/${this.serverId}/user/${userId}`;
            const headers = this.generateAuthHeaders('GET', path, timestamp);

            const response = await axios.get(`${this.baseUrl}${path}`, { headers });
            return response.data;
        } catch (error) {
            console.error('Error getting Pritunl user profile:', error);
            throw error;
        }
    }

    async generateUserConfig(userId) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = `/server/${this.serverId}/user/${userId}/config`;
            const headers = this.generateAuthHeaders('GET', path, timestamp);

            const response = await axios.get(`${this.baseUrl}${path}`, { headers });
            return response.data;
        } catch (error) {
            console.error('Error generating Pritunl user config:', error);
            throw error;
        }
    }

    async disableUser(userId) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = `/server/${this.serverId}/user/${userId}`;
            const headers = this.generateAuthHeaders('PUT', path, timestamp);

            await axios.put(`${this.baseUrl}${path}`, {
                disabled: true
            }, { headers });

            return true;
        } catch (error) {
            console.error('Error disabling Pritunl user:', error);
            throw error;
        }
    }

    async enableUser(userId) {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = `/server/${this.serverId}/user/${userId}`;
            const headers = this.generateAuthHeaders('PUT', path, timestamp);

            await axios.put(`${this.baseUrl}${path}`, {
                disabled: false
            }, { headers });

            return true;
        } catch (error) {
            console.error('Error enabling Pritunl user:', error);
            throw error;
        }
    }

    async getServerStatus() {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const path = `/server/${this.serverId}`;
            const headers = this.generateAuthHeaders('GET', path, timestamp);

            const response = await axios.get(`${this.baseUrl}${path}`, { headers });
            return response.data;
        } catch (error) {
            console.error('Error getting Pritunl server status:', error);
            throw error;
        }
    }
}

module.exports = new PritunlIntegration();
