#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

async function debugSubtaskIssue() {
  const prisma = new PrismaClient();
  
  try {
    logger.info('🔍 Debugging subtask issue...');
    
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
    
    logger.info(`\n📋 Parent Task: ${task.name}`);
    logger.info(`   ID: ${task.id}`);
    logger.info(`   Status: ${task.status}`);
    logger.info(`   Subtasks count: ${task.subtasks.length}`);
    
    for (let i = 0; i < task.subtasks.length; i++) {
      const subtask = task.subtasks[i];
      logger.info(`\n   Subtask ${i}:`);
      logger.info(`     ID: ${subtask.id}`);
      logger.info(`     Name: ${subtask.name}`);
      logger.info(`     Status: ${subtask.status}`);
      logger.info(`     Step Index: ${subtask.stepIndex}`);
      logger.info(`     Parent Task ID: ${subtask.parentTaskId}`);
      
      // Test the lookup that's failing
      const lookupResult = await prisma.backgroundTask.findFirst({
        where: {
          parentTaskId: task.id,
          stepIndex: i
        }
      });
      
      logger.info(`     Lookup result: ${lookupResult ? 'FOUND' : 'NOT FOUND'}`);
      if (lookupResult) {
        logger.info(`     Lookup ID: ${lookupResult.id}`);
        logger.info(`     Match: ${lookupResult.id === subtask.id ? 'YES' : 'NO'}`);
      }
    }
    
    // Test the getSubtaskId method logic
    logger.info('\n🧪 Testing getSubtaskId logic...');
    for (let i = 0; i < task.subtasks.length; i++) {
      try {
        const subtask = await prisma.backgroundTask.findFirst({ 
          where: { 
            parentTaskId: task.id, 
            stepIndex: i 
          } 
        });
        
        if (subtask) {
          logger.info(`   Step ${i}: Found subtask ${subtask.id} - ${subtask.name}`);
        } else {
          logger.info(`   Step ${i}: NOT FOUND`);
        }
      } catch (error) {
        logger.info(`   Step ${i}: ERROR - ${error}`);
      }
    }
    
  } catch (error) {
    logger.error('❌ Error debugging subtask issue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugSubtaskIssue();
