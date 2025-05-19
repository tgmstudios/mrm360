const { db } = require('../utils/services.js');
const { v4: uuidv4 } = require('uuid');

// Import all integration handlers
const authentik = require('../integrations/auth-authentik.js');
const discord = require('../integrations/comm-discord.js');
const nextcloud = require('../integrations/file-nextcloud.js');
const wikijs = require('../integrations/doc-wikijs.js');
const github = require('../integrations/dev-github.js');
const openstack = require('../integrations/idm-openstack.js');
const compsole = require('../integrations/idm-compsole.js');
const listmonk = require('../integrations/comm-listmonk.js');
const pritunl = require('../integrations/idm-pritunl.js');
const ssh = require('../integrations/idm-ssh.js');

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

class TaskManager {
    constructor() {
        this.isProcessing = false;
        this.processingInterval = null;
    }

    async createTask(type, context) {
        const taskId = uuidv4();
        await db.insert('tasks', ['id', 'type', 'context', 'status'], 
            [taskId, type, JSON.stringify(context), 'pending']);
        return taskId;
    }

    async processTask(task) {
        try {
            // Update task status to in_progress
            await db.update('tasks', 'status', 'in_progress', 'id', task.id);
            await db.update('tasks', 'attempts', task.attempts + 1, 'id', task.id);

            // Process based on task type
            switch (task.type) {
                // User related tasks
                case 'CREATE_AUTHENTIK_USER':
                    await authentik.createUser(task.context);
                    break;
                case 'UPDATE_AUTHENTIK_USER':
                    await authentik.updateUser(task.context);
                    break;
                case 'DELETE_AUTHENTIK_USER':
                    await authentik.deleteUser(task.context);
                    break;

                // Team related tasks
                case 'CREATE_DISCORD_TEAM':
                    await discord.createTeam(task.context);
                    break;
                case 'UPDATE_DISCORD_TEAM':
                    await discord.updateTeam(task.context);
                    break;
                case 'DELETE_DISCORD_TEAM':
                    await discord.deleteTeam(task.context);
                    break;
                case 'CREATE_NEXTCLOUD_FOLDER':
                    await nextcloud.createFolder(task.context);
                    break;
                case 'DELETE_NEXTCLOUD_FOLDER':
                    await nextcloud.deleteFolder(task.context);
                    break;
                case 'CREATE_WIKIJS_PAGE':
                    await wikijs.createPage(task.context);
                    break;
                case 'DELETE_WIKIJS_PAGE':
                    await wikijs.deletePage(task.context);
                    break;
                case 'CREATE_GITHUB_REPO':
                    await github.createRepository(task.context);
                    break;
                case 'DELETE_GITHUB_REPO':
                    await github.deleteRepository(task.context);
                    break;

                // Event related tasks
                case 'CREATE_OPENSTACK_PROJECT':
                    await openstack.createProject(task.context);
                    break;
                case 'DELETE_OPENSTACK_PROJECT':
                    await openstack.deleteProject(task.context);
                    break;
                case 'CREATE_COMPSOLE_COMPETITION':
                    await compsole.createCompetition(task.context);
                    break;
                case 'DELETE_COMPSOLE_COMPETITION':
                    await compsole.deleteCompetition(task.context);
                    break;

                // Newsletter tasks
                case 'SUBSCRIBE_NEWSLETTER':
                    await listmonk.subscribeUser(task.context);
                    break;
                case 'UNSUBSCRIBE_NEWSLETTER':
                    await listmonk.unsubscribeUser(task.context);
                    break;

                // VPN tasks
                case 'CREATE_PRITUNL_USER':
                    await pritunl.createUser(task.context);
                    break;
                case 'DELETE_PRITUNL_USER':
                    await pritunl.deleteUser(task.context);
                    break;

                // SSH tasks
                case 'ADD_SSH_KEY':
                    await ssh.addKey(task.context);
                    break;
                case 'REMOVE_SSH_KEY':
                    await ssh.removeKey(task.context);
                    break;

                default:
                    throw new Error(`Unknown task type: ${task.type}`);
            }

            // Update task status to completed
            await db.update('tasks', 'status', 'completed', 'id', task.id);
        } catch (error) {
            console.error(`Error processing task ${task.id}:`, error);
            
            // Update task with error
            await db.update('tasks', 'error_message', error.message, 'id', task.id);
            
            if (task.attempts < MAX_RETRIES) {
                // Reschedule task for retry
                await db.update('tasks', 'status', 'pending', 'id', task.id);
            } else {
                // Mark task as failed after max retries
                await db.update('tasks', 'status', 'error', 'id', task.id);
            }
        }
    }

    async processPendingTasks() {
        if (this.isProcessing) return;
        this.isProcessing = true;

        try {
            const tasks = await db.executeQuery(
                'SELECT * FROM tasks WHERE status = ? ORDER BY created_at ASC LIMIT 10',
                ['pending']
            );

            for (const task of tasks) {
                await this.processTask(task);
            }
        } catch (error) {
            console.error('Error processing task queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }

    startProcessing() {
        if (this.processingInterval) return;
        this.processingInterval = setInterval(() => this.processPendingTasks(), 1000);
    }

    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }
}

module.exports = new TaskManager();
