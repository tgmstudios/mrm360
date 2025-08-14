import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { EmailTask } from '@/types';

export async function processEmailJob(job: Job<EmailTask>) {
  const { to, subject, body, template } = job.data;
  
  logger.info(`Processing email job ${job.id} to ${to}`);
  
  try {
    // Mock email sending - replace with actual email service
    logger.info(`Sending email to ${to}: ${subject}`);
    logger.debug(`Email body: ${body}`);
    
    if (template) {
      logger.info(`Using template: ${template}`);
    }
    
    // Simulate email processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info(`Email job ${job.id} completed successfully`);
    
    return {
      success: true,
      messageId: `mock-${Date.now()}`,
      recipient: to
    };
  } catch (error) {
    logger.error(`Email job ${job.id} failed:`, error);
    throw error;
  }
}

export async function processEmailJobFailed(job: Job<EmailTask>, error: Error) {
  logger.error(`Email job ${job.id} failed permanently:`, {
    error: error.message,
    data: job.data,
    attempts: job.attemptsMade
  });
  
  // Could implement dead letter queue logic here
  // or send notification to admin
}
