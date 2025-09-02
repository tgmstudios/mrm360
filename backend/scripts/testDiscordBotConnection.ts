#!/usr/bin/env tsx

import { DiscordBotServiceFactory } from '../src/services/discordBotServiceFactory';
import { logger } from '../src/utils/logger';

async function testDiscordBotConnection() {
  try {
    logger.info('Testing Discord bot connection...');
    
    // Create Discord bot service
    const discordService = DiscordBotServiceFactory.createServiceFromEnv();
    logger.info('Discord bot service created');
    
    // Connect to Discord
    await discordService.connect();
    logger.info('Discord bot connected successfully');
    
    // Test guild access
    const guild = await discordService.getGuild();
    if (guild) {
      logger.info(`Successfully connected to guild: ${guild.name}`);
    } else {
      logger.error('Failed to access guild');
    }
    
    // Test health status
    const healthStatus = await discordService.getHealthStatus();
    logger.info('Discord bot health status:', healthStatus);
    
    // Keep the connection alive for a few seconds to test persistence
    logger.info('Keeping connection alive for 10 seconds...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Disconnect
    await discordService.disconnect();
    logger.info('Discord bot disconnected successfully');
    
  } catch (error) {
    logger.error('Discord bot connection test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDiscordBotConnection();
