import { NextApiRequest, NextApiResponse } from 'next';
import { DiscordBotServiceFactory } from '@/services/discordBotServiceFactory';
import { DiscordConfigValidator } from '@/services/discordConfigValidator';
import { logger } from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Discord bot health check requested');

    // Get environment status
    const envStatus = DiscordConfigValidator.getEnvironmentStatus();
    
    // Try to create and validate service
    let serviceHealth = null;
    let serviceError = null;
    
    try {
      const service = DiscordBotServiceFactory.createServiceFromEnv();
      serviceHealth = await DiscordBotServiceFactory.validateServiceHealth(service);
    } catch (error) {
      serviceError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Check if production ready
    const isProductionReady = DiscordConfigValidator.isProductionReady({
      botToken: process.env.DISCORD_BOT_TOKEN || '',
      guildId: process.env.DISCORD_GUILD_ID || '',
      categoryId: process.env.DISCORD_CATEGORY_ID || ''
    });

    const healthData = {
      status: serviceHealth ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: {
        botToken: envStatus.botToken,
        guildId: envStatus.guildId,
        categoryId: envStatus.categoryId,
        overall: envStatus.overall
      },
      service: {
        health: serviceHealth,
        error: serviceError
      },
      production: {
        ready: isProductionReady
      },
      setup: {
        instructions: DiscordConfigValidator.generateSetupInstructions()
      }
    };

    const statusCode = serviceHealth ? 200 : 503;
    
    res.status(statusCode).json(healthData);
    
    logger.info(`Discord bot health check completed with status: ${healthData.status}`);
    
  } catch (error) {
    logger.error('Discord bot health check failed:', error);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      setup: {
        instructions: DiscordConfigValidator.generateSetupInstructions()
      }
    });
  }
}
