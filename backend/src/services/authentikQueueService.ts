import { authentikQueue } from '@/tasks/queue';
import { logger } from '@/utils/logger';

interface AuthentikJobOptions {
  priority?: 'low' | 'normal' | 'high';
  delay?: number; // Delay in milliseconds
  retryOnFailure?: boolean;
  notifyOnFailure?: boolean;
}

interface AuthentikJobData {
  action: 'update_paid_status' | 'sync_all';
  userId?: string;
  paidStatus?: boolean;
  backgroundTaskId?: string;
}

export class AuthentikQueueService {
  async addJob(
    data: AuthentikJobData,
    options: AuthentikJobOptions = {}
  ): Promise<string> {
    const {
      priority = 'normal',
      delay = 0,
      retryOnFailure = true,
      notifyOnFailure = false
    } = options;

    const jobOptions: any = {
      delay,
      attempts: retryOnFailure ? 3 : 1,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    };

    // Set priority
    if (priority === 'high') {
      jobOptions.priority = 1;
    } else if (priority === 'low') {
      jobOptions.priority = 10;
    }

    const job = await authentikQueue.add('authentik-operation', data, jobOptions);
    
    logger.info('Authentik job added to queue', {
      jobId: job.id,
      action: data.action,
      userId: data.userId,
      paidStatus: data.paidStatus,
      priority,
      delay
    });

    return job.id;
  }

  async updatePaidStatusAsync(
    userId: string,
    paidStatus: boolean,
    backgroundTaskId?: string,
    options: AuthentikJobOptions = {}
  ): Promise<string> {
    return this.addJob(
      {
        action: 'update_paid_status',
        userId,
        paidStatus,
        backgroundTaskId
      },
      options
    );
  }

  async syncAllPaidStatusesAsync(
    backgroundTaskId?: string,
    options: AuthentikJobOptions = {}
  ): Promise<string> {
    return this.addJob(
      {
        action: 'sync_all',
        backgroundTaskId
      },
      options
    );
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await authentikQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      result: job.returnvalue,
      error: job.failedReason,
      createdAt: job.timestamp,
      processedAt: job.processedOn,
      finishedAt: job.finishedOn
    };
  }

  async getQueueStats(): Promise<any> {
    const waiting = await authentikQueue.getWaiting();
    const active = await authentikQueue.getActive();
    const completed = await authentikQueue.getCompleted();
    const failed = await authentikQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length
    };
  }
}

// Export singleton instance
export const authentikQueueService = new AuthentikQueueService();
