#!/usr/bin/env tsx

import { DiscordRoleManager } from '../src/utils/discordRoleManager';
import { logger } from '../src/utils/logger';

async function testDiscordRoleUpdate() {
  try {
    logger.info('🧪 Testing Discord role update...');
    
    // Test with the user from the issue
    const userId = '474422126103756810';
    const classRank = 'FIRST_YEAR';
    const interests = ['OFFENSE', 'DEFENSE'];
    
    logger.info(`Testing role update for user: ${userId}`);
    logger.info(`Class rank: ${classRank}`);
    logger.info(`Interests: ${interests.join(', ')}`);
    
    // Call the role update method
    await DiscordRoleManager.updateRolesEfficiently(userId, classRank, interests);
    
    logger.info('✅ Role update initiated successfully');
    
  } catch (error) {
    logger.error('❌ Error testing Discord role update:', error);
  }
}

// Run the test
testDiscordRoleUpdate();
