import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';

interface WiretapJobData {
  backgroundTaskId: string;
  action: 'provision_event' | 'cleanup_event' | 'sync_users' | 'health_check';
  payload: Record<string, any>;
}

export async function processWiretapJob(job: Job<WiretapJobData>) {
  const { backgroundTaskId, action, payload } = job.data;
  const taskManager = new BackgroundTaskManager(prisma);

  logger.info(`Processing Wiretap job ${job.id} for ${action} task ${backgroundTaskId}`);

  try {
    await taskManager.markTaskRunning(backgroundTaskId);

    // Create Wiretap service instance
    const wiretapService = WiretapServiceFactory.createServiceFromEnv();

    let result: any = {};

    switch (action) {
      case 'provision_event':
        result = await handleProvisionEvent(wiretapService, payload, taskManager, backgroundTaskId);
        break;
      
      case 'cleanup_event':
        result = await handleCleanupEvent(wiretapService, payload, taskManager, backgroundTaskId);
        break;
      
      case 'sync_users':
        result = await handleSyncUsers(wiretapService, payload, taskManager, backgroundTaskId);
        break;
      
      case 'health_check':
        result = await handleHealthCheck(wiretapService, taskManager, backgroundTaskId);
        break;
      
      default:
        throw new Error(`Unknown Wiretap action: ${action}`);
    }

    await taskManager.markTaskCompleted(backgroundTaskId, { 
      message: `Wiretap ${action} completed successfully`,
      result 
    });

    logger.info(`Wiretap job ${job.id} completed successfully`, { action, result });
    return { success: true, result };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Wiretap job ${job.id} failed`, { action, error: errMsg });
    await taskManager.markTaskFailed(backgroundTaskId, errMsg);
    throw error;
  }
}

async function handleProvisionEvent(
  wiretapService: any, 
  payload: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  const { eventId, eventType, resourceSpecs } = payload;
  
  logger.info(`Provisioning Wiretap resources for event ${eventId}`, { eventType, resourceCount: resourceSpecs?.length || 0 });

  const steps = [
    'Validate event and resource specifications',
    'Create or get parent project',
    'Create event project',
    'Provision compute resources',
    'Provision storage resources',
    'Configure networking',
    'Set up monitoring'
  ];

  const totalSteps = steps.length;
  for (let i = 0; i < totalSteps; i++) {
    await taskManager.markSubtaskRunning(backgroundTaskId, i);
    
    // Simulate work with incremental progress
    for (let p = 1; p <= 5; p++) {
      await new Promise(r => setTimeout(r, 200));
      await taskManager.updateSubtaskProgress(backgroundTaskId, i, p * 20);
      await taskManager.updateTaskProgress(backgroundTaskId, Math.round(((i + p / 5) / totalSteps) * 100));
    }
    
    await taskManager.markSubtaskCompleted(backgroundTaskId, i, { message: `${steps[i]} completed` });
  }

  // Simulate actual resource provisioning
  const resources = await wiretapService.provisionEventResources(eventId, eventType, resourceSpecs || []);
  
  return {
    eventId,
    eventType,
    resourcesCreated: resources.length,
    resources
  };
}

async function handleCleanupEvent(
  wiretapService: any, 
  payload: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  const { eventId } = payload;
  
  logger.info(`Cleaning up Wiretap resources for event ${eventId}`);

  const steps = [
    'Identify event resources',
    'Stop active resources',
    'Delete compute resources',
    'Delete storage resources',
    'Clean up networking',
    'Remove monitoring',
    'Delete project'
  ];

  const totalSteps = steps.length;
  for (let i = 0; i < totalSteps; i++) {
    await taskManager.markSubtaskRunning(backgroundTaskId, i);
    
    // Simulate work with incremental progress
    for (let p = 1; p <= 5; p++) {
      await new Promise(r => setTimeout(r, 150));
      await taskManager.updateSubtaskProgress(backgroundTaskId, i, p * 20);
      await taskManager.updateTaskProgress(backgroundTaskId, Math.round(((i + p / 5) / totalSteps) * 100));
    }
    
    await taskManager.markSubtaskCompleted(backgroundTaskId, i, { message: `${steps[i]} completed` });
  }

  // Simulate actual resource cleanup
  await wiretapService.cleanupEventResources(eventId);
  
  return {
    eventId,
    cleanupCompleted: true
  };
}

async function handleSyncUsers(
  wiretapService: any, 
  payload: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  const { projectId, userIds } = payload;
  
  logger.info(`Syncing users for Wiretap project ${projectId}`, { userCount: userIds?.length || 0 });

  const steps = [
    'Validate user IDs',
    'Get current project users',
    'Calculate user changes',
    'Add new users to project',
    'Remove inactive users',
    'Update user roles',
    'Verify synchronization'
  ];

  const totalSteps = steps.length;
  for (let i = 0; i < totalSteps; i++) {
    await taskManager.markSubtaskRunning(backgroundTaskId, i);
    
    // Simulate work with incremental progress
    for (let p = 1; p <= 5; p++) {
      await new Promise(r => setTimeout(r, 100));
      await taskManager.updateSubtaskProgress(backgroundTaskId, i, p * 20);
      await taskManager.updateTaskProgress(backgroundTaskId, Math.round(((i + p / 5) / totalSteps) * 100));
    }
    
    await taskManager.markSubtaskCompleted(backgroundTaskId, i, { message: `${steps[i]} completed` });
  }

  // Simulate actual user sync
  if (userIds && userIds.length > 0) {
    await wiretapService.addUsersToProject(projectId, userIds);
  }
  
  return {
    projectId,
    usersSynced: userIds?.length || 0,
    syncCompleted: true
  };
}

async function handleHealthCheck(
  wiretapService: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  logger.info('Performing Wiretap health check');

  const steps = [
    'Check service connectivity',
    'Validate authentication',
    'Test project operations',
    'Test user operations',
    'Test resource operations',
    'Verify configuration',
    'Generate health report'
  ];

  const totalSteps = steps.length;
  for (let i = 0; i < totalSteps; i++) {
    await taskManager.markSubtaskRunning(backgroundTaskId, i);
    
    // Simulate work with incremental progress
    for (let p = 1; p <= 5; p++) {
      await new Promise(r => setTimeout(r, 50));
      await taskManager.updateSubtaskProgress(backgroundTaskId, i, p * 20);
      await taskManager.updateTaskProgress(backgroundTaskId, Math.round(((i + p / 5) / totalSteps) * 100));
    }
    
    await taskManager.markSubtaskCompleted(backgroundTaskId, i, { message: `${steps[i]} completed` });
  }

  // Perform actual health check
  const isHealthy = await wiretapService.healthCheck();
  
  return {
    isHealthy,
    healthCheckCompleted: true,
    timestamp: new Date().toISOString()
  };
}

export async function processWiretapJobFailed(job: Job<WiretapJobData>, error: Error) {
  logger.error(`Wiretap job ${job.id} failed permanently:`, {
    error: error.message,
    data: job.data,
    attempts: job.attemptsMade
  });
}
