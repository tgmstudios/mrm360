#!/usr/bin/env tsx

import { ListMonkQueueService } from '@/src/services/listmonkQueueService';
import { logger } from '@/src/utils/logger';

async function testListMonkWorker() {
  logger.info('Starting ListMonk worker test');

  try {
    // Test 1: Subscribe to list
    logger.info('Test 1: Adding subscribe job to queue');
    const subscribeJob = await ListMonkQueueService.subscribeToList(
      '3', // listId
      'test@example.com',
      {
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User'
      },
      {
        priority: 0,
        retryOnFailure: true,
        notifyOnFailure: false
      }
    );
    logger.info('Subscribe job added:', { jobId: subscribeJob.id });

    // Test 2: Unsubscribe from list
    logger.info('Test 2: Adding unsubscribe job to queue');
    const unsubscribeJob = await ListMonkQueueService.unsubscribeFromList(
      '3', // listId
      'test@example.com',
      {
        priority: 0,
        retryOnFailure: true,
        notifyOnFailure: false
      }
    );
    logger.info('Unsubscribe job added:', { jobId: unsubscribeJob.id });

    // Test 3: Create subscriber
    logger.info('Test 3: Adding create subscriber job to queue');
    const createJob = await ListMonkQueueService.createSubscriber(
      {
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        displayName: 'New User',
        status: 'enabled',
        lists: [1, 2, 3]
      },
      {
        priority: 1,
        retryOnFailure: true,
        notifyOnFailure: true
      }
    );
    logger.info('Create subscriber job added:', { jobId: createJob.id });

    // Test 4: Update subscriber
    logger.info('Test 4: Adding update subscriber job to queue');
    const updateJob = await ListMonkQueueService.updateSubscriber(
      '1', // subscriberId
      {
        firstName: 'Updated',
        lastName: 'User',
        displayName: 'Updated User'
      },
      {
        priority: 0,
        retryOnFailure: true,
        notifyOnFailure: false
      }
    );
    logger.info('Update subscriber job added:', { jobId: updateJob.id });

    // Test 5: Delete subscriber
    logger.info('Test 5: Adding delete subscriber job to queue');
    const deleteJob = await ListMonkQueueService.deleteSubscriber(
      '1', // subscriberId
      {
        priority: 0,
        retryOnFailure: true,
        notifyOnFailure: false
      }
    );
    logger.info('Delete subscriber job added:', { jobId: deleteJob.id });

    // Test 6: Sync operation
    logger.info('Test 6: Adding sync job to queue');
    const syncJob = await ListMonkQueueService.sync(
      { operation: 'test-sync' },
      {
        priority: 0,
        retryOnFailure: true,
        notifyOnFailure: false
      }
    );
    logger.info('Sync job added:', { jobId: syncJob.id });

    logger.info('All ListMonk worker tests completed successfully');
    logger.info('Jobs have been added to the queue and will be processed by the ListMonk worker');
    logger.info('To see the results, check the worker logs or monitor the queue');

  } catch (error) {
    logger.error('ListMonk worker test failed:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testListMonkWorker().catch((error) => {
    logger.error('Unhandled error in ListMonk worker test:', error);
    process.exit(1);
  });
}

export { testListMonkWorker };
