import { PrismaClient, TaskStatus, BackgroundTask } from '@prisma/client';
import { logger } from '@/utils/logger';
import { BackgroundTaskManager } from './backgroundTaskManager';

export interface DiscordRoleOperation {
  action: 'assignRole' | 'removeRole';
  userId: string;
  roleId: string;
  roleName?: string;
}

export interface DiscordBatchTaskParams {
  userId?: string;
  teamId?: string;
  entityType: 'USER' | 'TEAM';
  entityId: string;
  operations: DiscordRoleOperation[];
  description?: string;
}

export class DiscordBatchTaskManager {
  private prisma: PrismaClient;
  private backgroundTaskManager: BackgroundTaskManager;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.backgroundTaskManager = new BackgroundTaskManager(prisma);
  }

  /**
   * Create a batch Discord task for a user's role operations
   */
  async createUserRoleBatchTask(params: {
    userId: string;
    operations: DiscordRoleOperation[];
    description?: string;
  }): Promise<BackgroundTask & { subtasks: BackgroundTask[] }> {
    const { userId, operations, description } = params;
    
    // Create subtask names for each operation with role information
    const subtaskNames = operations.map(op => {
      const action = op.action === 'assignRole' ? 'Assign' : 'Remove';
      const roleInfo = op.roleName ? `${op.roleName} (${op.roleId})` : `Role ${op.roleId}`;
      return `${action} ${roleInfo}`;
    });

    const taskName = `Discord Role Update - User ${userId}`;
    const taskDescription = description || `Batch Discord role operations for user ${userId}`;

    return this.backgroundTaskManager.createTask({
      name: taskName,
      description: taskDescription,
      entityType: 'DISCORD_USER',
      entityId: userId,
      subtaskNames
    });
  }

  /**
   * Create a batch Discord task for a team's role operations
   */
  async createTeamRoleBatchTask(params: {
    teamId: string;
    operations: DiscordRoleOperation[];
    description?: string;
  }): Promise<BackgroundTask & { subtasks: BackgroundTask[] }> {
    const { teamId, operations, description } = params;
    
    // Create subtask names for each operation with role information
    const subtaskNames = operations.map(op => {
      const action = op.action === 'assignRole' ? 'Assign' : 'Remove';
      const roleInfo = op.roleName ? `${op.roleName} (${op.roleId})` : `Role ${op.roleId}`;
      return `${action} ${roleInfo}`;
    });

    const taskName = `Discord Role Update - Team ${teamId}`;
    const taskDescription = description || `Batch Discord role operations for team ${teamId}`;

    return this.backgroundTaskManager.createTask({
      name: taskName,
      description: taskDescription,
      entityType: 'DISCORD_TEAM',
      entityId: teamId,
      subtaskNames
    });
  }

  /**
   * Create a batch Discord task for general Discord operations
   */
  async createDiscordBatchTask(params: DiscordBatchTaskParams): Promise<BackgroundTask & { subtasks: BackgroundTask[] }> {
    const { entityType, entityId, operations, description } = params;
    
    // Create subtask names for each operation with role information
    const subtaskNames = operations.map(op => {
      const action = op.action === 'assignRole' ? 'Assign' : 'Remove';
      const roleInfo = op.roleName ? `${op.roleName} (${op.roleId})` : `Role ${op.roleId}`;
      return `${action} ${roleInfo}`;
    });

    const taskName = `Discord Batch Operations - ${entityType} ${entityId}`;
    const taskDescription = description || `Batch Discord operations for ${entityType.toLowerCase()} ${entityId}`;

    return this.backgroundTaskManager.createTask({
      name: taskName,
      description: taskDescription,
      entityType: `DISCORD_${entityType}`,
      entityId,
      subtaskNames
    });
  }

  /**
   * Mark a subtask as completed within a batch task
   */
  async markSubtaskCompleted(taskId: string, stepIndex: number, result?: any): Promise<void> {
    await this.backgroundTaskManager.markSubtaskCompleted(taskId, stepIndex, result);
  }

  /**
   * Mark a subtask as failed within a batch task
   */
  async markSubtaskFailed(taskId: string, stepIndex: number, errorMessage: string): Promise<void> {
    await this.backgroundTaskManager.markSubtaskFailed(taskId, stepIndex, errorMessage);
  }

  /**
   * Mark a subtask as running within a batch task
   */
  async markSubtaskRunning(taskId: string, stepIndex: number): Promise<BackgroundTask> {
    return this.backgroundTaskManager.markSubtaskRunning(taskId, stepIndex);
  }

  /**
   * Update progress of a subtask within a batch task
   */
  async updateSubtaskProgress(taskId: string, stepIndex: number, progress: number): Promise<void> {
    await this.backgroundTaskManager.updateSubtaskProgress(taskId, stepIndex, progress);
  }

  /**
   * Mark the entire batch task as completed
   */
  async markBatchTaskCompleted(taskId: string, result?: any): Promise<void> {
    await this.backgroundTaskManager.markTaskCompleted(taskId, result);
  }

  /**
   * Mark the entire batch task as failed
   */
  async markBatchTaskFailed(taskId: string, errorMessage: string): Promise<void> {
    await this.backgroundTaskManager.markTaskFailed(taskId, errorMessage);
  }

  /**
   * Mark the entire batch task as running
   */
  async markBatchTaskRunning(taskId: string): Promise<void> {
    await this.backgroundTaskManager.markTaskRunning(taskId);
  }

  /**
   * Get a batch task with its subtasks
   */
  async getBatchTask(taskId: string): Promise<(BackgroundTask & { subtasks: BackgroundTask[] }) | null> {
    return this.backgroundTaskManager.getTask(taskId);
  }
}
