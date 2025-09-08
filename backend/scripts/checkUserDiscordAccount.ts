#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { logger } from '../src/utils/logger';

async function checkUserDiscordAccount() {
  const prisma = new PrismaClient();
  
  try {
    logger.info('🔍 Checking Discord account for user 474422126103756810...');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: '474422126103756810' },
      include: {
        discordAccount: true
      }
    });
    
    if (!user) {
      logger.info('❌ User not found in database');
      return;
    }
    
    logger.info(`✅ User found: ${user.email}`);
    logger.info(`   Name: ${user.firstName} ${user.lastName}`);
    logger.info(`   Discord account: ${user.discordAccount ? 'LINKED' : 'NOT LINKED'}`);
    
    if (user.discordAccount) {
      logger.info(`   Discord ID: ${user.discordAccount.discordId}`);
      logger.info(`   Discord Username: ${user.discordAccount.username}`);
      logger.info(`   Linked at: ${user.discordAccount.linkedAt}`);
    }
    
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
    
  } catch (error) {
    logger.error('❌ Error checking Discord account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUserDiscordAccount();
