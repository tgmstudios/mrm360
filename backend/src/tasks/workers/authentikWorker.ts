import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';

interface AuthentikJobData {
  action: 'update_paid_status' | 'sync_all';
  userId?: string;
  paidStatus?: boolean;
  backgroundTaskId?: string;
}

export async function processAuthentikJob(job: Job<AuthentikJobData>) {
  const { action, userId, paidStatus, backgroundTaskId } = job.data;
  
  logger.info(`Processing Authentik job ${job.id} - Action: ${action}`, {
    action,
    userId,
    paidStatus,
    backgroundTaskId
  });
  
  // Add additional logging to help debug
  if (action === 'update_paid_status' && userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, authentikId: true, authentikPk: true, paidStatus: true }
      });
      
      if (user) {
        logger.info('Found user for Authentik job', {
          internalUserId: user.id,
          email: user.email,
          authentikId: user.authentikId,
          authentikPk: user.authentikPk,
          currentPaidStatus: user.paidStatus,
          targetPaidStatus: paidStatus
        });
      } else {
        logger.error('User not found for Authentik job', { userId });
      }
    } catch (error) {
      logger.error('Error fetching user for Authentik job', { error, userId });
    }
  }
  
  try {
    // Import here to avoid circular dependencies
    const { MemberPaidStatusService } = await import('@/services/memberPaidStatusService');
    
    const service = new MemberPaidStatusService(prisma);
    let result: any;
    
    switch (action) {
      case 'update_paid_status':
        if (!userId || paidStatus === undefined) {
          throw new Error('userId and paidStatus are required for update_paid_status action');
        }
        await service.updateMemberPaidStatus(userId, paidStatus);
        result = { success: true, message: `Updated paid status for user ${userId} to ${paidStatus}` };
        break;
        
      case 'sync_all':
        await service.syncAllPaidStatuses();
        result = { success: true, message: 'Synced all member paid statuses' };
        break;
        
      default:
        throw new Error(`Unknown Authentik action: ${action}`);
    }
    
    logger.info(`Authentik job ${job.id} completed successfully`);
    return result;
    
  } catch (error) {
    logger.error(`Authentik job ${job.id} failed:`, error);
    
    if (backgroundTaskId) {
      try {
        const taskManager = new BackgroundTaskManager(prisma);
        await taskManager.markTaskFailed(backgroundTaskId, {
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (taskError) {
        logger.error('Failed to mark background task as failed:', taskError);
      }
    }
    
    throw error;
  }
}

export async function processAuthentikJobFailed(job: Job<AuthentikJobData>, error: Error) {
  logger.error(`Authentik job ${job.id} failed:`, error);
  
  // Additional error handling logic can be added here
  // For example, sending notifications, updating metrics, etc.
}
