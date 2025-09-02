#!/usr/bin/env tsx

import { DiscordRoleManager } from '../src/utils/discordRoleManager';
import { logger } from '../src/utils/logger';
import { prisma } from '../src/models/prismaClient';

async function testDiscordRoleManager() {
  try {
    logger.info('Testing Discord role manager with database lookups...');
    
    // Check if discord_configs table has data
    const configs = await prisma.discordConfig.findMany();
    logger.info(`Found ${configs.length} Discord configs in database:`, configs);
    
    // Test with sample data
    const userId = 'test-user-id';
    const classRank = 'FIRST_YEAR';
    const interests = ['OFFENSE', 'CTF'];
    
    logger.info('Testing role assignment with:', { userId, classRank, interests });
    
    // This will show what roles would be assigned
    await DiscordRoleManager.updateRolesEfficiently(userId, classRank, interests);
    
    logger.info('Discord role manager test completed');
    
  } catch (error) {
    logger.error('Discord role manager test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDiscordRoleManager();
