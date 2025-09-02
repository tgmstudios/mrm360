#!/usr/bin/env tsx

import { DiscordRoleManager } from '../src/utils/discordRoleManager';
import { logger } from '../src/utils/logger';
import { prisma } from '../src/models/prismaClient';

async function testDiscordRoleAssignment() {
  try {
    logger.info('Testing Discord role assignment with real user...');
    
    // Find a user with a Discord account linked
    const discordAccount = await prisma.discordAccount.findFirst({
      include: {
        user: {
          include: {
            userInterests: true
          }
        }
      }
    });
    
    if (!discordAccount) {
      logger.info('No Discord accounts found in database');
      return;
    }
    
    logger.info('Found Discord account:', {
      userId: discordAccount.userId,
      discordId: discordAccount.discordId,
      username: discordAccount.username,
      userRole: discordAccount.user.role,
      userInterests: discordAccount.user.userInterests.map(i => i.interest)
    });
    
    // Test role assignment
    await DiscordRoleManager.updateRolesEfficiently(
      discordAccount.userId,
      discordAccount.user.role,
      discordAccount.user.userInterests.map(i => i.interest)
    );
    
    logger.info('Discord role assignment test completed');
    
  } catch (error) {
    logger.error('Discord role assignment test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDiscordRoleAssignment();
