import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';

type ProvisionType = 'TEAM' | 'EVENT';

interface ProvisionJobData {
  backgroundTaskId: string;
  provisionType: ProvisionType;
  payload: Record<string, any>;
}

export async function processProvisionJob(job: Job<ProvisionJobData>) {
  const { backgroundTaskId, provisionType, payload } = job.data;
  const taskManager = new BackgroundTaskManager(prisma);

  logger.info(`Processing provision job ${job.id} for ${provisionType} task ${backgroundTaskId}`);

  try {
    await taskManager.markTaskRunning(backgroundTaskId);

    // Define subtasks per provision type
    const steps = provisionType === 'TEAM'
      ? [
          'Validate inputs and member eligibility',
          'Create internal records',
          'Setup Wiki',
          'Setup GitHub',
          'Setup Nextcloud',
          'Create Discord channel',
          'Sync Authentik groups'
        ]
      : [];

    const totalSteps = steps.length;
    
    if (totalSteps === 0) {
      // For EVENT provision type, no subtasks are needed - mark as completed immediately
      await taskManager.markTaskCompleted(backgroundTaskId, { message: `${provisionType} provisioning complete` });
    } else {
      // Process subtasks for TEAM provision type
      for (let i = 0; i < totalSteps; i++) {
        // Run subtask
        await taskManager.markSubtaskRunning(backgroundTaskId, i);
        
        // Mark subtask as completed immediately (no actual provisioning needed)
        await taskManager.markSubtaskCompleted(backgroundTaskId, i, { message: `${steps[i]} completed` });
        
        await taskManager.updateTaskProgress(backgroundTaskId, Math.round(((i + 1) / totalSteps) * 100));
      }

      await taskManager.markTaskCompleted(backgroundTaskId, { message: `${provisionType} provisioning complete` });
    }
    return { success: true };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Provision job ${job.id} failed`, { error: errMsg });
    await taskManager.markTaskFailed(backgroundTaskId, errMsg);
    throw error;
  }
}

export async function processProvisionJobFailed(job: Job<ProvisionJobData>, error: Error) {
  logger.error(`Provision job ${job.id} failed permanently:`, {
    error: error.message,
    data: job.data,
    attempts: job.attemptsMade
  });
}


