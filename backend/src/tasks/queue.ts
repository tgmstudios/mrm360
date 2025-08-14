import { Queue, Worker, QueueScheduler } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '@/utils/logger';

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Queue names
export const QUEUE_NAMES = {
  EMAIL: 'email',
  QR_CODE: 'qr-code',
  SYNC_GROUPS: 'sync-groups',
  PROVISION: 'provision'
} as const;

// Create queues
export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

export const qrCodeQueue = new Queue(QUEUE_NAMES.QR_CODE, {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

export const syncGroupsQueue = new Queue(QUEUE_NAMES.SYNC_GROUPS, {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000
    }
  }
});

export const provisionQueue = new Queue(QUEUE_NAMES.PROVISION, {
  connection: redis,
  defaultJobOptions: {
    attempts: 1
  }
});
// Create schedulers for delayed jobs
export const emailScheduler = new QueueScheduler(QUEUE_NAMES.EMAIL, { connection: redis });
export const qrCodeScheduler = new QueueScheduler(QUEUE_NAMES.QR_CODE, { connection: redis });
export const syncGroupsScheduler = new QueueScheduler(QUEUE_NAMES.SYNC_GROUPS, { connection: redis });
export const provisionScheduler = new QueueScheduler(QUEUE_NAMES.PROVISION, { connection: redis });

// Queue event handlers
emailQueue.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
  logger.error(`Email job ${job.id} failed:`, err);
});

qrCodeQueue.on('completed', (job) => {
  logger.info(`QR Code job ${job.id} completed successfully`);
});

qrCodeQueue.on('failed', (job, err) => {
  logger.error(`QR Code job ${job.id} failed:`, err);
});

syncGroupsQueue.on('completed', (job) => {
  logger.info(`Sync Groups job ${job.id} completed successfully`);
});

syncGroupsQueue.on('failed', (job, err) => {
  logger.error(`Sync Groups job ${job.id} failed:`, err);
});

provisionQueue.on('completed', (job) => {
  logger.info(`Provision job ${job.id} completed successfully`);
});

provisionQueue.on('failed', (job, err) => {
  logger.error(`Provision job ${job.id} failed:`, err);
});
// Helper function to add jobs to queues
export async function addJobToQueue(
  queueName: keyof typeof QUEUE_NAMES,
  data: any,
  options?: {
    delay?: number;
    priority?: number;
    attempts?: number;
  }
) {
  const queue = getQueueByName(queueName);
  if (!queue) {
    throw new Error(`Unknown queue: ${queueName}`);
  }

  const job = await queue.add(
    queueName,
    data,
    {
      delay: options?.delay,
      priority: options?.priority,
      attempts: options?.attempts
    }
  );

  logger.info(`Added job ${job.id} to ${queueName} queue`);
  return job;
}

function getQueueByName(queueName: keyof typeof QUEUE_NAMES) {
  switch (queueName) {
    case 'EMAIL':
      return emailQueue;
    case 'QR_CODE':
      return qrCodeQueue;
    case 'SYNC_GROUPS':
      return syncGroupsQueue;
    default:
      return null;
  }
}

// Graceful shutdown
export async function closeQueues() {
  await emailQueue.close();
  await qrCodeQueue.close();
  await syncGroupsQueue.close();
  await redis.quit();
  logger.info('All queues closed');
}

// Health check
export async function getQueueHealth() {
  try {
    await redis.ping();
    return {
      redis: 'healthy',
      queues: {
        email: await emailQueue.getJobCounts(),
        qrCode: await qrCodeQueue.getJobCounts(),
        syncGroups: await syncGroupsQueue.getJobCounts()
      }
    };
  } catch (error) {
    logger.error('Queue health check failed:', error);
    return {
      redis: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
