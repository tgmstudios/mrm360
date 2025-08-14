import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';

type ProvisionType = 'TEAM' | 'EVENT';

interface ProvisionJobData {
  backgroundTaskId: string;
  provisionType: ProvisionType;
  payload: Record<string, any>;
}

export async function processProvisionJob(job: Job<ProvisionJobData>) {
  const { backgroundTaskId, provisionType } = job.data;
  const taskManager = new BackgroundTaskManager(prisma);

  logger.info(`Processing provision job ${job.id} for ${provisionType} task ${backgroundTaskId}`);

  try {
    await taskManager.markTaskRunning(backgroundTaskId);

    // Define simulated subtasks per provision type
    const steps = provisionType === 'TEAM'
      ? [
          'Validate inputs and member eligibility',
          'Create internal records',
          'Setup Wiki (simulated)',
          'Setup GitHub (simulated)',
          'Setup Nextcloud (simulated)',
          'Create Discord channel (simulated)',
          'Sync Authentik groups (simulated)'
        ]
      : [
          'Validate event details',
          'Create internal records',
          'Create Nextcloud calendar entry (simulated)',
          'Generate RSVP link (simulated)',
          'Prepare Wiretap/OpenStack resources (simulated)'
        ];

    const totalSteps = steps.length;
    for (let i = 0; i < totalSteps; i++) {
      // Run subtask
      await taskManager.markSubtaskRunning(backgroundTaskId, i);
      // Simulate work with incremental progress within the subtask
      for (let p = 1; p <= 5; p++) {
        await new Promise(r => setTimeout(r, 300));
        await taskManager.updateSubtaskProgress(backgroundTaskId, i, p * 20);
        await job.updateProgress(Math.round(((i + p / 5) / totalSteps) * 100));
      }
      await taskManager.markSubtaskCompleted(backgroundTaskId, i, { message: `${steps[i]} done` });
      await taskManager.updateTaskProgress(backgroundTaskId, Math.round(((i + 1) / totalSteps) * 100));
    }

    await taskManager.markTaskCompleted(backgroundTaskId, { message: `${provisionType} provisioning complete` });
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


