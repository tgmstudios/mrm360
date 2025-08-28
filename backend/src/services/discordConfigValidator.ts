import { DiscordBotConfig } from './discordBotServiceFactory';
import { logger } from '@/utils/logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DiscordConfigValidator {
  static validate(config: DiscordBotConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    logger.info('Validating Discord bot configuration');

    // Required fields
    if (!config.botToken || config.botToken.trim() === '') {
      errors.push('DISCORD_BOT_TOKEN is required');
    }

    if (!config.guildId || config.guildId.trim() === '') {
      errors.push('DISCORD_GUILD_ID is required');
    }

    if (!config.categoryId || config.categoryId.trim() === '') {
      errors.push('DISCORD_CATEGORY_ID is required');
    }

    // Bot token validation
    if (config.botToken) {
      if (!this.isValidBotToken(config.botToken)) {
        errors.push('DISCORD_BOT_TOKEN format is invalid');
      }
      
      if (config.botToken === 'mock-token' || config.botToken.includes('mock')) {
        warnings.push('Using mock bot token - not suitable for production');
      }
    }

    // Guild ID validation
    if (config.guildId) {
      if (!this.isValidDiscordId(config.guildId)) {
        errors.push('DISCORD_GUILD_ID format is invalid');
      }
      
      if (config.guildId === 'mock-guild-id' || config.guildId.includes('mock')) {
        warnings.push('Using mock guild ID - not suitable for production');
      }
    }

    // Category ID validation
    if (config.categoryId) {
      if (!this.isValidDiscordId(config.categoryId)) {
        errors.push('DISCORD_CATEGORY_ID format is invalid');
      }
      
      if (config.categoryId === 'mock-category-id' || config.categoryId.includes('mock')) {
        warnings.push('Using mock category ID - not suitable for production');
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    if (result.isValid) {
      logger.info('Discord bot configuration validation passed');
    } else {
      logger.error('Discord bot configuration validation failed:', errors);
    }

    if (warnings.length > 0) {
      logger.warn('Discord bot configuration warnings:', warnings);
    }

    return result;
  }

  static validateEnvironment(): ValidationResult {
    logger.info('Validating Discord bot environment configuration');

    const config: DiscordBotConfig = {
      botToken: process.env.DISCORD_BOT_TOKEN || '',
      guildId: process.env.DISCORD_GUILD_ID || '',
      categoryId: process.env.DISCORD_CATEGORY_ID || ''
    };

    return this.validate(config);
  }

  static isProductionReady(config: DiscordBotConfig): boolean {
    const validation = this.validate(config);
    
    if (!validation.isValid) {
      return false;
    }

    // Check for mock values
    if (config.botToken.includes('mock') || 
        config.guildId.includes('mock') || 
        config.categoryId.includes('mock')) {
      return false;
    }

    // Check for development patterns
    if (config.botToken.length < 50 || 
        config.guildId.length < 17 || 
        config.categoryId.length < 17) {
      return false;
    }

    return true;
  }

  static getEnvironmentStatus(): {
    botToken: 'configured' | 'missing' | 'invalid';
    guildId: 'configured' | 'missing' | 'invalid';
    categoryId: 'configured' | 'missing' | 'invalid';
    overall: 'ready' | 'partial' | 'not_ready';
  } {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const categoryId = process.env.DISCORD_CATEGORY_ID;

    const botTokenStatus = !botToken ? 'missing' : 
                          this.isValidBotToken(botToken) ? 'configured' : 'invalid';
    
    const guildIdStatus = !guildId ? 'missing' : 
                         this.isValidDiscordId(guildId) ? 'configured' : 'invalid';
    
    const categoryIdStatus = !categoryId ? 'missing' : 
                            this.isValidDiscordId(categoryId) ? 'configured' : 'invalid';

    let overall: 'ready' | 'partial' | 'not_ready' = 'not_ready';
    
    if (botTokenStatus === 'configured' && guildIdStatus === 'configured' && categoryIdStatus === 'configured') {
      overall = 'ready';
    } else if (botTokenStatus === 'configured' || guildIdStatus === 'configured' || categoryIdStatus === 'configured') {
      overall = 'partial';
    }

    return {
      botToken: botTokenStatus,
      guildId: guildIdStatus,
      categoryId: categoryIdStatus,
      overall
    };
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

  private static isValidDiscordId(id: string): boolean {
    // Discord IDs are 17-19 digit numbers
    const discordIdRegex = /^\d{17,19}$/;
    return discordIdRegex.test(id);
  }

  static generateSetupInstructions(): string[] {
    return [
      'Discord Bot Setup Instructions:',
      '',
      '1. Create a Discord Application:',
      '   - Go to https://discord.com/developers/applications',
      '   - Click "New Application" and give it a name',
      '   - Go to the "Bot" section and click "Add Bot"',
      '   - Copy the bot token',
      '',
      '2. Set Environment Variables:',
      '   - DISCORD_BOT_TOKEN=your_bot_token_here',
      '   - DISCORD_GUILD_ID=your_server_id_here',
      '   - DISCORD_CATEGORY_ID=your_category_id_here',
      '',
      '3. Bot Permissions:',
      '   - The bot needs the following permissions:',
      '   - Manage Channels, Manage Roles, View Channels, Send Messages',
      '   - Go to OAuth2 > URL Generator in your Discord app',
      '   - Select "bot" scope and the required permissions',
      '   - Use the generated URL to invite the bot to your server',
      '',
      '4. Get Server and Category IDs:',
      '   - Enable Developer Mode in Discord (User Settings > Advanced)',
      '   - Right-click on your server name and "Copy Server ID"',
      '   - Right-click on a category and "Copy ID"',
      '',
      '5. Test the Integration:',
      '   - Run the test script: npm run test:discord',
      '   - Check the health endpoint: /api/health/discord'
    ];
  }
}
