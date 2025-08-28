export interface WikiJsConfig {
  baseUrl: string;
  token: string;
  basePath: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class WikiJsConfigValidator {
  /**
   * Validate Wiki.js configuration
   */
  static validate(config: WikiJsConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate baseUrl
    if (!config.baseUrl) {
      errors.push('Wiki.js base URL is required');
    } else {
      try {
        const url = new URL(config.baseUrl);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          errors.push('Wiki.js base URL must use HTTP or HTTPS protocol');
        }
        if (!url.hostname) {
          errors.push('Wiki.js base URL must have a valid hostname');
        }
      } catch (e) {
        errors.push('Wiki.js base URL is not a valid URL');
      }
    }

    // Validate token
    if (!config.token) {
      errors.push('Wiki.js API token is required');
    } else if (config.token.length < 10) {
      warnings.push('Wiki.js API token seems too short - ensure it\'s a valid Bearer token');
    }

    // Validate basePath
    if (!config.basePath) {
      errors.push('Wiki.js base path is required');
    } else {
      if (!config.basePath.startsWith('/')) {
        errors.push('Wiki.js base path must start with a forward slash');
      }
      if (config.basePath.endsWith('/')) {
        warnings.push('Wiki.js base path should not end with a forward slash');
      }
      if (!/^[a-zA-Z0-9\/\-_]+$/.test(config.basePath)) {
        errors.push('Wiki.js base path contains invalid characters. Use only letters, numbers, hyphens, underscores, and forward slashes');
      }
    }

    // Additional validation checks
    if (config.baseUrl && config.baseUrl.includes('localhost') && !config.baseUrl.includes('127.0.0.1')) {
      warnings.push('Using localhost in production environment - consider using IP address or domain name');
    }

    if (config.baseUrl && config.baseUrl.startsWith('http://') && !config.baseUrl.includes('localhost')) {
      warnings.push('Using HTTP instead of HTTPS in production environment - consider enabling SSL');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate environment variables for Wiki.js
   */
  static validateEnvironment(): ValidationResult {
    const config: WikiJsConfig = {
      baseUrl: process.env.WIKIJS_BASE_URL || '',
      token: process.env.WIKIJS_API_TOKEN || '',
      basePath: process.env.WIKIJS_BASE_PATH || ''
    };

    return this.validate(config);
  }

  /**
   * Check if configuration is production-ready
   */
  static isProductionReady(config: WikiJsConfig): boolean {
    const validation = this.validate(config);
    
    if (!validation.isValid) {
      return false;
    }

    // Production-specific checks
    if (config.baseUrl.startsWith('http://')) {
      return false; // HTTP not allowed in production
    }

    if (config.baseUrl.includes('localhost') || config.baseUrl.includes('127.0.0.1')) {
      return false; // Localhost not allowed in production
    }

    if (config.token.length < 20) {
      return false; // Token too short for production
    }

    return true;
  }

  /**
   * Get configuration from environment variables
   */
  static getConfigFromEnv(): WikiJsConfig {
    return {
      baseUrl: process.env.WIKIJS_BASE_URL || '',
      token: process.env.WIKIJS_API_TOKEN || '',
      basePath: process.env.WIKIJS_BASE_PATH || ''
    };
  }

  /**
   * Validate and get configuration from environment
   */
  static validateAndGetConfig(): { config: WikiJsConfig; validation: ValidationResult } {
    const config = this.getConfigFromEnv();
    const validation = this.validate(config);
    
    return { config, validation };
  }

  /**
   * Get configuration summary for logging
   */
  static getConfigSummary(config: WikiJsConfig): string {
    const url = new URL(config.baseUrl);
    return `Wiki.js: ${url.hostname}${url.port ? `:${url.port}` : ''}${config.basePath}`;
  }

  /**
   * Check if required environment variables are set
   */
  static getMissingEnvVars(): string[] {
    const required = ['WIKIJS_BASE_URL', 'WIKIJS_API_TOKEN', 'WIKIJS_BASE_PATH'];
    const missing: string[] = [];

    for (const envVar of required) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    return missing;
  }

  /**
   * Validate configuration for specific operations
   */
  static validateForOperation(config: WikiJsConfig, operation: 'read' | 'write' | 'admin'): ValidationResult {
    const baseValidation = this.validate(config);
    
    if (!baseValidation.isValid) {
      return baseValidation;
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Operation-specific validation
    switch (operation) {
      case 'read':
        // Read operations require minimal validation
        break;
      
      case 'write':
        // Write operations require valid token and base path
        if (!config.token || config.token.length < 10) {
          errors.push('Valid API token required for write operations');
        }
        break;
      
      case 'admin':
        // Admin operations require HTTPS and strong token
        if (config.baseUrl.startsWith('http://')) {
          errors.push('HTTPS required for admin operations');
        }
        if (config.token.length < 20) {
          errors.push('Strong API token required for admin operations');
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors: [...baseValidation.errors, ...errors],
      warnings: [...baseValidation.warnings, ...warnings]
    };
  }
}
