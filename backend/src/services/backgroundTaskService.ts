import { logger } from '@/utils/logger';

export interface BackgroundTask {
  id: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  data: any;
  result?: any;
  error?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class BackgroundTaskService {
  private tasks: Map<string, BackgroundTask> = new Map();
  private isProcessing = false;

  async addTask(type: string, data: any): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: BackgroundTask = {
      id: taskId,
      type,
      status: 'pending',
      data,
      createdAt: new Date()
    };

    this.tasks.set(taskId, task);
    logger.info('Background task added', { taskId, type, data });

    // Start processing if not already running
    if (!this.isProcessing) {
      this.processTasks();
    }

    return taskId;
  }

  async getTask(taskId: string): Promise<BackgroundTask | null> {
    return this.tasks.get(taskId) || null;
  }

  async getTasks(type?: string): Promise<BackgroundTask[]> {
    const tasks = Array.from(this.tasks.values());
    if (type) {
      return tasks.filter(task => task.type === type);
    }
    return tasks;
  }

  private async processTasks(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    logger.info('Starting background task processing');

    try {
      const pendingTasks = Array.from(this.tasks.values())
        .filter(task => task.status === 'pending')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      for (const task of pendingTasks) {
        await this.processTask(task);
      }
    } catch (error) {
      logger.error('Error in background task processing', { error });
    } finally {
      this.isProcessing = false;
      logger.info('Background task processing completed');
    }
  }

  private async processTask(task: BackgroundTask): Promise<void> {
    try {
      logger.info('Processing background task', { taskId: task.id, type: task.type });
      
      task.status = 'running';
      task.startedAt = new Date();
      this.tasks.set(task.id, task);

      let result: any;

      switch (task.type) {
        case 'authentik_group_membership':
          result = await this.processAuthentikGroupMembership(task.data);
          break;
        case 'authentik_user_sync':
          result = await this.processAuthentikUserSync(task.data);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      
      logger.info('Background task completed successfully', { taskId: task.id, type: task.type });
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = new Date();
      
      logger.error('Background task failed', { taskId: task.id, type: task.type, error: task.error });
    }

    this.tasks.set(task.id, task);
  }

  private async processAuthentikGroupMembership(data: any): Promise<any> {
    // This will be implemented to handle Authentik group membership operations
    logger.info('Processing Authentik group membership task', { data });
    
    // Import here to avoid circular dependencies
    const { MemberPaidStatusService } = await import('./memberPaidStatusService');
    const { prisma } = await import('../models/prismaClient');
    
    const service = new MemberPaidStatusService(prisma);
    
    if (data.action === 'update_paid_status') {
      await service.updateMemberPaidStatus(data.userId, data.paidStatus);
    } else if (data.action === 'sync_all') {
      await service.syncAllPaidStatuses();
    }
    
    return { success: true };
  }

  private async processAuthentikUserSync(data: any): Promise<any> {
    // This will be implemented to handle Authentik user sync operations
    logger.info('Processing Authentik user sync task', { data });
    
    // Import here to avoid circular dependencies
    const { AuthManager } = await import('../managers/authManager');
    const { prisma } = await import('../models/prismaClient');
    
    const authManager = new AuthManager(prisma);
    
    if (data.action === 'sync_user_groups') {
      await authManager.syncUserGroups(data.userId, data.authentikGroups);
      
      // Also update the user's role based on the new groups
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: {
          userGroups: {
            include: { group: true }
          }
        }
      });
      
              if (user) {
          const currentGroups = user.userGroups.map(ug => ug.group.name);
          const updatedRole = authManager.determineRoleFromGroups(currentGroups);
        
        if (user.role !== updatedRole) {
          await prisma.user.update({
            where: { id: data.userId },
            data: { role: updatedRole }
          });
          
          logger.info('Updated user role based on Authentik groups', {
            userId: data.userId,
            oldRole: user.role,
            newRole: updatedRole,
            groups: currentGroups
          });
        }
      }
    }
    
    return { success: true };
  }

  // Clean up old completed tasks (older than 24 hours)
  async cleanupOldTasks(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    const tasksToDelete = Array.from(this.tasks.values())
      .filter(task => 
        (task.status === 'completed' || task.status === 'failed') && 
        task.completedAt && 
        task.completedAt < cutoffTime
      );

    for (const task of tasksToDelete) {
      this.tasks.delete(task.id);
    }

    if (tasksToDelete.length > 0) {
      logger.info('Cleaned up old background tasks', { count: tasksToDelete.length });
    }
  }
}

// Export a singleton instance
export const backgroundTaskService = new BackgroundTaskService();

// Set up periodic cleanup
setInterval(() => {
  backgroundTaskService.cleanupOldTasks().catch(error => {
    logger.error('Error during background task cleanup', { error });
  });
}, 60 * 60 * 1000); // Run cleanup every hour
