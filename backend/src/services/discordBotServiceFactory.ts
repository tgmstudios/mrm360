import { DiscordBotService } from './discordBotService';
import { logger } from '@/utils/logger';

export interface DiscordBotConfig {
  botToken: string;
  guildId: string;
  categoryId: string;
}

export class DiscordBotServiceFactory {
  static createService(config: DiscordBotConfig): DiscordBotService {
    logger.info('Creating Discord bot service with provided configuration');
    
    // Validate configuration
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      throw new Error(`Invalid Discord bot configuration: ${validation.errors.join(', ')}`);
    }

    return new DiscordBotService(config);
  }

  static createServiceFromEnv(): DiscordBotService {
    logger.info('Creating Discord bot service from environment variables');
    
    const config: DiscordBotConfig = {
      botToken: process.env.DISCORD_BOT_TOKEN || '',
      guildId: process.env.DISCORD_GUILD_ID || '',
      categoryId: process.env.DISCORD_CATEGORY_ID || ''
    };

    return this.createService(config);
  }

  static createMockService(): DiscordBotService {
    logger.info('Creating mock Discord bot service for development');
    
    const config: DiscordBotConfig = {
      botToken: 'mock-token',
      guildId: '123456789012345678',
      categoryId: '123456789012345678'
    };

    return new DiscordBotService(config);
  }

  static validateConfig(config: DiscordBotConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.botToken || config.botToken.trim() === '') {
      errors.push('Bot token is required');
    }

    if (!config.guildId || config.guildId.trim() === '') {
      errors.push('Guild ID is required');
    }

    if (!config.categoryId || config.categoryId.trim() === '') {
      errors.push('Category ID is required');
    }

    // Validate Discord bot token format (basic check)
    if (config.botToken && !this.isValidBotToken(config.botToken)) {
      errors.push('Bot token format appears invalid');
    }

    // Validate Discord ID format (basic check)
    if (config.guildId && !config.guildId.match(/^\d{17,19}$/)) {
      errors.push('Guild ID format appears invalid');
    }

    if (config.categoryId && !config.categoryId.match(/^\d{17,19}$/)) {
      errors.push('Category ID format appears invalid');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async validateServiceHealth(service: DiscordBotService): Promise<boolean> {
    try {
      const healthStatus = await service.getHealthStatus();
      return healthStatus.status === 'healthy';
    } catch (error) {
      logger.error('Failed to validate Discord bot service health:', error);
      return false;
    }
  }

  static isProductionReady(config: DiscordBotConfig): boolean {
    const validation = this.validateConfig(config);
    if (!validation.isValid) {
      return false;
    }

    // Check if using mock values
    if (config.botToken === 'mock-token' || 
        config.guildId === 'mock-guild-id' || 
        config.categoryId === 'mock-category-id') {
      return false;
    }

    return true;
  }

  private static isValidBotToken(token: string): boolean {
    // Discord bot token format validation
    // Modern Discord tokens can have various lengths and formats
    // Basic validation: should be a reasonable length and contain alphanumeric characters
    if (!token || token.length < 50 || token.length > 100) {
      return false;
    }
    
    // Should contain at least one dot (.) separator
    if (!token.includes('.')) {
      return false;
    }
    
    // Should only contain valid characters: letters, numbers, dots, hyphens, underscores
    // Discord tokens can also contain plus signs (+)
    const validTokenRegex = /^[A-Za-z0-9._+-]+$/;
    return validTokenRegex.test(token);
  }
}
