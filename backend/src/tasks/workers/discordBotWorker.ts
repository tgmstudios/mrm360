import { Worker, Job } from 'bullmq';
import { DiscordBotService } from '@/services/discordBotService';
import { DiscordBotServiceFactory } from '@/services/discordBotServiceFactory';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';

// Create a persistent Discord bot service instance
let discordBotService: DiscordBotService | null = null;
let isConnected = false;

// Initialize the Discord bot service
async function initializeDiscordBot(): Promise<void> {
  try {
    if (!discordBotService) {
      discordBotService = DiscordBotServiceFactory.createServiceFromEnv();
      logger.info('Discord bot service initialized');
    }
    
    if (!isConnected) {
      await discordBotService.connect();
      isConnected = true;
      logger.info('Discord bot connected and ready');
    }
  } catch (error) {
    logger.error('Failed to initialize Discord bot:', error);
    throw error;
  }
}

// Initialize Discord bot when the worker starts
export async function initializeDiscordBotWorker(): Promise<void> {
  try {
    await initializeDiscordBot();
    logger.info('Discord bot worker initialized and connected');
  } catch (error) {
    logger.error('Failed to initialize Discord bot worker:', error);
    // Don't throw here to allow the worker to continue running
    // The bot will be initialized when the first job is processed
  }
}

// Ensure Discord bot is ready before processing jobs
async function ensureDiscordBotReady(): Promise<DiscordBotService> {
  if (!discordBotService || !isConnected) {
    await initializeDiscordBot();
  }
  return discordBotService!;
}

// Job processing functions
export async function processDiscordJob(job: Job) {
  try {
    logger.info(`Processing Discord job ${job.id}`, {
      action: job.data.action,
      data: job.data
    });

    const taskManager = new BackgroundTaskManager(prisma);
    const backgroundTaskId = job.data.backgroundTaskId;
    
    // Create or get background task if provided
    let backgroundTask = null;
    if (backgroundTaskId) {
      backgroundTask = await taskManager.getTask(backgroundTaskId);
    } else {
      backgroundTask = await taskManager.createTask({
        name: `Discord ${job.data.action}`,
        description: `Discord operation: ${job.data.action}`,
        entityType: 'DISCORD',
        entityId: job.data.entityId,
        subtaskNames: ['Discord Operation']
      });
    }

    if (backgroundTask) {
      await taskManager.markTaskRunning(backgroundTask.id);
    }

    const discordService = await ensureDiscordBotReady();
    let result;

    switch (job.data.action) {
      case 'createChannel':
        result = await discordService.createChannel(job.data.name, job.data.categoryId);
        break;
      
      case 'updateChannel':
        result = await discordService.updateChannel(job.data.channelId, job.data.updates);
        break;
      
      case 'deleteChannel':
        await discordService.deleteChannel(job.data.channelId);
        result = { success: true, message: 'Channel deleted' };
        break;
      
      case 'createRole':
        result = await discordService.createRole(job.data.name, job.data.permissions);
        break;
      
      case 'updateRole':
        result = await discordService.updateRole(job.data.roleId, job.data.updates);
        break;
      
      case 'deleteRole':
        await discordService.deleteRole(job.data.roleId);
        result = { success: true, message: 'Role deleted' };
        break;
      
      case 'assignRole':
        await discordService.assignRole(job.data.userId, job.data.roleId);
        result = { success: true, message: 'Role assigned' };
        break;
      
      case 'removeRole':
        await discordService.removeRole(job.data.userId, job.data.roleId);
        result = { success: true, message: 'Role removed' };
        break;
      
      case 'setChannelPermissions':
        await discordService.setChannelPermissions(job.data.channelId, job.data.permissions);
        result = { success: true, message: 'Channel permissions updated' };
        break;
      
      case 'assignRoleToUsers':
        await discordService.assignRoleToUsers(job.data.roleId, job.data.userIds);
        result = { success: true, message: 'Role assigned to users' };
        break;
      
      case 'removeRoleFromUsers':
        await discordService.removeRoleFromUsers(job.data.roleId, job.data.userIds);
        result = { success: true, message: 'Role removed from users' };
        break;
      
      case 'batchUpdateRoles':
        await discordService.batchUpdateRoles(job.data.userId, job.data.targetRoles, job.data.rolesToRemove);
        result = { success: true, message: 'Batch role update completed' };
        break;
      
      case 'createCategory':
        result = await discordService.createCategory(job.data.name);
        break;
      
      case 'moveChannelToCategory':
        await discordService.moveChannelToCategory(job.data.channelId, job.data.categoryId);
        result = { success: true, message: 'Channel moved to category' };
        break;
      
      case 'createRoleSelectionMessage':
        result = await discordService.createRoleSelectionMessage(job.data.channelId);
        break;
      
      case 'setRoleReactionMappings':
        discordService.setRoleReactionMappings(job.data.mappings);
        result = { success: true, message: 'Role reaction mappings set' };
        break;
      
      default:
        throw new Error(`Unknown Discord action: ${job.data.action}`);
    }

    if (backgroundTask) {
      await taskManager.markTaskCompleted(backgroundTask.id, { 
        message: `Discord ${job.data.action} completed successfully`,
        result 
      });
    }

    logger.info(`Discord job ${job.id} completed successfully`);
    return result;

  } catch (error) {
    logger.error(`Discord job ${job.id} failed:`, error);
    
    if (job.data.backgroundTaskId) {
      try {
        const taskManager = new BackgroundTaskManager(prisma);
        await taskManager.markTaskFailed(job.data.backgroundTaskId, {
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (taskError) {
        logger.error('Failed to mark background task as failed:', taskError);
      }
    }
    
    throw error;
  }
}

export async function processDiscordJobFailed(job: Job, error: Error) {
  logger.error(`Discord job ${job.id} failed:`, error);
  
  if (job.data.backgroundTaskId) {
    try {
      const taskManager = new BackgroundTaskManager(prisma);
      await taskManager.markTaskFailed(job.data.backgroundTaskId, {
        message: error.message
      });
    } catch (taskError) {
      logger.error('Failed to mark background task as failed:', taskError);
    }
  }
}

// Graceful shutdown
export async function shutdownDiscordBot(): Promise<void> {
  try {
    if (discordBotService && isConnected) {
      await discordBotService.disconnect();
      isConnected = false;
      logger.info('Discord bot disconnected gracefully');
    }
  } catch (error) {
    logger.error('Error during Discord bot shutdown:', error);
  }
}

// Health check
export async function getDiscordBotHealth(): Promise<{ status: string; connected: boolean; error?: string }> {
  try {
    if (!discordBotService) {
      return { status: 'uninitialized', connected: false };
    }
    
    if (!isConnected) {
      return { status: 'disconnected', connected: false };
    }
    
    // Try to perform a simple operation to verify the bot is working
    const guild = await discordBotService.getGuild();
    if (guild) {
      return { status: 'healthy', connected: true };
    } else {
      return { status: 'unhealthy', connected: true, error: 'Guild not accessible' };
    }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      connected: isConnected, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
