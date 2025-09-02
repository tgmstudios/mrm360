import { ListMonkConfig } from '@/types';
import { logger } from './logger';

export interface ListMonkConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ListMonkConfigValidator {
  /**
   * Validate ListMonk configuration
   */
  static validate(config: ListMonkConfig): ListMonkConfigValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate base URL
    if (!config.baseUrl || config.baseUrl.trim().length === 0) {
      errors.push('ListMonk base URL is required');
    } else if (!this.isValidUrl(config.baseUrl)) {
      errors.push('ListMonk base URL must be a valid HTTP/HTTPS URL');
    } else if (!config.baseUrl.startsWith('http://') && !config.baseUrl.startsWith('https://')) {
      errors.push('ListMonk base URL must start with http:// or https://');
    }

    // Validate username
    if (!config.username || config.username.trim().length === 0) {
      errors.push('ListMonk username is required');
    } else if (config.username.length > 100) {
      errors.push('ListMonk username must be less than 100 characters');
    }

    // Validate password
    if (!config.password || config.password.trim().length === 0) {
      errors.push('ListMonk password is required');
    } else if (config.password.length < 6) {
      warnings.push('ListMonk password should be at least 6 characters long');
    }

    // Validate timeout
    if (config.timeout !== undefined) {
      if (typeof config.timeout !== 'number' || config.timeout <= 0) {
        errors.push('ListMonk timeout must be a positive number');
      } else if (config.timeout < 1000) {
        warnings.push('ListMonk timeout should be at least 1000ms');
      } else if (config.timeout > 300000) {
        warnings.push('ListMonk timeout should not exceed 300000ms (5 minutes)');
      }
    }

    // Production environment checks
    if (process.env.NODE_ENV === 'production') {
      if (config.baseUrl && config.baseUrl.includes('localhost')) {
        warnings.push('Using localhost URL in production environment');
      }
      
      if (config.baseUrl && !config.baseUrl.startsWith('https://')) {
        warnings.push('Using HTTP instead of HTTPS in production environment');
      }
      
      if (config.password && config.password.length < 12) {
        warnings.push('Consider using a stronger password in production environment');
      }
    }

    // Development environment checks
    if (process.env.NODE_ENV === 'development') {
      if (config.baseUrl && !config.baseUrl.includes('localhost') && !config.baseUrl.includes('127.0.0.1')) {
        warnings.push('Using non-localhost URL in development environment');
      }
    }

    const isValid = errors.length === 0;

    if (!isValid) {
      logger.error('ListMonk configuration validation failed', { errors, warnings });
    } else if (warnings.length > 0) {
      logger.warn('ListMonk configuration validation warnings', { warnings });
    } else {
      logger.info('ListMonk configuration validation passed');
    }

    return {
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Validate configuration from environment variables
   */
  static validateFromEnv(): ListMonkConfigValidation {
    const config: ListMonkConfig = {
      baseUrl: process.env.LISTMONK_BASE_URL || '',
      username: process.env.LISTMONK_USERNAME || '',
      password: process.env.LISTMONK_PASSWORD || '',
      timeout: process.env.LISTMONK_TIMEOUT ? parseInt(process.env.LISTMONK_TIMEOUT) : undefined
    };

    return this.validate(config);
  }

  /**
   * Get configuration summary for logging
   */
  static getConfigSummary(config: ListMonkConfig): string {
    const baseUrl = config.baseUrl ? this.maskUrl(config.baseUrl) : 'not set';
    const username = config.username ? this.maskUsername(config.username) : 'not set';
    const password = config.password ? '***' : 'not set';
    const timeout = config.timeout ? `${config.timeout}ms` : 'default';

    return `ListMonk(baseUrl=${baseUrl}, username=${username}, password=${password}, timeout=${timeout})`;
  }

  /**
   * Check if configuration is production-ready
   */
  static isProductionReady(config: ListMonkConfig): boolean {
    const validation = this.validate(config);
    
    if (!validation.isValid) {
      return false;
    }

    // Additional production checks
    if (!config.baseUrl.startsWith('https://')) {
      return false;
    }

    if (config.baseUrl.includes('localhost') || config.baseUrl.includes('127.0.0.1')) {
      return false;
    }

    if (config.password && config.password.length < 12) {
      return false;
    }

    return true;
  }

  /**
   * Get recommended configuration for different environments
   */
  static getRecommendedConfig(environment: 'development' | 'staging' | 'production'): Partial<ListMonkConfig> {
    switch (environment) {
      case 'development':
        return {
          baseUrl: 'http://localhost:9000',
          username: 'admin',
          password: 'listmonk',
          timeout: 30000
        };
      
      case 'staging':
        return {
          baseUrl: 'https://listmonk-staging.example.com',
          username: 'admin',
          password: 'strong-password-here',
          timeout: 30000
        };
      
      case 'production':
        return {
          baseUrl: 'https://listmonk.example.com',
          username: 'admin',
          password: 'very-strong-password-here',
          timeout: 60000
        };
      
      default:
        return {};
    }
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mask URL for logging (hide sensitive parts)
   */
  private static maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      const port = urlObj.port ? `:${urlObj.port}` : '';
      const pathname = urlObj.pathname;
      
      return `${urlObj.protocol}//${hostname}${port}${pathname}`;
    } catch {
      return 'invalid-url';
    }
  }

  /**
   * Mask username for logging (hide sensitive parts)
   */
  private static maskUsername(username: string): string {
    if (username.length <= 2) {
      return username;
    }
    
    return username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  }

  /**
   * Check if all required environment variables are set
   */
  static checkRequiredEnvVars(): { missing: string[]; present: string[] } {
    const requiredVars = ['LISTMONK_BASE_URL', 'LISTMONK_USERNAME', 'LISTMONK_PASSWORD'];
    const missing: string[] = [];
    const present: string[] = [];

    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        present.push(varName);
      } else {
        missing.push(varName);
      }
    });

    return { missing, present };
  }

  /**
   * Get environment variable status
   */
  static getEnvVarStatus(): Record<string, { set: boolean; value?: string }> {
    const vars = {
      LISTMONK_BASE_URL: process.env.LISTMONK_BASE_URL,
      LISTMONK_USERNAME: process.env.LISTMONK_USERNAME,
      LISTMONK_PASSWORD: process.env.LISTMONK_PASSWORD,
      LISTMONK_TIMEOUT: process.env.LISTMONK_TIMEOUT,
      LISTMONK_NEWSLETTER_LIST_ID: process.env.LISTMONK_NEWSLETTER_LIST_ID
    };

    const status: Record<string, { set: boolean; value?: string }> = {};
    
    Object.entries(vars).forEach(([key, value]) => {
      status[key] = {
        set: !!value,
        value: value ? (key.includes('PASSWORD') ? '***' : value) : undefined
      };
    });

    return status;
  }
}
