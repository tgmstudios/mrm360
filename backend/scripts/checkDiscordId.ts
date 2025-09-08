#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

async function checkDiscordId() {
  const prisma = new PrismaClient();
  
  try {
    logger.info('🔍 Checking Discord ID 474422126103756810...');
    
    // Check if Discord account exists
    const discordAccount = await prisma.discordAccount.findUnique({
      where: { discordId: '474422126103756810' },
      include: {
        user: true
      }
    });
    
    if (!discordAccount) {
      logger.info('❌ Discord account not found');
      
      // Check all Discord accounts
      logger.info('\n📋 All Discord accounts:');
      const discordAccounts = await prisma.discordAccount.findMany({
        include: {
          user: true
        },
        orderBy: {
          linkedAt: 'desc'
        },
        take: 10
      });
      
      for (const account of discordAccounts) {
        logger.info(`   ${account.discordId} - ${account.username} (${account.user.email})`);
      }
      
      return;
    }
    
    logger.info(`✅ Discord account found:`);
    logger.info(`   Discord ID: ${discordAccount.discordId}`);
    logger.info(`   Username: ${discordAccount.username}`);
    logger.info(`   User ID: ${discordAccount.userId}`);
    logger.info(`   User Email: ${discordAccount.user.email}`);
    logger.info(`   Linked at: ${discordAccount.linkedAt}`);
    
    // Check background tasks for this Discord ID
    logger.info('\n📋 Background tasks for this Discord ID:');
    const tasks = await prisma.backgroundTask.findMany({
      where: {
        entityId: '474422126103756810'
      },
      include: {
        subtasks: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    logger.info(`   Found ${tasks.length} tasks`);
    for (const task of tasks) {
      logger.info(`   - ${task.name}: ${task.status} (${task.subtasks.length} subtasks)`);
    }
    
  } catch (error) {
    logger.error('❌ Error checking Discord ID:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDiscordId();
