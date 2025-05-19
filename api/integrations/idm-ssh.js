const { Client } = require('ssh2');
const { promisify } = require('util');

class SSHIntegration {
    constructor() {
        this.connections = new Map();
    }

    async connect(serverData) {
        try {
            const client = new Client();
            const connectPromise = promisify(client.connect.bind(client));

            await connectPromise({
                host: serverData.host,
                port: serverData.port || 22,
                username: serverData.username,
                privateKey: serverData.privateKey,
                passphrase: serverData.passphrase,
                readyTimeout: 30000
            });

            this.connections.set(serverData.id, client);
            return client;
        } catch (error) {
            console.error('Error connecting to SSH server:', error);
            throw error;
        }
    }

    async disconnect(serverId) {
        try {
            const client = this.connections.get(serverId);
            if (client) {
                await promisify(client.end.bind(client))();
                this.connections.delete(serverId);
            }
            return true;
        } catch (error) {
            console.error('Error disconnecting from SSH server:', error);
            throw error;
        }
    }

    async executeCommand(serverId, command) {
        try {
            const client = this.connections.get(serverId);
            if (!client) {
                throw new Error('No active connection for server');
            }

            const execPromise = promisify(client.exec.bind(client));
            const stream = await execPromise(command);

            return new Promise((resolve, reject) => {
                let stdout = '';
                let stderr = '';

                stream.on('data', (data) => {
                    stdout += data.toString();
                });

                stream.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                stream.on('close', (code) => {
                    resolve({
                        code,
                        stdout,
                        stderr
                    });
                });

                stream.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (error) {
            console.error('Error executing SSH command:', error);
            throw error;
        }
    }

    async uploadFile(serverId, localPath, remotePath) {
        try {
            const client = this.connections.get(serverId);
            if (!client) {
                throw new Error('No active connection for server');
            }

            const sftp = await promisify(client.sftp.bind(client))();
            const putFile = promisify(sftp.put.bind(sftp));

            await putFile(localPath, remotePath);
            return true;
        } catch (error) {
            console.error('Error uploading file via SSH:', error);
            throw error;
        }
    }

    async downloadFile(serverId, remotePath, localPath) {
        try {
            const client = this.connections.get(serverId);
            if (!client) {
                throw new Error('No active connection for server');
            }

            const sftp = await promisify(client.sftp.bind(client))();
            const getFile = promisify(sftp.get.bind(sftp));

            await getFile(remotePath, localPath);
            return true;
        } catch (error) {
            console.error('Error downloading file via SSH:', error);
            throw error;
        }
    }

    async listDirectory(serverId, remotePath) {
        try {
            const client = this.connections.get(serverId);
            if (!client) {
                throw new Error('No active connection for server');
            }

            const sftp = await promisify(client.sftp.bind(client))();
            const readdir = promisify(sftp.readdir.bind(sftp));

            const files = await readdir(remotePath);
            return files.map(file => ({
                name: file.filename,
                type: file.attrs.isDirectory() ? 'directory' : 'file',
                size: file.attrs.size,
                modifyTime: file.attrs.mtime,
                permissions: file.attrs.mode.toString(8)
            }));
        } catch (error) {
            console.error('Error listing directory via SSH:', error);
            throw error;
        }
    }

    async createDirectory(serverId, remotePath) {
        try {
            const client = this.connections.get(serverId);
            if (!client) {
                throw new Error('No active connection for server');
            }

            const sftp = await promisify(client.sftp.bind(client))();
            const mkdir = promisify(sftp.mkdir.bind(sftp));

            await mkdir(remotePath);
            return true;
        } catch (error) {
            console.error('Error creating directory via SSH:', error);
            throw error;
        }
    }

    async removeFile(serverId, remotePath) {
        try {
            const client = this.connections.get(serverId);
            if (!client) {
                throw new Error('No active connection for server');
            }

            const sftp = await promisify(client.sftp.bind(client))();
            const unlink = promisify(sftp.unlink.bind(sftp));

            await unlink(remotePath);
            return true;
        } catch (error) {
            console.error('Error removing file via SSH:', error);
            throw error;
        }
    }

    async removeDirectory(serverId, remotePath) {
        try {
            const client = this.connections.get(serverId);
            if (!client) {
                throw new Error('No active connection for server');
            }

            const sftp = await promisify(client.sftp.bind(client))();
            const rmdir = promisify(sftp.rmdir.bind(sftp));

            await rmdir(remotePath);
            return true;
        } catch (error) {
            console.error('Error removing directory via SSH:', error);
            throw error;
        }
    }

    async getFileStats(serverId, remotePath) {
        try {
            const client = this.connections.get(serverId);
            if (!client) {
                throw new Error('No active connection for server');
            }

            const sftp = await promisify(client.sftp.bind(client))();
            const stat = promisify(sftp.stat.bind(sftp));

            const stats = await stat(remotePath);
            return {
                size: stats.size,
                modifyTime: stats.mtime,
                permissions: stats.mode.toString(8),
                isDirectory: stats.isDirectory()
            };
        } catch (error) {
            console.error('Error getting file stats via SSH:', error);
            throw error;
        }
    }
}

module.exports = new SSHIntegration();
