import { Worker } from 'bullmq';
import { logger } from '@/utils/logger';
import { 
  emailQueue, 
  qrCodeQueue, 
  syncGroupsQueue,
  QUEUE_NAMES 
} from './queue';
import { processProvisionJob, processProvisionJobFailed } from './workers/provisionWorker';
import { processEmailJob, processEmailJobFailed } from './workers/emailWorker';
import { processQRCodeJob, processQRCodeJobFailed } from './workers/qrCodeWorker';
import { processSyncGroupsJob, processSyncGroupsJobFailed } from './workers/syncGroupsWorker';

// Create workers
const emailWorker = new Worker(QUEUE_NAMES.EMAIL, processEmailJob, {
  concurrency: 5, // Process up to 5 email jobs concurrently
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 50 // Keep last 50 failed jobs
});

const qrCodeWorker = new Worker(QUEUE_NAMES.QR_CODE, processQRCodeJob, {
  concurrency: 3, // Process up to 3 QR code jobs concurrently
  removeOnComplete: 100,
  removeOnFail: 50
});

const syncGroupsWorker = new Worker(QUEUE_NAMES.SYNC_GROUPS, processSyncGroupsJob, {
  concurrency: 1, // Only one sync groups job at a time
  removeOnComplete: 50,
  removeOnFail: 25
});

const provisionWorker = new Worker(QUEUE_NAMES.PROVISION, processProvisionJob, {
  concurrency: 2,
  removeOnComplete: 100,
  removeOnFail: 50
});

// Worker event handlers
emailWorker.on('completed', (job) => {
  logger.info(`Email worker completed job ${job.id}`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`Email worker failed job ${job.id}:`, err);
  processEmailJobFailed(job, err);
});

qrCodeWorker.on('completed', (job) => {
  logger.info(`QR Code worker completed job ${job.id}`);
});

qrCodeWorker.on('failed', (job, err) => {
  logger.error(`QR Code worker failed job ${job.id}:`, err);
  processQRCodeJobFailed(job, err);
});

syncGroupsWorker.on('completed', (job) => {
  logger.info(`Sync Groups worker completed job ${job.id}`);
});

syncGroupsWorker.on('failed', (job, err) => {
  logger.error(`Sync Groups worker failed job ${job.id}:`, err);
  processSyncGroupsJobFailed(job, err);
});

provisionWorker.on('completed', (job) => {
  logger.info(`Provision worker completed job ${job.id}`);
});

provisionWorker.on('failed', (job, err) => {
  logger.error(`Provision worker failed job ${job.id}:`, err);
  processProvisionJobFailed(job, err);
});

// Graceful shutdown
async function gracefulShutdown() {
  logger.info('Shutting down workers gracefully...');
  
  await emailWorker.close();
  await qrCodeWorker.close();
  await syncGroupsWorker.close();
  await provisionWorker.close();
  
  logger.info('All workers closed');
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

logger.info('MRM360 Task Workers started');
logger.info(`Email worker: ${QUEUE_NAMES.EMAIL}`);
logger.info(`QR Code worker: ${QUEUE_NAMES.QR_CODE}`);
logger.info(`Sync Groups worker: ${QUEUE_NAMES.SYNC_GROUPS}`);
logger.info(`Provision worker: ${QUEUE_NAMES.PROVISION}`);
