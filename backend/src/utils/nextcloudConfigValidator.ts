import { NextcloudConfig } from '@/services/nextcloudServiceFactory';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class NextcloudConfigValidator {
  /**
   * Validate Nextcloud configuration
   */
  static validate(config: NextcloudConfig): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate base URL
    if (!config.baseUrl || config.baseUrl.trim().length === 0) {
      errors.push('Nextcloud base URL is required');
    } else {
      try {
        const url = new URL(config.baseUrl);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          errors.push('Nextcloud base URL must use HTTP or HTTPS protocol');
        }
        if (!url.hostname) {
          errors.push('Nextcloud base URL must have a valid hostname');
        }
      } catch (error) {
        errors.push('Nextcloud base URL must be a valid URL');
      }
    }

    // Validate username
    if (!config.username || config.username.trim().length === 0) {
      errors.push('Nextcloud username is required');
    } else {
      if (config.username.length < 3) {
        warnings.push('Nextcloud username should be at least 3 characters long');
      }
      if (config.username.length > 64) {
        errors.push('Nextcloud username must be 64 characters or less');
      }
      // Nextcloud usernames should contain only alphanumeric characters, hyphens, and underscores
      if (!/^[a-zA-Z0-9_-]+$/.test(config.username)) {
        warnings.push('Nextcloud username should contain only letters, numbers, hyphens, and underscores');
      }
    }

    // Validate password
    if (!config.password || config.password.trim().length === 0) {
      errors.push('Nextcloud password is required');
    } else {
      if (config.password.length < 8) {
        warnings.push('Nextcloud password should be at least 8 characters long');
      }
      if (config.password.length > 128) {
        warnings.push('Nextcloud password is very long, consider using a shorter password');
      }
    }

    // Validate base path
    if (!config.basePath || config.basePath.trim().length === 0) {
      errors.push('Nextcloud base path is required');
    } else {
      if (!config.basePath.startsWith('/')) {
        errors.push('Nextcloud base path must start with /');
      }
      if (config.basePath.includes('..')) {
        errors.push('Nextcloud base path cannot contain directory traversal sequences');
      }
      if (config.basePath.includes(' ')) {
        warnings.push('Nextcloud base path should not contain spaces');
      }
    }

    // Additional validation for production environments
    if (this.isProductionEnvironment()) {
      if (config.baseUrl && config.baseUrl.startsWith('http://')) {
        warnings.push('Using HTTP in production is not recommended, consider using HTTPS');
      }
      
      if (config.password && config.password.length < 12) {
        warnings.push('Password should be at least 12 characters long in production');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate environment variables
   */
  static validateEnvironment(): ValidationResult {
    const config: NextcloudConfig = {
      baseUrl: process.env.NEXTCLOUD_BASE_URL || '',
      username: process.env.NEXTCLOUD_USERNAME || '',
      password: process.env.NEXTCLOUD_PASSWORD || '',
      basePath: process.env.NEXTCLOUD_BASE_PATH || '/teams'
    };

    return this.validate(config);
  }

  /**
   * Check if configuration is production ready
   */
  static isProductionReady(config: NextcloudConfig): boolean {
    const validation = this.validate(config);
    
    if (!validation.isValid) {
      return false;
    }

    // Production-specific checks
    if (config.baseUrl.startsWith('http://')) {
      return false; // HTTP not allowed in production
    }

    if (config.password.length < 12) {
      return false; // Password too short for production
    }

    // Check for common weak passwords
    const weakPasswords = ['password', 'admin', '123456', 'qwerty', 'letmein'];
    if (weakPasswords.includes(config.password.toLowerCase())) {
      return false;
    }

    return true;
  }

  /**
   * Get configuration recommendations
   */
  static getRecommendations(config: NextcloudConfig): string[] {
    const recommendations: string[] = [];

    // URL recommendations
    if (config.baseUrl.startsWith('http://')) {
      recommendations.push('Consider using HTTPS for secure communication');
    }

    // Username recommendations
    if (config.username.length < 5) {
      recommendations.push('Consider using a longer username for better security');
    }

    // Password recommendations
    if (config.password.length < 12) {
      recommendations.push('Use a password with at least 12 characters');
    }
    if (!/[A-Z]/.test(config.password)) {
      recommendations.push('Include uppercase letters in your password');
    }
    if (!/[a-z]/.test(config.password)) {
      recommendations.push('Include lowercase letters in your password');
    }
    if (!/[0-9]/.test(config.password)) {
      recommendations.push('Include numbers in your password');
    }
    if (!/[^A-Za-z0-9]/.test(config.password)) {
      recommendations.push('Include special characters in your password');
    }

    // Base path recommendations
    if (config.basePath === '/') {
      recommendations.push('Consider using a more specific base path than root');
    }
    if (config.basePath.includes(' ')) {
      recommendations.push('Avoid spaces in base path for better compatibility');
    }

    return recommendations;
  }

  /**
   * Check if current environment is production
   */
  private static isProductionEnvironment(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  /**
   * Validate specific configuration values
   */
  static validateBaseUrl(baseUrl: string): string[] {
    const errors: string[] = [];

    if (!baseUrl || baseUrl.trim().length === 0) {
      errors.push('Base URL is required');
      return errors;
    }

    try {
      const url = new URL(baseUrl);
      
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push('Base URL must use HTTP or HTTPS protocol');
      }
      
      if (!url.hostname) {
        errors.push('Base URL must have a valid hostname');
      }
      
      if (url.hostname === 'localhost' && this.isProductionEnvironment()) {
        errors.push('Localhost is not allowed in production');
      }
      
      if (url.hostname === '127.0.0.1' && this.isProductionEnvironment()) {
        errors.push('Localhost IP is not allowed in production');
      }
    } catch (error) {
      errors.push('Base URL must be a valid URL');
    }

    return errors;
  }

  static validateUsername(username: string): string[] {
    const errors: string[] = [];

    if (!username || username.trim().length === 0) {
      errors.push('Username is required');
      return errors;
    }

    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 64) {
      errors.push('Username must be 64 characters or less');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username must contain only letters, numbers, hyphens, and underscores');
    }

    // Check for reserved usernames
    const reservedUsernames = ['admin', 'root', 'system', 'guest', 'test', 'demo'];
    if (reservedUsernames.includes(username.toLowerCase())) {
      errors.push('Username is similar to reserved system usernames');
    }

    return errors;
  }

  static validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (!password || password.trim().length === 0) {
      errors.push('Password is required');
      return errors;
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (this.isProductionEnvironment() && password.length < 12) {
      errors.push('Password must be at least 12 characters long in production');
    }

    // Check for common weak passwords
    const weakPasswords = ['password', 'admin', '123456', 'qwerty', 'letmein', 'welcome'];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, choose a stronger password');
    }

    return errors;
  }

  static validateBasePath(basePath: string): string[] {
    const errors: string[] = [];

    if (!basePath || basePath.trim().length === 0) {
      errors.push('Base path is required');
      return errors;
    }

    if (!basePath.startsWith('/')) {
      errors.push('Base path must start with /');
    }

    if (basePath.includes('..')) {
      errors.push('Base path cannot contain directory traversal sequences');
    }

    if (basePath.includes(' ')) {
      warnings.push('Base path should not contain spaces');
    }

    if (basePath === '/') {
      warnings.push('Using root path may cause conflicts with system files');
    }

    return errors;
  }
}
