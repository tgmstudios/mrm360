const axios = require('axios');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class ConsoleIntegration {
    constructor() {
        this.baseUrl = process.env.CONSOLE_URL;
        this.token = process.env.CONSOLE_TOKEN;
    }

    getHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    async executeCommand(command) {
        try {
            const { stdout, stderr } = await execPromise(command);
            return {
                success: true,
                output: stdout,
                error: stderr
            };
        } catch (error) {
            console.error('Error executing command:', error);
            return {
                success: false,
                output: error.stdout,
                error: error.stderr
            };
        }
    }

    async getSystemInfo() {
        try {
            const [cpuInfo, memoryInfo, diskInfo] = await Promise.all([
                this.executeCommand('top -bn1 | grep "Cpu(s)"'),
                this.executeCommand('free -m'),
                this.executeCommand('df -h')
            ]);

            return {
                cpu: cpuInfo.output,
                memory: memoryInfo.output,
                disk: diskInfo.output
            };
        } catch (error) {
            console.error('Error getting system info:', error);
            throw error;
        }
    }

    async getProcessList() {
        try {
            const { output } = await this.executeCommand('ps aux');
            return output;
        } catch (error) {
            console.error('Error getting process list:', error);
            throw error;
        }
    }

    async getNetworkStatus() {
        try {
            const [networkInfo, connections] = await Promise.all([
                this.executeCommand('ifconfig'),
                this.executeCommand('netstat -tuln')
            ]);

            return {
                interfaces: networkInfo.output,
                connections: connections.output
            };
        } catch (error) {
            console.error('Error getting network status:', error);
            throw error;
        }
    }

    async getServiceStatus(serviceName) {
        try {
            const { output } = await this.executeCommand(`systemctl status ${serviceName}`);
            return output;
        } catch (error) {
            console.error('Error getting service status:', error);
            throw error;
        }
    }

    async startService(serviceName) {
        try {
            const { output } = await this.executeCommand(`systemctl start ${serviceName}`);
            return output;
        } catch (error) {
            console.error('Error starting service:', error);
            throw error;
        }
    }

    async stopService(serviceName) {
        try {
            const { output } = await this.executeCommand(`systemctl stop ${serviceName}`);
            return output;
        } catch (error) {
            console.error('Error stopping service:', error);
            throw error;
        }
    }

    async restartService(serviceName) {
        try {
            const { output } = await this.executeCommand(`systemctl restart ${serviceName}`);
            return output;
        } catch (error) {
            console.error('Error restarting service:', error);
            throw error;
        }
    }

    async getLogs(serviceName, lines = 100) {
        try {
            const { output } = await this.executeCommand(`journalctl -u ${serviceName} -n ${lines}`);
            return output;
        } catch (error) {
            console.error('Error getting logs:', error);
            throw error;
        }
    }

    async getSecurityStatus() {
        try {
            const [fail2ban, ufw] = await Promise.all([
                this.executeCommand('fail2ban-client status'),
                this.executeCommand('ufw status')
            ]);

            return {
                fail2ban: fail2ban.output,
                firewall: ufw.output
            };
        } catch (error) {
            console.error('Error getting security status:', error);
            throw error;
        }
    }

    async getBackupStatus() {
        try {
            const { output } = await this.executeCommand('ls -l /var/backups/');
            return output;
        } catch (error) {
            console.error('Error getting backup status:', error);
            throw error;
        }
    }

    async createBackup(backupConfig) {
        try {
            const { source, destination, type } = backupConfig;
            let command;

            switch (type) {
                case 'full':
                    command = `tar -czf ${destination} ${source}`;
                    break;
                case 'incremental':
                    command = `rsync -avz --link-dest=${destination} ${source} ${destination}`;
                    break;
                default:
                    throw new Error('Invalid backup type');
            }

            const { output } = await this.executeCommand(command);
            return output;
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }

    async restoreBackup(backupPath, destination) {
        try {
            const { output } = await this.executeCommand(`tar -xzf ${backupPath} -C ${destination}`);
            return output;
        } catch (error) {
            console.error('Error restoring backup:', error);
            throw error;
        }
    }

    async getResourceUsage() {
        try {
            const [cpu, memory, disk] = await Promise.all([
                this.executeCommand('top -bn1 | grep "Cpu(s)"'),
                this.executeCommand('free -m'),
                this.executeCommand('df -h')
            ]);

            return {
                cpu: cpu.output,
                memory: memory.output,
                disk: disk.output
            };
        } catch (error) {
            console.error('Error getting resource usage:', error);
            throw error;
        }
    }

    async getSystemUpdates() {
        try {
            const { output } = await this.executeCommand('apt list --upgradable');
            return output;
        } catch (error) {
            console.error('Error getting system updates:', error);
            throw error;
        }
    }

    async performSystemUpdate() {
        try {
            const [update, upgrade] = await Promise.all([
                this.executeCommand('apt update'),
                this.executeCommand('apt upgrade -y')
            ]);

            return {
                update: update.output,
                upgrade: upgrade.output
            };
        } catch (error) {
            console.error('Error performing system update:', error);
            throw error;
        }
    }
}

module.exports = new ConsoleIntegration();
