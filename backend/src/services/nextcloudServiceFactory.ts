import { NextcloudService } from './nextcloudService';
import { NextcloudConfigValidator } from '@/utils/nextcloudConfigValidator';
import { logger } from '@/utils/logger';

export interface NextcloudConfig {
  baseUrl: string;
  username: string;
  password: string;
  basePath: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class NextcloudServiceFactory {
  /**
   * Create a Nextcloud service with the given configuration
   */
  static createService(config: NextcloudConfig): NextcloudService {
    logger.info('Creating Nextcloud service with configuration', { 
      baseUrl: config.baseUrl, 
      username: config.username,
      basePath: config.basePath 
    });

    // Validate configuration before creating service
    const validation = NextcloudConfigValidator.validate(config);
    if (!validation.isValid) {
      throw new Error(`Invalid Nextcloud configuration: ${validation.errors.join(', ')}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      logger.warn('Nextcloud configuration warnings:', validation.warnings);
    }

    return new NextcloudService(config);
  }

  /**
   * Create a Nextcloud service from environment variables
   */
  static createServiceFromEnv(): NextcloudService {
    logger.info('Creating Nextcloud service from environment variables');

    const config: NextcloudConfig = {
      baseUrl: process.env.NEXTCLOUD_BASE_URL || '',
      username: process.env.NEXTCLOUD_USERNAME || '',
      password: process.env.NEXTCLOUD_PASSWORD || '',
      basePath: process.env.NEXTCLOUD_BASE_PATH || '/teams'
    };

    return this.createService(config);
  }

  /**
   * Create a mock Nextcloud service for development/testing
   */
  static createMockService(): NextcloudService {
    logger.info('Creating mock Nextcloud service for development/testing');

    const config: NextcloudConfig = {
      baseUrl: 'http://localhost:8080',
      username: 'mock-user',
      password: 'mock-password',
      basePath: '/teams'
    };

    return new NextcloudService(config);
  }

  /**
   * Validate service health and connectivity
   */
  static async validateServiceHealth(service: NextcloudService): Promise<boolean> {
    try {
      logger.info('Validating Nextcloud service health');

      // Try to create a test group to verify connectivity
      const testGroupName = `health-check-${Date.now()}`;
      const testGroup = await service.createGroup(testGroupName);
      
      if (testGroup && testGroup.id) {
        // Clean up the test group
        await service.deleteGroup(testGroup.id);
        logger.info('Nextcloud service health check passed');
        return true;
      }

      logger.warn('Nextcloud service health check failed - no group ID returned');
      return false;
    } catch (error) {
      logger.error('Nextcloud service health check failed:', error);
      return false;
    }
  }

  /**
   * Check if the service is properly configured
   */
  static isServiceConfigured(config: NextcloudConfig): boolean {
    return !!(config.baseUrl && config.username && config.password);
  }

  /**
   * Get service status information
   */
  static getServiceStatus(config: NextcloudConfig): {
    configured: boolean;
    baseUrl: string;
    username: string;
    basePath: string;
    hasPassword: boolean;
  } {
    return {
      configured: this.isServiceConfigured(config),
      baseUrl: config.baseUrl || 'Not configured',
      username: config.username || 'Not configured',
      basePath: config.basePath || 'Not configured',
      hasPassword: !!(config.password && config.password.trim().length > 0)
    };
  }

  /**
   * Create a service with fallback to mock if configuration is invalid
   */
  static createServiceWithFallback(config: NextcloudConfig): NextcloudService {
    try {
      return this.createService(config);
    } catch (error) {
      logger.warn('Failed to create Nextcloud service with provided config, falling back to mock service:', error);
      return this.createMockService();
    }
  }

  /**
   * Create a service based on environment and fallback strategy
   */
  static createServiceFromEnvWithFallback(): NextcloudService {
    try {
      return this.createServiceFromEnv();
    } catch (error) {
      logger.warn('Failed to create Nextcloud service from environment, falling back to mock service:', error);
      return this.createMockService();
    }
  }
}
