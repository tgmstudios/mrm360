const { createClient } = require('webdav');
const path = require('path');

class NextcloudIntegration {
    constructor() {
        this.client = createClient(process.env.NEXTCLOUD_URL, {
            username: process.env.NEXTCLOUD_USERNAME,
            password: process.env.NEXTCLOUD_PASSWORD
        });
    }

    async createTeamFolder(teamData) {
        try {
            const folderPath = `/teams/${teamData.name}`;
            await this.client.createDirectory(folderPath);

            // Create subdirectories
            await Promise.all([
                this.client.createDirectory(`${folderPath}/documents`),
                this.client.createDirectory(`${folderPath}/resources`),
                this.client.createDirectory(`${folderPath}/shared`)
            ]);

            // Set permissions
            await this.setFolderPermissions(folderPath, teamData.members);

            return folderPath;
        } catch (error) {
            console.error('Error creating Nextcloud team folder:', error);
            throw error;
        }
    }

    async updateTeamFolder(teamData) {
        try {
            const folderPath = `/teams/${teamData.name}`;
            
            // Update permissions
            await this.setFolderPermissions(folderPath, teamData.members);

            return true;
        } catch (error) {
            console.error('Error updating Nextcloud team folder:', error);
            throw error;
        }
    }

    async deleteTeamFolder(teamData) {
        try {
            const folderPath = `/teams/${teamData.name}`;
            await this.client.deleteFile(folderPath);
            return true;
        } catch (error) {
            console.error('Error deleting Nextcloud team folder:', error);
            throw error;
        }
    }

    async uploadFile(teamData, fileData) {
        try {
            const folderPath = `/teams/${teamData.name}/${fileData.category}`;
            const filePath = path.join(folderPath, fileData.name);

            await this.client.putFileContents(filePath, fileData.buffer, {
                overwrite: true
            });

            return filePath;
        } catch (error) {
            console.error('Error uploading file to Nextcloud:', error);
            throw error;
        }
    }

    async downloadFile(filePath) {
        try {
            const response = await this.client.getFileContents(filePath, {
                format: 'binary'
            });
            return response;
        } catch (error) {
            console.error('Error downloading file from Nextcloud:', error);
            throw error;
        }
    }

    async deleteFile(filePath) {
        try {
            await this.client.deleteFile(filePath);
            return true;
        } catch (error) {
            console.error('Error deleting file from Nextcloud:', error);
            throw error;
        }
    }

    async listFiles(folderPath) {
        try {
            const items = await this.client.getDirectoryContents(folderPath);
            return items.map(item => ({
                name: item.basename,
                type: item.type,
                size: item.size,
                lastModified: item.lastmod,
                path: item.filename
            }));
        } catch (error) {
            console.error('Error listing Nextcloud files:', error);
            throw error;
        }
    }

    async shareFile(filePath, shareWith, permissions = 1) {
        try {
            // 1 = read, 2 = update, 4 = create, 8 = delete, 16 = share
            const response = await this.client.createShare(filePath, {
                shareType: 0, // user
                shareWith,
                permissions
            });
            return response;
        } catch (error) {
            console.error('Error sharing Nextcloud file:', error);
            throw error;
        }
    }

    async setFolderPermissions(folderPath, members) {
        try {
            // Set base permissions for the team folder
            await this.client.setProperties(folderPath, {
                'http://owncloud.org/ns': {
                    'permissions': 'RDNVW' // Read, Download, Navigate, View, Write
                }
            });

            // Set individual member permissions
            for (const member of members) {
                await this.shareFile(folderPath, member.nextcloud_username, 31); // All permissions
            }

            return true;
        } catch (error) {
            console.error('Error setting Nextcloud folder permissions:', error);
            throw error;
        }
    }

    async searchFiles(query) {
        try {
            const response = await this.client.search(query, {
                limit: 50,
                offset: 0
            });
            return response;
        } catch (error) {
            console.error('Error searching Nextcloud files:', error);
            throw error;
        }
    }
}

module.exports = new NextcloudIntegration();
