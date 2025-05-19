const axios = require('axios');

class OpenStackIntegration {
    constructor() {
        this.baseUrl = process.env.OPENSTACK_AUTH_URL;
        this.username = process.env.OPENSTACK_USERNAME;
        this.password = process.env.OPENSTACK_PASSWORD;
        this.projectId = process.env.OPENSTACK_PROJECT_ID;
        this.token = null;
        this.tokenExpiry = null;
    }

    async authenticate() {
        try {
            const response = await axios.post(`${this.baseUrl}/auth/tokens`, {
                auth: {
                    identity: {
                        methods: ['password'],
                        password: {
                            user: {
                                name: this.username,
                                password: this.password,
                                domain: { name: 'Default' }
                            }
                        }
                    },
                    scope: {
                        project: {
                            id: this.projectId
                        }
                    }
                }
            });

            this.token = response.headers['x-subject-token'];
            this.tokenExpiry = new Date(response.data.token.expires_at);
            return this.token;
        } catch (error) {
            console.error('Error authenticating with OpenStack:', error);
            throw error;
        }
    }

    getHeaders() {
        return {
            'X-Auth-Token': this.token,
            'Content-Type': 'application/json'
        };
    }

    async checkToken() {
        if (!this.token || new Date() >= this.tokenExpiry) {
            await this.authenticate();
        }
    }

    async createInstance(instanceData) {
        try {
            await this.checkToken();

            const response = await axios.post(
                `${process.env.OPENSTACK_COMPUTE_URL}/servers`,
                {
                    server: {
                        name: instanceData.name,
                        imageRef: instanceData.imageId,
                        flavorRef: instanceData.flavorId,
                        networks: instanceData.networks,
                        security_groups: instanceData.securityGroups,
                        metadata: instanceData.metadata || {},
                        user_data: instanceData.userData
                    }
                },
                { headers: this.getHeaders() }
            );

            return response.data.server;
        } catch (error) {
            console.error('Error creating OpenStack instance:', error);
            throw error;
        }
    }

    async deleteInstance(instanceId) {
        try {
            await this.checkToken();

            await axios.delete(
                `${process.env.OPENSTACK_COMPUTE_URL}/servers/${instanceId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error deleting OpenStack instance:', error);
            throw error;
        }
    }

    async getInstance(instanceId) {
        try {
            await this.checkToken();

            const response = await axios.get(
                `${process.env.OPENSTACK_COMPUTE_URL}/servers/${instanceId}`,
                { headers: this.getHeaders() }
            );

            return response.data.server;
        } catch (error) {
            console.error('Error getting OpenStack instance:', error);
            throw error;
        }
    }

    async listInstances() {
        try {
            await this.checkToken();

            const response = await axios.get(
                `${process.env.OPENSTACK_COMPUTE_URL}/servers/detail`,
                { headers: this.getHeaders() }
            );

            return response.data.servers;
        } catch (error) {
            console.error('Error listing OpenStack instances:', error);
            throw error;
        }
    }

    async createVolume(volumeData) {
        try {
            await this.checkToken();

            const response = await axios.post(
                `${process.env.OPENSTACK_VOLUME_URL}/volumes`,
                {
                    volume: {
                        size: volumeData.size,
                        name: volumeData.name,
                        description: volumeData.description,
                        volume_type: volumeData.volumeType,
                        availability_zone: volumeData.availabilityZone,
                        metadata: volumeData.metadata || {}
                    }
                },
                { headers: this.getHeaders() }
            );

            return response.data.volume;
        } catch (error) {
            console.error('Error creating OpenStack volume:', error);
            throw error;
        }
    }

    async attachVolume(instanceId, volumeId) {
        try {
            await this.checkToken();

            const response = await axios.post(
                `${process.env.OPENSTACK_COMPUTE_URL}/servers/${instanceId}/os-volume_attachments`,
                {
                    volumeAttachment: {
                        volumeId,
                        device: null // Let OpenStack choose the device name
                    }
                },
                { headers: this.getHeaders() }
            );

            return response.data.volumeAttachment;
        } catch (error) {
            console.error('Error attaching OpenStack volume:', error);
            throw error;
        }
    }

    async detachVolume(instanceId, attachmentId) {
        try {
            await this.checkToken();

            await axios.delete(
                `${process.env.OPENSTACK_COMPUTE_URL}/servers/${instanceId}/os-volume_attachments/${attachmentId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error detaching OpenStack volume:', error);
            throw error;
        }
    }

    async createNetwork(networkData) {
        try {
            await this.checkToken();

            const response = await axios.post(
                `${process.env.OPENSTACK_NETWORK_URL}/v2.0/networks`,
                {
                    network: {
                        name: networkData.name,
                        admin_state_up: true,
                        shared: networkData.shared || false,
                        tenant_id: this.projectId
                    }
                },
                { headers: this.getHeaders() }
            );

            return response.data.network;
        } catch (error) {
            console.error('Error creating OpenStack network:', error);
            throw error;
        }
    }

    async createSubnet(subnetData) {
        try {
            await this.checkToken();

            const response = await axios.post(
                `${process.env.OPENSTACK_NETWORK_URL}/v2.0/subnets`,
                {
                    subnet: {
                        network_id: subnetData.networkId,
                        cidr: subnetData.cidr,
                        ip_version: 4,
                        name: subnetData.name,
                        enable_dhcp: subnetData.enableDhcp || true,
                        dns_nameservers: subnetData.dnsNameservers || []
                    }
                },
                { headers: this.getHeaders() }
            );

            return response.data.subnet;
        } catch (error) {
            console.error('Error creating OpenStack subnet:', error);
            throw error;
        }
    }

    async createSecurityGroup(securityGroupData) {
        try {
            await this.checkToken();

            const response = await axios.post(
                `${process.env.OPENSTACK_NETWORK_URL}/v2.0/security-groups`,
                {
                    security_group: {
                        name: securityGroupData.name,
                        description: securityGroupData.description
                    }
                },
                { headers: this.getHeaders() }
            );

            // Add security group rules
            for (const rule of securityGroupData.rules) {
                await this.createSecurityGroupRule({
                    ...rule,
                    securityGroupId: response.data.security_group.id
                });
            }

            return response.data.security_group;
        } catch (error) {
            console.error('Error creating OpenStack security group:', error);
            throw error;
        }
    }

    async createSecurityGroupRule(ruleData) {
        try {
            await this.checkToken();

            const response = await axios.post(
                `${process.env.OPENSTACK_NETWORK_URL}/v2.0/security-group-rules`,
                {
                    security_group_rule: {
                        security_group_id: ruleData.securityGroupId,
                        direction: ruleData.direction,
                        ethertype: ruleData.ethertype || 'IPv4',
                        protocol: ruleData.protocol,
                        port_range_min: ruleData.portRangeMin,
                        port_range_max: ruleData.portRangeMax,
                        remote_ip_prefix: ruleData.remoteIpPrefix
                    }
                },
                { headers: this.getHeaders() }
            );

            return response.data.security_group_rule;
        } catch (error) {
            console.error('Error creating OpenStack security group rule:', error);
            throw error;
        }
    }
}

module.exports = new OpenStackIntegration();
