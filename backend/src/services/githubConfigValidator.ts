import { logger } from '@/utils/logger';

export interface GitHubConfig {
  baseUrl: string;
  token: string;
  organization: string;
  parentTeamId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class GitHubConfigValidator {
  /**
   * Validate GitHub configuration object
   */
  static validate(config: GitHubConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate baseUrl
    if (!config.baseUrl) {
      errors.push('GitHub base URL is required');
    } else {
      try {
        const url = new URL(config.baseUrl);
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
          errors.push('GitHub base URL must have a valid protocol (http or https)');
        }
        if (!url.hostname.includes('github.com') && !url.hostname.includes('api.github.com')) {
          warnings.push('GitHub base URL should typically be https://api.github.com');
        }
      } catch (e) {
        errors.push('GitHub base URL is not a valid URL');
      }
    }

    // Validate token
    if (!config.token) {
      errors.push('GitHub personal access token is required');
    } else {
      if (config.token.length < 40) {
        errors.push('GitHub token appears to be too short (should be at least 40 characters)');
      }
      if (config.token.includes('ghp_') && config.token.length !== 40) {
        errors.push('GitHub personal access token format appears invalid');
      }
      if (config.token.includes('gho_') && config.token.length !== 40) {
        errors.push('GitHub fine-grained personal access token format appears invalid');
      }
    }

    // Validate organization
    if (!config.organization) {
      errors.push('GitHub organization name is required');
    } else {
      if (config.organization.length < 1) {
        errors.push('GitHub organization name cannot be empty');
      }
      if (config.organization.length > 39) {
        errors.push('GitHub organization name cannot exceed 39 characters');
      }
      if (!/^[a-zA-Z0-9-]+$/.test(config.organization)) {
        errors.push('GitHub organization name can only contain letters, numbers, and hyphens');
      }
    }

    // Validate parentTeamId (optional)
    if (config.parentTeamId) {
      if (!/^\d+$/.test(config.parentTeamId)) {
        errors.push('Parent team ID must be a numeric string');
      }
      if (parseInt(config.parentTeamId) <= 0) {
        errors.push('Parent team ID must be a positive number');
      }
    }

    // Check for common configuration issues
    if (config.baseUrl && config.baseUrl.includes('github.com') && !config.baseUrl.includes('api.github.com')) {
      warnings.push('Consider using https://api.github.com instead of https://github.com for API calls');
    }

    if (config.token && config.token.length === 40 && !config.token.startsWith('ghp_') && !config.token.startsWith('gho_')) {
      warnings.push('GitHub token format does not match expected patterns');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate configuration from environment variables
   */
  static validateEnvironment(): ValidationResult {
    const config: GitHubConfig = {
      baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com',
      token: process.env.GITHUB_TOKEN || '',
      organization: process.env.GITHUB_ORGANIZATION || '',
      parentTeamId: process.env.GITHUB_PARENT_TEAM_ID
    };

    return this.validate(config);
  }

  /**
   * Check if configuration is production ready
   */
  static isProductionReady(config: GitHubConfig): boolean {
    const result = this.validate(config);
    
    if (!result.isValid) {
      return false;
    }

    // Production-specific checks
    if (config.baseUrl.includes('http:')) {
      return false; // Must use HTTPS in production
    }

    if (config.token.length < 40) {
      return false; // Token must be valid length
    }

    return true;
  }

  /**
   * Get configuration from environment variables
   */
  static getConfigFromEnv(): GitHubConfig {
    const config: GitHubConfig = {
      baseUrl: process.env.GITHUB_BASE_URL || 'https://api.github.com',
      token: process.env.GITHUB_TOKEN || '',
      organization: process.env.GITHUB_ORGANIZATION || '',
      parentTeamId: process.env.GITHUB_PARENT_TEAM_ID
    };

    return config;
  }

  /**
   * Validate and log configuration status
   */
  static validateAndLog(config: GitHubConfig): ValidationResult {
    const result = this.validate(config);
    
    if (result.isValid) {
      logger.info('GitHub configuration is valid');
      if (result.warnings.length > 0) {
        logger.warn('GitHub configuration warnings:', result.warnings);
      }
    } else {
      logger.error('GitHub configuration validation failed:', result.errors);
      if (result.warnings.length > 0) {
        logger.warn('GitHub configuration warnings:', result.warnings);
      }
    }

    return result;
  }

  /**
   * Check if required environment variables are set
   */
  static checkRequiredEnvVars(): string[] {
    const missing: string[] = [];
    
    if (!process.env.GITHUB_TOKEN) {
      missing.push('GITHUB_TOKEN');
    }
    
    if (!process.env.GITHUB_ORGANIZATION) {
      missing.push('GITHUB_ORGANIZATION');
    }

    return missing;
  }

  /**
   * Get configuration summary for logging
   */
  static getConfigSummary(config: GitHubConfig): string {
    const maskedToken = config.token ? `${config.token.substring(0, 8)}...` : 'NOT_SET';
    return `GitHub Config: ${config.baseUrl}, Org: ${config.organization}, Token: ${maskedToken}`;
  }

  /**
   * Validate token format without exposing the actual token
   */
  static validateTokenFormat(token: string): boolean {
    if (!token) return false;
    
    // Check for GitHub personal access token format
    if (token.startsWith('ghp_') && token.length === 40) {
      return true;
    }
    
    // Check for GitHub fine-grained personal access token format
    if (token.startsWith('gho_') && token.length === 40) {
      return true;
    }
    
    // Check for GitHub app installation token format
    if (token.startsWith('ghs_') && token.length === 40) {
      return true;
    }
    
    // Check for GitHub OAuth app token format
    if (token.startsWith('gho_') && token.length === 40) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if configuration has minimum required permissions
   */
  static hasMinimumPermissions(config: GitHubConfig): boolean {
    // This is a basic check - actual permission validation would require API calls
    if (!config.token || !config.organization) {
      return false;
    }
    
    return true;
  }
}
