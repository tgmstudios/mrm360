import { Worker, Job } from 'bullmq';
import { DiscordBotService } from '@/services/discordBotService';
import { DiscordBotServiceFactory } from '@/services/discordBotServiceFactory';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';
import { DiscordBatchTaskManager } from '@/managers/discordBatchTaskManager';

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
        result = await processBatchRoleUpdate(job, discordService, backgroundTask);
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

// Helper function to get role name from Discord
async function getRoleName(discordService: DiscordBotService, roleId: string): Promise<string | null> {
  try {
    const guild = await discordService.getGuild();
    if (!guild) return null;
    
    const role = await guild.roles.fetch(roleId);
    return role ? role.name : null;
  } catch (error) {
    logger.warn(`Failed to fetch role name for ${roleId}:`, error);
    return null;
  }
}

// Process batch role updates with proper subtask management
async function processBatchRoleUpdate(job: Job, discordService: DiscordBotService, backgroundTask: any): Promise<any> {
  const batchTaskManager = new DiscordBatchTaskManager(prisma);
  const { userId, targetRoles, rolesToRemove, backgroundTaskId } = job.data;
  
  try {
    logger.info(`Processing batch role update for user ${userId}`, {
      targetRoles,
      rolesToRemove,
      backgroundTaskId
    });

    const results = [];
    let stepIndex = 0;

    // Process role removals first
    for (const roleId of rolesToRemove || []) {
      try {
        await batchTaskManager.markSubtaskRunning(backgroundTaskId, stepIndex);
        await discordService.removeRole(userId, roleId);
        
        // Get role name for better result information
        const roleName = await getRoleName(discordService, roleId);
        
        await batchTaskManager.markSubtaskCompleted(backgroundTaskId, stepIndex, {
          action: 'removeRole',
          roleId,
          roleName: roleName || `Role ${roleId}`,
          userId,
          success: true,
          message: `Successfully removed role ${roleName || roleId} from user ${userId}`
        });
        results.push({ 
          action: 'removeRole', 
          roleId, 
          roleName: roleName || `Role ${roleId}`,
          userId,
          success: true,
          message: `Successfully removed role ${roleName || roleId} from user ${userId}`
        });
      } catch (error) {
        const roleName = await getRoleName(discordService, roleId);
        await batchTaskManager.markSubtaskFailed(backgroundTaskId, stepIndex, 
          `Failed to remove role ${roleName || roleId} from user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.push({ 
          action: 'removeRole', 
          roleId, 
          roleName: roleName || `Role ${roleId}`,
          userId,
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          message: `Failed to remove role ${roleName || roleId} from user ${userId}`
        });
      }
      stepIndex++;
    }

    // Process role assignments
    for (const roleId of targetRoles || []) {
      try {
        await batchTaskManager.markSubtaskRunning(backgroundTaskId, stepIndex);
        await discordService.assignRole(userId, roleId);
        
        // Get role name for better result information
        const roleName = await getRoleName(discordService, roleId);
        
        await batchTaskManager.markSubtaskCompleted(backgroundTaskId, stepIndex, {
          action: 'assignRole',
          roleId,
          roleName: roleName || `Role ${roleId}`,
          userId,
          success: true,
          message: `Successfully assigned role ${roleName || roleId} to user ${userId}`
        });
        results.push({ 
          action: 'assignRole', 
          roleId, 
          roleName: roleName || `Role ${roleId}`,
          userId,
          success: true,
          message: `Successfully assigned role ${roleName || roleId} to user ${userId}`
        });
      } catch (error) {
        const roleName = await getRoleName(discordService, roleId);
        await batchTaskManager.markSubtaskFailed(backgroundTaskId, stepIndex, 
          `Failed to assign role ${roleName || roleId} to user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        results.push({ 
          action: 'assignRole', 
          roleId, 
          roleName: roleName || `Role ${roleId}`,
          userId,
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error',
          message: `Failed to assign role ${roleName || roleId} to user ${userId}`
        });
      }
      stepIndex++;
    }

    // Mark the overall batch task as completed
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const success = successCount === totalCount;

    await batchTaskManager.markBatchTaskCompleted(backgroundTaskId, {
      success,
      message: `Batch role update completed: ${successCount}/${totalCount} operations successful`,
      results
    });

    return {
      success,
      message: `Batch role update completed: ${successCount}/${totalCount} operations successful`,
      results
    };

  } catch (error) {
    logger.error(`Batch role update failed for user ${userId}:`, error);
    await batchTaskManager.markBatchTaskFailed(backgroundTaskId, 
      `Batch role update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
