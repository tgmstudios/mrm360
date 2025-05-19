const axios = require('axios');

class ListmonkIntegration {
    constructor() {
        this.baseUrl = process.env.LISTMONK_URL;
        this.username = process.env.LISTMONK_USERNAME;
        this.password = process.env.LISTMONK_PASSWORD;
        this.token = null;
    }

    async authenticate() {
        try {
            const response = await axios.post(`${this.baseUrl}/api/login`, {
                username: this.username,
                password: this.password
            });
            this.token = response.data.data.token;
            return this.token;
        } catch (error) {
            console.error('Error authenticating with Listmonk:', error);
            throw error;
        }
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async createList(listData) {
        try {
            if (!this.token) await this.authenticate();

            const response = await axios.post(
                `${this.baseUrl}/api/lists`,
                {
                    name: listData.name,
                    type: 'public',
                    optin: 'single',
                    tags: listData.tags || []
                },
                { headers: this.getHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error creating Listmonk list:', error);
            throw error;
        }
    }

    async addSubscriber(listId, subscriberData) {
        try {
            if (!this.token) await this.authenticate();

            const response = await axios.post(
                `${this.baseUrl}/api/subscribers`,
                {
                    email: subscriberData.email,
                    name: subscriberData.name,
                    lists: [listId],
                    status: 'enabled',
                    attribs: subscriberData.attributes || {}
                },
                { headers: this.getHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error adding Listmonk subscriber:', error);
            throw error;
        }
    }

    async removeSubscriber(listId, email) {
        try {
            if (!this.token) await this.authenticate();

            // First get the subscriber ID
            const subscribers = await axios.get(
                `${this.baseUrl}/api/subscribers?query=${email}`,
                { headers: this.getHeaders() }
            );

            if (subscribers.data.data.results.length === 0) {
                return false;
            }

            const subscriberId = subscribers.data.data.results[0].id;

            // Remove from list
            await axios.delete(
                `${this.baseUrl}/api/lists/${listId}/subscribers/${subscriberId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error removing Listmonk subscriber:', error);
            throw error;
        }
    }

    async createCampaign(campaignData) {
        try {
            if (!this.token) await this.authenticate();

            const response = await axios.post(
                `${this.baseUrl}/api/campaigns`,
                {
                    name: campaignData.name,
                    subject: campaignData.subject,
                    lists: campaignData.listIds,
                    content_type: 'richtext',
                    body: campaignData.body,
                    send_at: campaignData.sendAt || new Date().toISOString()
                },
                { headers: this.getHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error creating Listmonk campaign:', error);
            throw error;
        }
    }

    async sendCampaign(campaignId) {
        try {
            if (!this.token) await this.authenticate();

            const response = await axios.put(
                `${this.baseUrl}/api/campaigns/${campaignId}/start`,
                {},
                { headers: this.getHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error sending Listmonk campaign:', error);
            throw error;
        }
    }

    async getCampaignStats(campaignId) {
        try {
            if (!this.token) await this.authenticate();

            const response = await axios.get(
                `${this.baseUrl}/api/campaigns/${campaignId}/stats`,
                { headers: this.getHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error getting Listmonk campaign stats:', error);
            throw error;
        }
    }

    async createTemplate(templateData) {
        try {
            if (!this.token) await this.authenticate();

            const response = await axios.post(
                `${this.baseUrl}/api/templates`,
                {
                    name: templateData.name,
                    body: templateData.body,
                    type: 'richtext'
                },
                { headers: this.getHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error creating Listmonk template:', error);
            throw error;
        }
    }

    async getSubscriberStats(listId) {
        try {
            if (!this.token) await this.authenticate();

            const response = await axios.get(
                `${this.baseUrl}/api/lists/${listId}/stats`,
                { headers: this.getHeaders() }
            );

            return response.data.data;
        } catch (error) {
            console.error('Error getting Listmonk subscriber stats:', error);
            throw error;
        }
    }
}

module.exports = new ListmonkIntegration();
