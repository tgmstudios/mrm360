import { PrismaClient, TaskStatus, BackgroundTask } from '@prisma/client';
import { logger } from '@/utils/logger';

export class BackgroundTaskManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createTask(params: {
    name: string;
    description?: string;
    entityType?: string;
    entityId?: string;
    subtaskNames?: string[];
  }): Promise<BackgroundTask & { subtasks: BackgroundTask[] }> {
    const { name, description, entityType, entityId, subtaskNames = [] } = params;
    try {
      // Create parent task
      const parentTask = await this.prisma.backgroundTask.create({
        data: {
          name,
          description,
          entityType,
          entityId,
          status: TaskStatus.PENDING,
          progress: 0
        }
      });

      // Create subtasks as child BackgroundTask records
      if (subtaskNames.length > 0) {
        await this.prisma.backgroundTask.createMany({
          data: subtaskNames.map((subtaskName, index) => ({
            name: subtaskName,
            parentTaskId: parentTask.id,
            stepIndex: index,
            status: TaskStatus.PENDING,
            progress: 0
          }))
        });
      }

      const fullTask = await this.prisma.backgroundTask.findUnique({
        where: { id: parentTask.id },
        include: { subtasks: true }
      });

      logger.info('Background task created', { taskId: parentTask.id, name });
      // non-null by construction
      return fullTask as BackgroundTask & { subtasks: BackgroundTask[] };
    } catch (error) {
      logger.error('Failed to create background task', { error, name });
      throw error;
    }
  }

  async markTaskRunning(taskId: string): Promise<void> {
    await this.prisma.backgroundTask.update({
      where: { id: taskId },
      data: { status: TaskStatus.RUNNING, startedAt: new Date() }
    });
  }

  async updateTaskProgress(taskId: string, progress: number): Promise<void> {
    await this.prisma.backgroundTask.update({
      where: { id: taskId },
      data: { progress }
    });
  }

  async markTaskCompleted(taskId: string, result?: any): Promise<void> {
    await this.prisma.backgroundTask.update({
      where: { id: taskId },
      data: { status: TaskStatus.COMPLETED, finishedAt: new Date(), progress: 100, result }
    });
  }

  async markTaskFailed(taskId: string, errorMessage: string): Promise<void> {
    await this.prisma.backgroundTask.update({
      where: { id: taskId },
      data: { status: TaskStatus.FAILED, finishedAt: new Date(), error: errorMessage }
    });
  }

  async markSubtaskRunning(taskId: string, stepIndex: number): Promise<BackgroundTask> {
    const subtaskId = await this.getSubtaskId(taskId, stepIndex);
    const subtask = await this.prisma.backgroundTask.update({
      where: { id: subtaskId },
      data: { status: TaskStatus.RUNNING, startedAt: new Date(), progress: 0 }
    });
    return subtask;
  }

  async updateSubtaskProgress(taskId: string, stepIndex: number, progress: number): Promise<void> {
    await this.prisma.backgroundTask.update({
      where: { id: await this.getSubtaskId(taskId, stepIndex) },
      data: { progress }
    });
  }

  async markSubtaskCompleted(taskId: string, stepIndex: number, result?: any): Promise<void> {
    await this.prisma.backgroundTask.update({
      where: { id: await this.getSubtaskId(taskId, stepIndex) },
      data: { status: TaskStatus.COMPLETED, finishedAt: new Date(), progress: 100, result }
    });
  }

  async markSubtaskFailed(taskId: string, stepIndex: number, errorMessage: string): Promise<void> {
    await this.prisma.backgroundTask.update({
      where: { id: await this.getSubtaskId(taskId, stepIndex) },
      data: { status: TaskStatus.FAILED, finishedAt: new Date(), error: errorMessage }
    });
  }

  async getTask(taskId: string): Promise<(BackgroundTask & { subtasks: BackgroundTask[] }) | null> {
    return this.prisma.backgroundTask.findUnique({ where: { id: taskId }, include: { subtasks: true } });
  }

  async listTasks(params: { page?: number; limit?: number; entityType?: string; entityId?: string } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (params.entityType) where.entityType = params.entityType;
    if (params.entityId) where.entityId = params.entityId;
    const [total, tasks] = await Promise.all([
      this.prisma.backgroundTask.count({ where }),
      this.prisma.backgroundTask.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { subtasks: true }
      })
    ]);
    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private async getSubtaskId(taskId: string, stepIndex: number): Promise<string> {
    const subtask = await this.prisma.backgroundTask.findFirst({ where: { parentTaskId: taskId, stepIndex } });
    if (!subtask) {
      throw new Error(`Subtask not found for task ${taskId} at step ${stepIndex}`);
    }
    return subtask.id;
  }
}


