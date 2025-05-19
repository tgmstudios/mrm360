const axios = require('axios');
const crypto = require('crypto');

class OciIntegration {
    constructor() {
        this.baseUrl = process.env.OCI_API_URL;
        this.tenancyId = process.env.OCI_TENANCY_ID;
        this.userId = process.env.OCI_USER_ID;
        this.fingerprint = process.env.OCI_FINGERPRINT;
        this.privateKey = process.env.OCI_PRIVATE_KEY;
        this.compartmentId = process.env.OCI_COMPARTMENT_ID;
    }

    generateSignature(method, path, headers, body = '') {
        const signingString = [
            method,
            headers['host'],
            headers['date'],
            headers['x-content-sha256'],
            headers['content-type'],
            path
        ].join('\n');

        const signature = crypto
            .createSign('RSA-SHA256')
            .update(signingString)
            .sign(this.privateKey, 'base64');

        return signature;
    }

    getHeaders(method, path, body = '') {
        const date = new Date().toUTCString();
        const contentSha256 = crypto
            .createHash('sha256')
            .update(body)
            .digest('base64');

        const headers = {
            'date': date,
            'host': new URL(this.baseUrl).host,
            'content-type': 'application/json',
            'x-content-sha256': contentSha256
        };

        const signature = this.generateSignature(method, path, headers, body);

        return {
            ...headers,
            'Authorization': `Signature version="1",keyId="${this.tenancyId}/${this.userId}/${this.fingerprint}",algorithm="rsa-sha256",headers="(request-target) host date x-content-sha256 content-type",signature="${signature}"`
        };
    }

    async createInstance(instanceData) {
        try {
            const path = `/20160918/instances/`;
            const body = JSON.stringify({
                compartmentId: this.compartmentId,
                displayName: instanceData.name,
                availabilityDomain: instanceData.availabilityDomain,
                shape: instanceData.shape,
                subnetId: instanceData.subnetId,
                imageId: instanceData.imageId,
                metadata: instanceData.metadata || {},
                freeformTags: instanceData.tags || {}
            });

            const response = await axios.post(
                `${this.baseUrl}${path}`,
                body,
                { headers: this.getHeaders('POST', path, body) }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating OCI instance:', error);
            throw error;
        }
    }

    async terminateInstance(instanceId) {
        try {
            const path = `/20160918/instances/${instanceId}`;
            const body = JSON.stringify({
                action: 'TERMINATE',
                preserveBootVolume: false
            });

            await axios.post(
                `${this.baseUrl}${path}`,
                body,
                { headers: this.getHeaders('POST', path, body) }
            );

            return true;
        } catch (error) {
            console.error('Error terminating OCI instance:', error);
            throw error;
        }
    }

    async getInstance(instanceId) {
        try {
            const path = `/20160918/instances/${instanceId}`;
            const response = await axios.get(
                `${this.baseUrl}${path}`,
                { headers: this.getHeaders('GET', path) }
            );

            return response.data;
        } catch (error) {
            console.error('Error getting OCI instance:', error);
            throw error;
        }
    }

    async listInstances() {
        try {
            const path = `/20160918/instances/`;
            const response = await axios.get(
                `${this.baseUrl}${path}?compartmentId=${this.compartmentId}`,
                { headers: this.getHeaders('GET', path) }
            );

            return response.data;
        } catch (error) {
            console.error('Error listing OCI instances:', error);
            throw error;
        }
    }

    async createVolume(volumeData) {
        try {
            const path = `/20160918/volumes/`;
            const body = JSON.stringify({
                compartmentId: this.compartmentId,
                availabilityDomain: volumeData.availabilityDomain,
                displayName: volumeData.name,
                sizeInGBs: volumeData.sizeInGBs,
                vpusPerGB: volumeData.vpusPerGB || 10,
                freeformTags: volumeData.tags || {}
            });

            const response = await axios.post(
                `${this.baseUrl}${path}`,
                body,
                { headers: this.getHeaders('POST', path, body) }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating OCI volume:', error);
            throw error;
        }
    }

    async attachVolume(instanceId, volumeId) {
        try {
            const path = `/20160918/volumeAttachments/`;
            const body = JSON.stringify({
                instanceId,
                volumeId,
                type: 'paravirtualized',
                displayName: `attachment-${instanceId}-${volumeId}`
            });

            const response = await axios.post(
                `${this.baseUrl}${path}`,
                body,
                { headers: this.getHeaders('POST', path, body) }
            );

            return response.data;
        } catch (error) {
            console.error('Error attaching OCI volume:', error);
            throw error;
        }
    }

    async detachVolume(attachmentId) {
        try {
            const path = `/20160918/volumeAttachments/${attachmentId}`;
            const body = JSON.stringify({
                action: 'DETACH'
            });

            await axios.post(
                `${this.baseUrl}${path}`,
                body,
                { headers: this.getHeaders('POST', path, body) }
            );

            return true;
        } catch (error) {
            console.error('Error detaching OCI volume:', error);
            throw error;
        }
    }

    async createVCN(vcnData) {
        try {
            const path = `/20160918/vcns/`;
            const body = JSON.stringify({
                compartmentId: this.compartmentId,
                displayName: vcnData.name,
                cidrBlock: vcnData.cidrBlock,
                dnsLabel: vcnData.dnsLabel,
                freeformTags: vcnData.tags || {}
            });

            const response = await axios.post(
                `${this.baseUrl}${path}`,
                body,
                { headers: this.getHeaders('POST', path, body) }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating OCI VCN:', error);
            throw error;
        }
    }

    async createSubnet(subnetData) {
        try {
            const path = `/20160918/subnets/`;
            const body = JSON.stringify({
                compartmentId: this.compartmentId,
                vcnId: subnetData.vcnId,
                displayName: subnetData.name,
                cidrBlock: subnetData.cidrBlock,
                availabilityDomain: subnetData.availabilityDomain,
                routeTableId: subnetData.routeTableId,
                securityListIds: subnetData.securityListIds,
                freeformTags: subnetData.tags || {}
            });

            const response = await axios.post(
                `${this.baseUrl}${path}`,
                body,
                { headers: this.getHeaders('POST', path, body) }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating OCI subnet:', error);
            throw error;
        }
    }

    async getInstanceConsoleConnection(instanceId) {
        try {
            const path = `/20160918/instanceConsoleConnections/`;
            const body = JSON.stringify({
                instanceId,
                publicKey: process.env.OCI_SSH_PUBLIC_KEY
            });

            const response = await axios.post(
                `${this.baseUrl}${path}`,
                body,
                { headers: this.getHeaders('POST', path, body) }
            );

            return response.data;
        } catch (error) {
            console.error('Error getting OCI instance console connection:', error);
            throw error;
        }
    }
}

module.exports = new OciIntegration();
