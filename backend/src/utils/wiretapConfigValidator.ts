import { logger } from './logger';

export interface WiretapConfig {
  baseUrl: string;
  token: string;
  projectTemplate: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class WiretapConfigValidator {
  /**
   * Validate Wiretap configuration
   */
  static validate(config: WiretapConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate baseUrl
    if (!config.baseUrl) {
      errors.push('WIRETAP_BASE_URL is required');
    } else {
      try {
        const url = new URL(config.baseUrl);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          errors.push('WIRETAP_BASE_URL must use HTTP or HTTPS protocol');
        }
        if (!url.hostname) {
          errors.push('WIRETAP_BASE_URL must have a valid hostname');
        }
      } catch (error) {
        errors.push('WIRETAP_BASE_URL must be a valid URL');
      }
    }

    // Validate token
    if (!config.token) {
      errors.push('WIRETAP_TOKEN is required');
    } else if (config.token === 'mock-token' || config.token === 'your-wiretap-api-token') {
      warnings.push('WIRETAP_TOKEN appears to be a placeholder value');
    } else if (config.token.length < 10) {
      warnings.push('WIRETAP_TOKEN seems too short for a valid API token');
    }

    // Validate projectTemplate
    if (!config.projectTemplate) {
      errors.push('WIRETAP_PROJECT_TEMPLATE is required');
    } else if (!config.projectTemplate.includes('{event_type}')) {
      warnings.push('WIRETAP_PROJECT_TEMPLATE should contain {event_type} placeholder');
    }

    // Check for common configuration issues
    if (config.baseUrl && config.baseUrl.includes('localhost') && config.baseUrl.includes('8080')) {
      warnings.push('Using localhost:8080 - ensure Wiretap is running locally');
    }

    if (config.baseUrl && config.baseUrl.includes('http://') && !config.baseUrl.includes('localhost')) {
      warnings.push('Using HTTP instead of HTTPS for production - consider using HTTPS for security');
    }

    const isValid = errors.length === 0;

    if (isValid) {
      logger.info('Wiretap configuration validation passed');
    } else {
      logger.error('Wiretap configuration validation failed', { errors });
    }

    if (warnings.length > 0) {
      logger.warn('Wiretap configuration warnings', { warnings });
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
    const config: WiretapConfig = {
      baseUrl: process.env.WIRETAP_BASE_URL || '',
      token: process.env.WIRETAP_TOKEN || '',
      projectTemplate: process.env.WIRETAP_PROJECT_TEMPLATE || '{event_type}-project'
    };

    return this.validate(config);
  }

  /**
   * Check if configuration is ready for production use
   */
  static isProductionReady(config: WiretapConfig): boolean {
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

    if (config.token === 'mock-token' || config.token === 'your-wiretap-api-token') {
      return false;
    }

    return true;
  }

  /**
   * Get configuration summary
   */
  static getConfigSummary(config: WiretapConfig): string {
    const validation = this.validate(config);
    const isProdReady = this.isProductionReady(config);
    
    return `
Wiretap Configuration Summary:
- Base URL: ${config.baseUrl}
- Token: ${config.token ? '***' + config.token.slice(-4) : 'NOT SET'}
- Project Template: ${config.projectTemplate}
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
           token !== 'your-wiretap-api-token';
  }

  static validateProjectTemplate(template: string): boolean {
    return template && template.includes('{event_type}');
  }
}


