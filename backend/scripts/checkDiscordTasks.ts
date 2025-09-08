#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

async function checkDiscordTasks() {
  const prisma = new PrismaClient();
  
  try {
    logger.info('🔍 Checking Discord background tasks...');
    
    // Get all Discord-related background tasks
    const discordTasks = await prisma.backgroundTask.findMany({
      where: {
        OR: [
          { entityType: { contains: 'DISCORD' } },
          { name: { contains: 'Discord' } },
          { description: { contains: 'Discord' } }
        ]
      },
      include: {
        subtasks: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    logger.info(`Found ${discordTasks.length} Discord-related tasks`);
    
    for (const task of discordTasks) {
      logger.info(`\n📋 Task: ${task.name}`);
      logger.info(`   ID: ${task.id}`);
      logger.info(`   Status: ${task.status}`);
      logger.info(`   Entity: ${task.entityType} - ${task.entityId}`);
      logger.info(`   Created: ${task.createdAt}`);
      logger.info(`   Started: ${task.startedAt || 'Not started'}`);
      logger.info(`   Finished: ${task.finishedAt || 'Not finished'}`);
      logger.info(`   Progress: ${task.progress}%`);
      if (task.error) {
        logger.info(`   Error: ${task.error}`);
      }
      
      if (task.subtasks && task.subtasks.length > 0) {
        logger.info(`   Subtasks (${task.subtasks.length}):`);
        for (const subtask of task.subtasks) {
          logger.info(`     - ${subtask.name}: ${subtask.status} (${subtask.progress}%)`);
          if (subtask.error) {
            logger.info(`       Error: ${subtask.error}`);
          }
        }
      }
    }
    
    // Check for specific user's tasks
    const userId = '474422126103756810'; // The user from the issue
    logger.info(`\n🔍 Checking tasks for user ${userId}...`);
    
    const userTasks = await prisma.backgroundTask.findMany({
      where: {
        entityId: userId
      },
      include: {
        subtasks: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    logger.info(`Found ${userTasks.length} tasks for user ${userId}`);
    
    for (const task of userTasks) {
      logger.info(`\n👤 User Task: ${task.name}`);
      logger.info(`   Status: ${task.status}`);
      logger.info(`   Created: ${task.createdAt}`);
      logger.info(`   Started: ${task.startedAt || 'Not started'}`);
      logger.info(`   Finished: ${task.finishedAt || 'Not finished'}`);
      
      if (task.subtasks && task.subtasks.length > 0) {
        logger.info(`   Subtasks:`);
        for (const subtask of task.subtasks) {
          logger.info(`     - ${subtask.name}: ${subtask.status}`);
          if (subtask.error) {
            logger.info(`       Error: ${subtask.error}`);
          }
        }
      }
    }
    
    // Check task statistics
    const stats = await prisma.backgroundTask.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: {
        OR: [
          { entityType: { contains: 'DISCORD' } },
          { name: { contains: 'Discord' } }
        ]
      }
    });
    
    logger.info('\n📊 Discord Task Statistics:');
    for (const stat of stats) {
      logger.info(`   ${stat.status}: ${stat._count.status}`);
    }
    
  } catch (error) {
    logger.error('❌ Error checking Discord tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDiscordTasks();
