import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { ListMonkTask } from '@/types';
import { ListMonkService } from '@/services/listmonkService';
import { ListMonkServiceFactory } from '@/services/listmonkServiceFactory';

export async function processListMonkJob(job: Job<ListMonkTask>) {
  const { action, data, options } = job.data;
  
  logger.info(`Processing ListMonk job ${job.id} - Action: ${action}`, {
    action,
    email: data.email,
    listId: data.listId,
    subscriberId: data.subscriberId
  });
  
  try {
    // Create ListMonk service instance
    const listmonkService = ListMonkServiceFactory.createServiceFromEnv();
    
    let result: any;
    
    switch (action) {
      case 'subscribe':
        if (!data.email || !data.listId) {
          throw new Error('Email and listId are required for subscribe action');
        }
        result = await listmonkService.subscribeToList(
          data.listId.toString(),
          data.email,
          data.subscriber || {}
        );
        break;
        
      case 'unsubscribe':
        if (!data.email || !data.listId) {
          throw new Error('Email and listId are required for unsubscribe action');
        }
        result = await listmonkService.unsubscribeFromList(
          data.listId.toString(),
          data.email
        );
        break;
        
      case 'update':
        if (!data.subscriberId) {
          throw new Error('SubscriberId is required for update action');
        }
        if (!data.subscriber) {
          throw new Error('Subscriber data is required for update action');
        }
        result = await listmonkService.updateSubscriber(
          data.subscriberId,
          data.subscriber
        );
        break;
        
      case 'create':
        if (!data.subscriber) {
          throw new Error('Subscriber data is required for create action');
        }
        result = await listmonkService.createSubscriber(data.subscriber);
        break;
        
      case 'delete':
        if (!data.subscriberId) {
          throw new Error('SubscriberId is required for delete action');
        }
        result = await listmonkService.deleteSubscriber(data.subscriberId);
        break;
        
      case 'sync':
        // Sync operation - could be used for bulk operations or data synchronization
        logger.info('Starting ListMonk sync operation');
        result = await performListMonkSync(listmonkService, data);
        break;
        
      default:
        throw new Error(`Unknown ListMonk action: ${action}`);
    }
    
    logger.info(`ListMonk job ${job.id} completed successfully`, {
      action,
      result: result ? 'success' : 'completed'
    });
    
    return {
      success: true,
      action,
      result,
      jobId: job.id
    };
    
  } catch (error) {
    logger.error(`ListMonk job ${job.id} failed:`, {
      action,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: job.data
    });
    
    // If retryOnFailure is enabled and we haven't exceeded max attempts
    if (options?.retryOnFailure && job.attemptsMade < (job.opts.attempts || 3)) {
      logger.info(`Retrying ListMonk job ${job.id} due to retryOnFailure option`);
      throw error; // This will trigger a retry
    }
    
    // If notifyOnFailure is enabled, we could send a notification here
    if (options?.notifyOnFailure) {
      logger.warn(`ListMonk job ${job.id} failed and notifyOnFailure is enabled`, {
        action,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // TODO: Implement notification logic (email, Slack, etc.)
    }
    
    throw error;
  }
}

export async function processListMonkJobFailed(job: Job<ListMonkTask>, error: Error) {
  logger.error(`ListMonk job ${job.id} failed permanently:`, {
    action: job.data.action,
    error: error.message,
    data: job.data,
    attempts: job.attemptsMade
  });
  
  // Could implement dead letter queue logic here
  // or send notification to admin
  // or log to external monitoring service
}

async function performListMonkSync(listmonkService: ListMonkService, data: ListMonkTask['data']) {
  // This is a placeholder for sync operations
  // Could be used for bulk operations, data synchronization, etc.
  logger.info('Performing ListMonk sync operation');
  
  // Example sync operations:
  // 1. Sync subscribers from external source
  // 2. Update subscriber attributes
  // 3. Clean up invalid subscribers
  // 4. Sync list memberships
  
  return {
    syncCompleted: true,
    timestamp: new Date().toISOString()
  };
}
