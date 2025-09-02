#!/usr/bin/env tsx

import { Worker } from 'bullmq';
import { logger } from '../src/utils/logger';
import { discordQueue, QUEUE_NAMES } from '../src/tasks/queue';
import { processDiscordJob, processDiscordJobFailed, shutdownDiscordBot, initializeDiscordBotWorker } from '../src/tasks/workers/discordBotWorker';
import Redis from 'ioredis';

// Import Redis connection from queue file
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

logger.info('Starting Discord Bot Worker...');

// Create Discord worker
const discordWorker = new Worker(QUEUE_NAMES.DISCORD, processDiscordJob, {
  connection: redis,
  concurrency: 1, // Process one Discord job at a time to avoid conflicts
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 50 }
});

// Worker event handlers
discordWorker.on('completed', (job) => {
  if (job) {
    logger.info(`Discord worker completed job ${job.id}`);
  }
});

discordWorker.on('failed', (job, err) => {
  if (job) {
    logger.error(`Discord worker failed job ${job.id}:`, err);
    processDiscordJobFailed(job, err);
  }
});

discordWorker.on('error', (error) => {
  logger.error('Discord worker error:', error);
});

discordWorker.on('stalled', (jobId) => {
  logger.warn(`Discord worker job ${jobId} stalled`);
});

// Graceful shutdown
async function gracefulShutdown() {
  logger.info('Shutting down Discord bot worker gracefully...');
  
  try {
    await discordWorker.close();
    await shutdownDiscordBot();
    await redis.quit();
    logger.info('Discord bot worker shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during Discord bot worker shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception in Discord bot worker:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection in Discord bot worker:', { reason, promise });
  gracefulShutdown();
});

// Initialize Discord bot
initializeDiscordBotWorker().catch(error => {
  logger.error('Failed to initialize Discord bot worker:', error);
});

logger.info('Discord Bot Worker started successfully');
logger.info('Waiting for Discord jobs...');

// Keep the process alive
process.stdin.resume();


