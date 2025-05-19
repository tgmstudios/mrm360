const axios = require('axios');

class WikiJsIntegration {
    constructor() {
        this.baseUrl = process.env.WIKIJS_URL;
        this.token = process.env.WIKIJS_TOKEN;
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async createPage(pageData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/pages`,
                {
                    title: pageData.title,
                    description: pageData.description,
                    path: pageData.path,
                    content: pageData.content,
                    isPrivate: pageData.isPrivate || false,
                    isPublished: pageData.isPublished || true,
                    tags: pageData.tags || []
                },
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating Wiki.js page:', error);
            throw error;
        }
    }

    async updatePage(pageId, pageData) {
        try {
            const response = await axios.put(
                `${this.baseUrl}/api/pages/${pageId}`,
                {
                    title: pageData.title,
                    description: pageData.description,
                    path: pageData.path,
                    content: pageData.content,
                    isPrivate: pageData.isPrivate,
                    isPublished: pageData.isPublished,
                    tags: pageData.tags
                },
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error updating Wiki.js page:', error);
            throw error;
        }
    }

    async deletePage(pageId) {
        try {
            await axios.delete(
                `${this.baseUrl}/api/pages/${pageId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error deleting Wiki.js page:', error);
            throw error;
        }
    }

    async getPage(pageId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/pages/${pageId}`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error getting Wiki.js page:', error);
            throw error;
        }
    }

    async listPages() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/pages`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error listing Wiki.js pages:', error);
            throw error;
        }
    }

    async searchPages(query) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/search?q=${encodeURIComponent(query)}`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error searching Wiki.js pages:', error);
            throw error;
        }
    }

    async createAsset(assetData) {
        try {
            const formData = new FormData();
            formData.append('file', assetData.file);
            formData.append('name', assetData.name);
            formData.append('description', assetData.description || '');
            formData.append('isPrivate', assetData.isPrivate || false);

            const response = await axios.post(
                `${this.baseUrl}/api/assets`,
                formData,
                {
                    headers: {
                        ...this.getHeaders(),
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating Wiki.js asset:', error);
            throw error;
        }
    }

    async deleteAsset(assetId) {
        try {
            await axios.delete(
                `${this.baseUrl}/api/assets/${assetId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error deleting Wiki.js asset:', error);
            throw error;
        }
    }

    async getAsset(assetId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/assets/${assetId}`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error getting Wiki.js asset:', error);
            throw error;
        }
    }

    async listAssets() {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/assets`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error listing Wiki.js assets:', error);
            throw error;
        }
    }

    async createComment(pageId, commentData) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/api/pages/${pageId}/comments`,
                {
                    content: commentData.content,
                    isPrivate: commentData.isPrivate || false
                },
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error creating Wiki.js comment:', error);
            throw error;
        }
    }

    async deleteComment(pageId, commentId) {
        try {
            await axios.delete(
                `${this.baseUrl}/api/pages/${pageId}/comments/${commentId}`,
                { headers: this.getHeaders() }
            );

            return true;
        } catch (error) {
            console.error('Error deleting Wiki.js comment:', error);
            throw error;
        }
    }

    async getComments(pageId) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/api/pages/${pageId}/comments`,
                { headers: this.getHeaders() }
            );

            return response.data;
        } catch (error) {
            console.error('Error getting Wiki.js comments:', error);
            throw error;
        }
    }
}

module.exports = new WikiJsIntegration();
