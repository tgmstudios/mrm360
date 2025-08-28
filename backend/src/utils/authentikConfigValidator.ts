import { logger } from './logger';

export interface AuthentikConfig {
  baseUrl: string;
  token: string;
  parentGroupTemplate: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class AuthentikConfigValidator {
  /**
   * Validate Authentik configuration
   */
  static validate(config: AuthentikConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate baseUrl
    if (!config.baseUrl) {
      errors.push('AUTHENTIK_BASE_URL is required');
    } else {
      try {
        const url = new URL(config.baseUrl);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          errors.push('AUTHENTIK_BASE_URL must use HTTP or HTTPS protocol');
        }
        if (!url.hostname) {
          errors.push('AUTHENTIK_BASE_URL must have a valid hostname');
        }
      } catch (error) {
        errors.push('AUTHENTIK_BASE_URL must be a valid URL');
      }
    }

    // Validate token
    if (!config.token) {
      errors.push('AUTHENTIK_TOKEN is required');
    } else if (config.token === 'mock-token' || config.token === 'your-authentik-api-token') {
      warnings.push('AUTHENTIK_TOKEN appears to be a placeholder value');
    } else if (config.token.length < 10) {
      warnings.push('AUTHENTIK_TOKEN seems too short for a valid API token');
    }

    // Validate parentGroupTemplate
    if (!config.parentGroupTemplate) {
      errors.push('AUTHENTIK_PARENT_GROUP_TEMPLATE is required');
    } else if (!config.parentGroupTemplate.includes('{parent_team_type}')) {
      warnings.push('AUTHENTIK_PARENT_GROUP_TEMPLATE should contain {parent_team_type} placeholder');
    }

    // Check for common configuration issues
    if (config.baseUrl && config.baseUrl.includes('localhost') && config.baseUrl.includes('9000')) {
      warnings.push('Using localhost:9000 - ensure Authentik is running locally');
    }

    if (config.baseUrl && config.baseUrl.includes('http://') && !config.baseUrl.includes('localhost')) {
      warnings.push('Using HTTP instead of HTTPS for production - consider using HTTPS for security');
    }

    const isValid = errors.length === 0;

    if (isValid) {
      logger.info('Authentik configuration validation passed');
    } else {
      logger.error('Authentik configuration validation failed', { errors });
    }

    if (warnings.length > 0) {
      logger.warn('Authentik configuration warnings', { warnings });
    }

    return {
      isValid,
      errors,
      warnings
    };
  }

  /**
   * Validate environment variables
   */
  static validateEnvironment(): ValidationResult {
    const config: AuthentikConfig = {
      baseUrl: process.env.AUTHENTIK_BASE_URL || '',
      token: process.env.AUTHENTIK_TOKEN || '',
      parentGroupTemplate: process.env.AUTHENTIK_PARENT_GROUP_TEMPLATE || '{parent_team_type}-team'
    };

    return this.validate(config);
  }

  /**
   * Check if configuration is ready for production use
   */
  static isProductionReady(config: AuthentikConfig): boolean {
    const result = this.validate(config);
    
    if (!result.isValid) {
      return false;
    }

    // Additional production checks
    if (config.baseUrl.includes('localhost') || config.baseUrl.includes('127.0.0.1')) {
      return false;
    }

    if (config.baseUrl.startsWith('http://')) {
      return false;
    }

    if (config.token === 'mock-token' || config.token === 'your-authentik-api-token') {
      return false;
    }

    return true;
  }

  /**
   * Get configuration summary
   */
  static getConfigSummary(config: AuthentikConfig): string {
    const validation = this.validate(config);
    const isProdReady = this.isProductionReady(config);
    
    return `
Authentik Configuration Summary:
- Base URL: ${config.baseUrl}
- Token: ${config.token ? '***' + config.token.slice(-4) : 'NOT SET'}
- Parent Group Template: ${config.parentGroupTemplate}
- Configuration Valid: ${validation.isValid ? 'YES' : 'NO'}
- Production Ready: ${isProdReady ? 'YES' : 'NO'}
- Errors: ${validation.errors.length}
- Warnings: ${validation.warnings.length}
    `.trim();
  }

  /**
   * Validate specific configuration values
   */
  static validateBaseUrl(baseUrl: string): boolean {
    try {
      const url = new URL(baseUrl);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  static validateToken(token: string): boolean {
    return token && token.length >= 10 && 
           token !== 'mock-token' && 
           token !== 'your-authentik-api-token';
  }

  static validateParentGroupTemplate(template: string): boolean {
    return template && template.includes('{parent_team_type}');
  }
}
