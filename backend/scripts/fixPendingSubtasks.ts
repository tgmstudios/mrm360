#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { DiscordBotServiceFactory } from '../src/services/discordBotServiceFactory';
import { logger } from '../src/utils/logger';

async function fixPendingSubtasks() {
  const prisma = new PrismaClient();
  
  try {
    logger.info('🔧 Fixing pending Discord subtasks...');
    
    // Get all pending Discord subtasks
    const pendingSubtasks = await prisma.backgroundTask.findMany({
      where: {
        parentTaskId: { not: null },
        status: 'PENDING',
        OR: [
          { name: { contains: 'Role' } },
          { name: { contains: 'Discord' } }
        ]
      },
      include: {
        parentTask: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to avoid overwhelming the system
    });
    
    logger.info(`Found ${pendingSubtasks.length} pending subtasks to fix`);
    
    // Initialize Discord service
    const discordService = DiscordBotServiceFactory.createServiceFromEnv();
    await discordService.connect();
    logger.info('Discord service connected');
    
    let fixedCount = 0;
    let errorCount = 0;
    
    for (const subtask of pendingSubtasks) {
      try {
        logger.info(`\n🔧 Processing subtask: ${subtask.name}`);
        logger.info(`   ID: ${subtask.id}`);
        logger.info(`   Parent: ${subtask.parentTask?.name}`);
        logger.info(`   Step: ${subtask.stepIndex}`);
        
        // Extract role ID and action from subtask name
        const roleMatch = subtask.name.match(/(Remove|Assign) Role (\d+)/);
        if (!roleMatch) {
          logger.info(`   ⚠️  Skipping - cannot parse role info`);
          continue;
        }
        
        const action = roleMatch[1].toLowerCase();
        const roleId = roleMatch[2];
        
        // Get Discord user ID from parent task entity ID
        const discordUserId = subtask.parentTask?.entityId;
        if (!discordUserId) {
          logger.info(`   ⚠️  Skipping - no Discord user ID in parent task`);
          continue;
        }
        
        logger.info(`   Action: ${action}`);
        logger.info(`   Role ID: ${roleId}`);
        logger.info(`   Discord User ID: ${discordUserId}`);
        
        // Mark subtask as running
        await prisma.backgroundTask.update({
          where: { id: subtask.id },
          data: { 
            status: 'RUNNING',
            startedAt: new Date(),
            progress: 0
          }
        });
        
        // Perform the Discord action
        if (action === 'remove') {
          await discordService.removeRole(discordUserId, roleId);
        } else if (action === 'assign') {
          await discordService.assignRole(discordUserId, roleId);
        }
        
        // Mark subtask as completed
        await prisma.backgroundTask.update({
          where: { id: subtask.id },
          data: { 
            status: 'COMPLETED',
            finishedAt: new Date(),
            progress: 100,
            result: {
              action,
              roleId,
              discordUserId,
              success: true,
              message: `Successfully ${action}ed role ${roleId} for user ${discordUserId}`
            }
          }
        });
        
        logger.info(`   ✅ Successfully ${action}ed role ${roleId}`);
        fixedCount++;
        
      } catch (error) {
        logger.error(`   ❌ Error processing subtask ${subtask.id}:`, error);
        
        // Mark subtask as failed
        await prisma.backgroundTask.update({
          where: { id: subtask.id },
          data: { 
            status: 'FAILED',
            finishedAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        });
        
        errorCount++;
      }
    }
    
    await discordService.disconnect();
    
    logger.info(`\n📊 Fix Summary:`);
    logger.info(`   Fixed: ${fixedCount}`);
    logger.info(`   Errors: ${errorCount}`);
    logger.info(`   Total processed: ${fixedCount + errorCount}`);
    
  } catch (error) {
    logger.error('❌ Error fixing pending subtasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixPendingSubtasks();
