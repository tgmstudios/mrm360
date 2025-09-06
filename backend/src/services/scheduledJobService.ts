import { logger } from '@/utils/logger';
import { TaskManager } from '@/managers/taskManager';

export class ScheduledJobService {
  private taskManager: TaskManager;
  private paymentStatusCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.taskManager = new TaskManager();
  }

  /**
   * Start all scheduled jobs
   */
  async startScheduledJobs(): Promise<void> {
    logger.info('Starting scheduled jobs');
    
    // Start daily payment status check
    await this.startDailyPaymentStatusCheck();
    
    logger.info('All scheduled jobs started');
  }

  /**
   * Stop all scheduled jobs
   */
  async stopScheduledJobs(): Promise<void> {
    logger.info('Stopping scheduled jobs');
    
    if (this.paymentStatusCheckInterval) {
      clearInterval(this.paymentStatusCheckInterval);
      this.paymentStatusCheckInterval = null;
    }
    
    logger.info('All scheduled jobs stopped');
  }

  /**
   * Start daily payment status check
   * Runs every day at 2:00 AM
   */
  private async startDailyPaymentStatusCheck(): Promise<void> {
    logger.info('Starting daily payment status check scheduler');
    
    // Calculate time until next 2:00 AM
    const now = new Date();
    const nextCheck = new Date(now);
    nextCheck.setHours(2, 0, 0, 0);
    
    // If it's already past 2:00 AM today, schedule for tomorrow
    if (now.getTime() >= nextCheck.getTime()) {
      nextCheck.setDate(nextCheck.getDate() + 1);
    }
    
    const timeUntilNext = nextCheck.getTime() - now.getTime();
    
    logger.info('Daily payment status check scheduled', {
      nextCheck: nextCheck.toISOString(),
      timeUntilNext: `${Math.round(timeUntilNext / 1000 / 60)} minutes`
    });
    
    // Schedule the first check
    setTimeout(() => {
      this.runDailyPaymentStatusCheck();
      
      // Then run every 24 hours
      this.paymentStatusCheckInterval = setInterval(() => {
        this.runDailyPaymentStatusCheck();
      }, 24 * 60 * 60 * 1000); // 24 hours
      
    }, timeUntilNext);
  }

  /**
   * Run the daily payment status check
   */
  private async runDailyPaymentStatusCheck(): Promise<void> {
    try {
      logger.info('Running daily payment status check');
      
      // Enqueue the payment status check job
      await this.taskManager.enqueuePaymentStatusJob({
        type: 'check-expired'
      });
      
      logger.info('Daily payment status check job enqueued');
    } catch (error) {
      logger.error('Failed to enqueue daily payment status check', { error });
    }
  }

  /**
   * Manually trigger a payment status check
   */
  async triggerPaymentStatusCheck(): Promise<string> {
    logger.info('Manually triggering payment status check');
    
    const jobId = await this.taskManager.enqueuePaymentStatusJob({
      type: 'check-expired'
    });
    
    logger.info('Payment status check triggered', { jobId });
    return jobId;
  }

  /**
   * Get status of scheduled jobs
   */
  getScheduledJobStatus(): {
    paymentStatusCheck: {
      active: boolean;
      nextRun?: Date;
    };
  } {
    return {
      paymentStatusCheck: {
        active: this.paymentStatusCheckInterval !== null,
        nextRun: this.paymentStatusCheckInterval ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined
      }
    };
  }
}
