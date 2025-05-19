const axios = require('axios');

class CloudflareIntegration {
    constructor() {
        this.baseUrl = 'https://api.cloudflare.com/client/v4';
        this.token = process.env.CLOUDFLARE_TOKEN;
        this.zoneId = process.env.CLOUDFLARE_ZONE_ID;
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async createDNSRecord(recordData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/zones/${this.zoneId}/dns_records`,
                {
                    type: recordData.type,
                    name: recordData.name,
                    content: recordData.content,
                    ttl: recordData.ttl || 1,
                    proxied: recordData.proxied || true
                },
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error creating Cloudflare DNS record:', error);
            throw error;
        }
    }

    async updateDNSRecord(recordId, recordData) {
        try {
            const response = await axios.put(
                `${this.baseUrl}/zones/${this.zoneId}/dns_records/${recordId}`,
                {
                    type: recordData.type,
                    name: recordData.name,
                    content: recordData.content,
                    ttl: recordData.ttl || 1,
                    proxied: recordData.proxied || true
                },
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error updating Cloudflare DNS record:', error);
            throw error;
        }
    }

    async deleteDNSRecord(recordId) {
        try {
            await axios.delete(
                `${this.baseUrl}/zones/${this.zoneId}/dns_records/${recordId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error deleting Cloudflare DNS record:', error);
            throw error;
        }
    }

    async getDNSRecords() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/zones/${this.zoneId}/dns_records`,
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error getting Cloudflare DNS records:', error);
            throw error;
        }
    }

    async createPageRule(ruleData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/zones/${this.zoneId}/pagerules`,
                {
                    targets: ruleData.targets,
                    actions: ruleData.actions,
                    priority: ruleData.priority || 1,
                    status: 'active'
                },
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error creating Cloudflare page rule:', error);
            throw error;
        }
    }

    async updatePageRule(ruleId, ruleData) {
        try {
            const response = await axios.put(
                `${this.baseUrl}/zones/${this.zoneId}/pagerules/${ruleId}`,
                {
                    targets: ruleData.targets,
                    actions: ruleData.actions,
                    priority: ruleData.priority || 1,
                    status: 'active'
                },
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error updating Cloudflare page rule:', error);
            throw error;
        }
    }

    async deletePageRule(ruleId) {
        try {
            await axios.delete(
                `${this.baseUrl}/zones/${this.zoneId}/pagerules/${ruleId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error deleting Cloudflare page rule:', error);
            throw error;
        }
    }

    async getPageRules() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/zones/${this.zoneId}/pagerules`,
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error getting Cloudflare page rules:', error);
            throw error;
        }
    }

    async createFirewallRule(ruleData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/zones/${this.zoneId}/firewall/rules`,
                {
                    description: ruleData.description,
                    action: ruleData.action,
                    filter: {
                        expression: ruleData.expression,
                        paused: false
                    }
                },
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error creating Cloudflare firewall rule:', error);
            throw error;
        }
    }

    async updateFirewallRule(ruleId, ruleData) {
        try {
            const response = await axios.put(
                `${this.baseUrl}/zones/${this.zoneId}/firewall/rules/${ruleId}`,
                {
                    description: ruleData.description,
                    action: ruleData.action,
                    filter: {
                        expression: ruleData.expression,
                        paused: false
                    }
                },
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error updating Cloudflare firewall rule:', error);
            throw error;
        }
    }

    async deleteFirewallRule(ruleId) {
        try {
            await axios.delete(
                `${this.baseUrl}/zones/${this.zoneId}/firewall/rules/${ruleId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error deleting Cloudflare firewall rule:', error);
            throw error;
        }
    }

    async getFirewallRules() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/zones/${this.zoneId}/firewall/rules`,
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error getting Cloudflare firewall rules:', error);
            throw error;
        }
    }

    async getZoneAnalytics() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/zones/${this.zoneId}/analytics/dashboard`,
                { headers: this.getHeaders() }
            );

            return response.data.result;
        } catch (error) {
            console.error('Error getting Cloudflare zone analytics:', error);
            throw error;
        }
    }
}

module.exports = new CloudflareIntegration();
