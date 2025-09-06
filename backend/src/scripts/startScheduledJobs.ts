#!/usr/bin/env ts-node

import { ScheduledJobService } from '../services/scheduledJobService';
import { logger } from '../utils/logger';

/**
 * Script to start scheduled jobs
 * This can be run as a standalone process or integrated into the main application
 */
async function startScheduledJobs() {
  logger.info('Starting scheduled jobs service...');
  
  const scheduledJobService = new ScheduledJobService();
  
  try {
    await scheduledJobService.startScheduledJobs();
    logger.info('Scheduled jobs service started successfully');
    
    // Keep the process running
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down scheduled jobs...');
      await scheduledJobService.stopScheduledJobs();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down scheduled jobs...');
      await scheduledJobService.stopScheduledJobs();
      process.exit(0);
    });
    
    // Log status every hour
    setInterval(() => {
      const status = scheduledJobService.getScheduledJobStatus();
      logger.info('Scheduled jobs status', status);
    }, 60 * 60 * 1000);
    
  } catch (error) {
    logger.error('Failed to start scheduled jobs service', { error });
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  startScheduledJobs().catch((error) => {
    logger.error('Scheduled jobs service failed', { error });
    process.exit(1);
  });
}

export { startScheduledJobs };
