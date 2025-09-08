#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { BackgroundTaskManager } from '../src/managers/backgroundTaskManager';
import { logger } from '../src/utils/logger';

async function testSubtaskUpdate() {
  const prisma = new PrismaClient();
  const taskManager = new BackgroundTaskManager(prisma);
  
  try {
    logger.info('🧪 Testing subtask update functionality...');
    
    // Get a recent Discord task with subtasks
    const task = await prisma.backgroundTask.findFirst({
      where: {
        OR: [
          { entityType: { contains: 'DISCORD' } },
          { name: { contains: 'Discord' } }
        ],
        parentTaskId: null // Only parent tasks
      },
      include: {
        subtasks: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!task) {
      logger.info('No Discord tasks found');
      return;
    }
    
    logger.info(`\n📋 Testing with task: ${task.name} (${task.id})`);
    logger.info(`   Subtasks count: ${task.subtasks.length}`);
    
    // Test updating the first subtask
    const firstSubtask = task.subtasks[0];
    logger.info(`\n🔧 Testing update on subtask: ${firstSubtask.name}`);
    logger.info(`   Current status: ${firstSubtask.status}`);
    logger.info(`   Step index: ${firstSubtask.stepIndex}`);
    
    try {
      // Test markSubtaskRunning
      logger.info('   Testing markSubtaskRunning...');
      await taskManager.markSubtaskRunning(task.id, 0);
      logger.info('   ✅ markSubtaskRunning succeeded');
      
      // Test markSubtaskCompleted
      logger.info('   Testing markSubtaskCompleted...');
      await taskManager.markSubtaskCompleted(task.id, 0, {
        test: true,
        message: 'Test completion'
      });
      logger.info('   ✅ markSubtaskCompleted succeeded');
      
      // Verify the update
      const updatedSubtask = await prisma.backgroundTask.findUnique({
        where: { id: firstSubtask.id }
      });
      
      logger.info(`   Updated status: ${updatedSubtask?.status}`);
      logger.info(`   Updated progress: ${updatedSubtask?.progress}%`);
      logger.info(`   Updated result: ${JSON.stringify(updatedSubtask?.result)}`);
      
    } catch (error) {
      logger.error(`   ❌ Error updating subtask: ${error}`);
    }
    
  } catch (error) {
    logger.error('❌ Error testing subtask update:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSubtaskUpdate();
