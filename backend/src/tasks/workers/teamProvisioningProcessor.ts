import { Worker, Job } from 'bullmq';
import { createTeamProvisioningWorker } from './teamProvisioningWorker';
import { externalServicesConfig } from '@/config/externalServices';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';

// Create the team provisioning worker with configuration
const config = externalServicesConfig;
const teamProvisioningWorker = createTeamProvisioningWorker(config);

// Job processing functions for the main worker
export async function processTeamProvisioningJob(job: Job) {
  try {
    logger.info(`Processing team provisioning job ${job.id}`, {
      action: job.data.action,
      teamId: job.data.teamId
    });

    // Ensure a parent task exists with child subtasks representing each integration step
    const taskManager = new BackgroundTaskManager(prisma);
    const subtaskNames = ['Authentik', 'Wiki.js', 'Nextcloud', 'GitHub', 'Discord'];
    const parentTaskId = job.data.backgroundTaskId;
    const parentTask = parentTaskId
      ? await taskManager.getTask(parentTaskId)
      : await taskManager.createTask({
          name: `Team ${job.data.action}`,
          description: `Provisioning for team ${job.data.teamId}`,
          entityType: 'TEAM',
          entityId: job.data.teamId,
          subtaskNames
        });

    if (!parentTask) {
      throw new Error('Failed to initialize background task for provisioning');
    }

    await taskManager.markTaskRunning(parentTask.id);

    // Process the job based on action type
    let result;
    switch (job.data.action) {
      case 'create':
        result = await teamProvisioningWorker.processCreateTeam(job);
        break;
      case 'update':
        result = await teamProvisioningWorker.processUpdateTeam(job);
        break;
      case 'delete':
        result = await teamProvisioningWorker.processDeleteTeam(job);
        break;
      default:
        throw new Error(`Unknown action: ${job.data.action}`);
    }

    logger.info(`Team provisioning job ${job.id} completed successfully`, {
      success: result.success,
      errors: result.errors.length,
      warnings: result.warnings.length
    });

    // Update subtask statuses based on result
    const optionFlags = job.data.options || { wikijs: false, github: false, discord: false, nextcloudFolder: false, nextcloudCalendar: false, nextcloudDeck: false };
    const results = result.results || {};
    const subtaskIndexMap: Record<string, number> = {
      Authentik: 0,
      'Wiki.js': 1,
      Nextcloud: 2,
      GitHub: 3,
      Discord: 4
    };

    // Authentik
    await taskManager.markSubtaskCompleted(parentTask.id, subtaskIndexMap['Authentik'], results.authentik);
    // Wiki.js
    if (optionFlags.wikijs) {
      if (results.wikijs?.success) {
        await taskManager.markSubtaskCompleted(parentTask.id, subtaskIndexMap['Wiki.js'], results.wikijs);
      } else {
        await taskManager.markSubtaskFailed(parentTask.id, subtaskIndexMap['Wiki.js'], results.wikijs?.error || 'Wiki.js failed');
      }
    } else {
      await taskManager.markSubtaskCompleted(parentTask.id, subtaskIndexMap['Wiki.js'], { skipped: true });
    }
    // Nextcloud
    if (results.nextcloud?.success) {
      await taskManager.markSubtaskCompleted(parentTask.id, subtaskIndexMap['Nextcloud'], results.nextcloud);
    } else if (results.nextcloud) {
      await taskManager.markSubtaskFailed(parentTask.id, subtaskIndexMap['Nextcloud'], results.nextcloud.error || 'Nextcloud failed');
    }
    // GitHub
    if (optionFlags.github) {
      if (results.github?.success) {
        await taskManager.markSubtaskCompleted(parentTask.id, subtaskIndexMap['GitHub'], results.github);
      } else {
        await taskManager.markSubtaskFailed(parentTask.id, subtaskIndexMap['GitHub'], results.github?.error || 'GitHub failed');
      }
    } else {
      await taskManager.markSubtaskCompleted(parentTask.id, subtaskIndexMap['GitHub'], { skipped: true });
    }
    // Discord
    if (optionFlags.discord) {
      if (results.discord?.success) {
        await taskManager.markSubtaskCompleted(parentTask.id, subtaskIndexMap['Discord'], results.discord);
      } else {
        await taskManager.markSubtaskFailed(parentTask.id, subtaskIndexMap['Discord'], results.discord?.error || 'Discord failed');
      }
    } else {
      await taskManager.markSubtaskCompleted(parentTask.id, subtaskIndexMap['Discord'], { skipped: true });
    }

    // Store overall result on parent task
    if (result.success) {
      await taskManager.markTaskCompleted(parentTask.id, result);
    } else {
      await taskManager.markTaskFailed(parentTask.id, result.errors.join('; '));
    }

    return { ...result, backgroundTaskId: parentTask.id };
  } catch (error) {
    logger.error(`Team provisioning job ${job.id} failed`, error);
    throw error;
  }
}

export async function processTeamProvisioningJobFailed(job: Job, error: Error) {
  logger.error(`Team provisioning job ${job.id} failed:`, error);
  
  // Try to mark the task as failed if we have a background task ID
  if (job.data.backgroundTaskId) {
    try {
      const taskManager = new BackgroundTaskManager(prisma);
      await taskManager.markTaskFailed(job.data.backgroundTaskId, error.message);
    } catch (taskError) {
      logger.error('Failed to mark background task as failed:', taskError);
    }
  }
}

// Create the BullMQ worker
const worker = new Worker(
  'team-provisioning',
  processTeamProvisioningJob,
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    },
    concurrency: 1, // Process one job at a time to avoid conflicts
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
    removeOnFail: { count: 50 } // Keep last 50 failed jobs
  }
);

// Worker event handlers
worker.on('completed', (job) => {
  if (job) {
    logger.info(`Team provisioning job ${job.id} completed successfully`);
  }
});

worker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Team provisioning job ${job.id} failed:`, err);
  }
});

worker.on('error', (err) => {
  logger.error('Team provisioning worker error:', err);
});

worker.on('stalled', (jobId) => {
  logger.warn(`Team provisioning job ${jobId} stalled`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down team provisioning worker gracefully');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down team provisioning worker gracefully');
  await worker.close();
  process.exit(0);
});

logger.info('Team provisioning worker started and ready to process jobs');

export { worker };
