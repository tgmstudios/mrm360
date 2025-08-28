#!/usr/bin/env ts-node

/**
 * Team Provisioning Worker Startup Script
 * 
 * This script starts the team provisioning worker process that handles
 * background tasks for team creation, updates, and deletion across
 * external services.
 * 
 * Usage:
 *   npm run start:worker
 *   npm run start:worker:dev
 *   npm run start:worker:prod
 */

import { config } from 'dotenv';
import { logger } from '../src/utils/logger';

// Load environment variables
config();

async function startWorker() {
  try {
    logger.info('Starting Team Provisioning Worker...');
    
    // Import and start the worker
    const { worker } = await import('../src/tasks/workers/teamProvisioningProcessor');
    
    logger.info('Team Provisioning Worker started successfully');
    logger.info('Worker is now processing jobs from the team-provisioning queue');
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await worker.close();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await worker.close();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start Team Provisioning Worker:', error);
    process.exit(1);
  }
}

// Start the worker if this script is run directly
if (require.main === module) {
  startWorker().catch((error) => {
    logger.error('Unhandled error in worker startup:', error);
    process.exit(1);
  });
}

export { startWorker };
