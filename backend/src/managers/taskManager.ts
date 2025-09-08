import { Queue } from 'bullmq';
import { logger } from '@/utils/logger';
import { emailQueue, qrCodeQueue, syncGroupsQueue, provisionQueue, paymentStatusQueue } from '../tasks/queue';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from './backgroundTaskManager';

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
  template?: string;
  variables?: Record<string, any>;
}

export interface QRCodeJobData {
  userId: string;
  userEmail: string;
  userName: string;
}

export interface SyncGroupsJobData {
  userId: string;
  force?: boolean;
}

export interface PaymentStatusJobData {
  type: 'check-expired' | 'update-user-status';
  userId?: string;
}

export class TaskManager {
  private emailQueue: Queue;
  private qrCodeQueue: Queue;
  private syncGroupsQueue: Queue;
  private provisionQueue: Queue;
  private paymentStatusQueue: Queue;

  constructor() {
    this.emailQueue = emailQueue;
    this.qrCodeQueue = qrCodeQueue;
    this.syncGroupsQueue = syncGroupsQueue;
    this.provisionQueue = provisionQueue;
    this.paymentStatusQueue = paymentStatusQueue;
  }

  async enqueueEmailJob(data: EmailJobData, options?: {
    delay?: number;
    priority?: number;
    attempts?: number;
  }): Promise<string> {
    try {
      logger.info('Enqueueing email job', { to: data.to, subject: data.subject });
      
      const job = await this.emailQueue.add('send-email', data, {
        delay: options?.delay || 0,
        priority: options?.priority || 0,
        attempts: options?.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      logger.info('Email job enqueued successfully', { jobId: job.id });
      return job.id as string;
    } catch (error) {
      logger.error('Failed to enqueue email job', { error, data });
      throw error;
    }
  }

  // High-level provisioning tasks that create DB task + enqueue provision job
  async enqueueProvisionTask(params: {
    provisionType: 'TEAM' | 'EVENT';
    name: string;
    description?: string;
    entityType?: string;
    entityId?: string;
    subtaskNames: string[];
    payload: any;
  }): Promise<{ jobId: string; backgroundTaskId: string }> {
    const backgroundTaskManager = new BackgroundTaskManager(prisma);
    const backgroundTask = await backgroundTaskManager.createTask({
      name: params.name,
      description: params.description,
      entityType: params.entityType,
      entityId: params.entityId,
      subtaskNames: params.subtaskNames
    });

    const job = await this.provisionQueue.add('provision', {
      backgroundTaskId: backgroundTask.id,
      provisionType: params.provisionType,
      payload: params.payload
    });
    return { jobId: job.id as string, backgroundTaskId: backgroundTask.id };
  }

  async enqueueQRCodeJob(data: QRCodeJobData, options?: {
    delay?: number;
    priority?: number;
    attempts?: number;
  }): Promise<string> {
    try {
      logger.info('Enqueueing QR code generation job', { userId: data.userId });
      
      const job = await this.qrCodeQueue.add('generate-qr-code', data, {
        delay: options?.delay || 0,
        priority: options?.priority || 0,
        attempts: options?.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      logger.info('QR code job enqueued successfully', { jobId: job.id });
      return job.id as string;
    } catch (error) {
      logger.error('Failed to enqueue QR code job', { error, data });
      throw error;
    }
  }

  async enqueueSyncGroupsJob(data: SyncGroupsJobData, options?: {
    delay?: number;
    priority?: number;
    attempts?: number;
  }): Promise<string> {
    try {
      logger.info('Enqueueing sync groups job', { userId: data.userId, force: data.force });
      
      const job = await this.syncGroupsQueue.add('sync-groups', data, {
        delay: options?.delay || 0,
        priority: options?.priority || 0,
        attempts: options?.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });

      logger.info('Sync groups job enqueued successfully', { jobId: job.id });
      return job.id as string;
    } catch (error) {
      logger.error('Failed to enqueue sync groups job', { error, data });
      throw error;
    }
  }

  async enqueuePaymentStatusJob(data: PaymentStatusJobData, options?: {
    delay?: number;
    priority?: number;
    attempts?: number;
  }): Promise<string> {
    try {
      logger.info('Enqueueing payment status job', { type: data.type, userId: data.userId });
      
      const job = await this.paymentStatusQueue.add('payment-status', data, {
        delay: options?.delay || 0,
        priority: options?.priority || 0,
        attempts: options?.attempts || 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });

      logger.info('Payment status job enqueued successfully', { jobId: job.id });
      return job.id as string;
    } catch (error) {
      logger.error('Failed to enqueue payment status job', { error, data });
      throw error;
    }
  }

  async getJobStatus(queueName: string, jobId: string): Promise<any> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'email':
          queue = this.emailQueue;
          break;
        case 'qr-code':
          queue = this.qrCodeQueue;
          break;
        case 'sync-groups':
          queue = this.syncGroupsQueue;
          break;
        case 'payment-status':
          queue = this.paymentStatusQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const job = await queue.getJob(jobId);
      
      if (!job) {
        return { status: 'not_found' };
      }

      const state = await job.getState();
      const progress = await job.progress();
      const failedReason = job.failedReason;

      return {
        id: job.id,
        name: job.name,
        status: state,
        progress,
        failedReason,
        data: job.data,
        createdAt: job.timestamp,
        processedAt: job.processedOn,
        finishedAt: job.finishedOn,
      };
    } catch (error) {
      logger.error('Failed to get job status', { error, queueName, jobId });
      throw error;
    }
  }

  async getQueueStats(queueName: string): Promise<any> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'email':
          queue = this.emailQueue;
          break;
        case 'qr-code':
          queue = this.qrCodeQueue;
          break;
        case 'sync-groups':
          queue = this.syncGroupsQueue;
          break;
        case 'payment-status':
          queue = this.paymentStatusQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };
    } catch (error) {
      logger.error('Failed to get queue stats', { error, queueName });
      throw error;
    }
  }

  async retryFailedJob(queueName: string, jobId: string): Promise<void> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'email':
          queue = this.emailQueue;
          break;
        case 'qr-code':
          queue = this.qrCodeQueue;
          break;
        case 'sync-groups':
          queue = this.syncGroupsQueue;
          break;
        case 'payment-status':
          queue = this.paymentStatusQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const job = await queue.getJob(jobId);
      
      if (!job) {
        throw new Error('Job not found');
      }

      await job.retry();
      logger.info('Job retry initiated', { queueName, jobId });
    } catch (error) {
      logger.error('Failed to retry job', { error, queueName, jobId });
      throw error;
    }
  }

  async clearCompletedJobs(queueName: string): Promise<void> {
    try {
      let queue: Queue;
      
      switch (queueName) {
        case 'email':
          queue = this.emailQueue;
          break;
        case 'qr-code':
          queue = this.qrCodeQueue;
          break;
        case 'sync-groups':
          queue = this.syncGroupsQueue;
          break;
        case 'payment-status':
          queue = this.paymentStatusQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      await queue.clean(0, 1000, 'completed');
      logger.info('Completed jobs cleared', { queueName });
    } catch (error) {
      logger.error('Failed to clear completed jobs', { error, queueName });
      throw error;
    }
  }
}
