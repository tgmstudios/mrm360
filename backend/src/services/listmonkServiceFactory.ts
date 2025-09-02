import { ListMonkService } from './listmonkService';
import { ListMonkConfigValidator, ListMonkConfigValidation } from '@/utils/listmonkConfigValidator';
import { ListMonkConfig } from '@/types';
import { logger } from '@/utils/logger';

export class ListMonkServiceFactory {
  /**
   * Create and validate ListMonk service instance
   */
  static createService(config: ListMonkConfig): ListMonkService {
    logger.info('Creating ListMonk service instance');
    
    // Validate configuration
    const validation = ListMonkConfigValidator.validate(config);
    
    if (!validation.isValid) {
      const errorMessage = `Invalid ListMonk configuration: ${validation.errors.join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    if (validation.warnings.length > 0) {
      logger.warn('ListMonk configuration warnings', { warnings: validation.warnings });
    }
    
    // Log configuration summary
    const configSummary = ListMonkConfigValidator.getConfigSummary(config);
    logger.info('ListMonk service configuration:', configSummary);
    
    // Create service instance
    const service = new ListMonkService(config);
    
    logger.info('ListMonk service instance created successfully');
    return service;
  }

  /**
   * Create service from environment variables
   */
  static createServiceFromEnv(): ListMonkService {
    logger.info('Creating ListMonk service from environment variables');
    
    const config: ListMonkConfig = {
      baseUrl: process.env.LISTMONK_BASE_URL || '',
      username: process.env.LISTMONK_USERNAME || '',
      password: process.env.LISTMONK_PASSWORD || '',
      timeout: process.env.LISTMONK_TIMEOUT ? parseInt(process.env.LISTMONK_TIMEOUT) : undefined
    };
    
    return this.createService(config);
  }

  /**
   * Create service with fallback configuration
   */
  static createServiceWithFallback(
    primaryConfig: ListMonkConfig,
    fallbackConfig?: ListMonkConfig
  ): ListMonkService {
    logger.info('Creating ListMonk service with fallback configuration');
    
    try {
      return this.createService(primaryConfig);
    } catch (error) {
      if (fallbackConfig) {
        logger.warn('Primary configuration failed, using fallback', { error });
        return this.createService(fallbackConfig);
      }
      throw error;
    }
  }

  /**
   * Create mock service for testing/development
   */
  static createMockService(): ListMonkService {
    logger.info('Creating mock ListMonk service for testing/development');
    
    const mockConfig: ListMonkConfig = {
      baseUrl: 'http://localhost:9000',
      username: 'admin',
      password: 'listmonk',
      timeout: 30000
    };
    
    // Override validation for mock service
    const originalValidate = ListMonkConfigValidator.validate;
    ListMonkConfigValidator.validate = () => ({
      isValid: true,
      errors: [],
      warnings: ['Using mock configuration']
    });
    
    try {
      const service = new ListMonkService(mockConfig);
      logger.info('Mock ListMonk service created successfully');
      return service;
    } finally {
      // Restore original validation
      ListMonkConfigValidator.validate = originalValidate;
    }
  }

  /**
   * Validate service health
   */
  static async validateServiceHealth(service: ListMonkService): Promise<boolean> {
    try {
      logger.info('Validating ListMonk service health');
      
      const isHealthy = await service.healthCheck();
      
      if (isHealthy) {
        logger.info('ListMonk service health check passed');
      } else {
        logger.warn('ListMonk service health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('ListMonk service health check error:', error);
      return false;
    }
  }

  /**
   * Get service status information
   */
  static async getServiceStatus(service: ListMonkService): Promise<{
    isHealthy: boolean;
    lastHealthCheck: Date;
    configuration: string;
  }> {
    const isHealthy = await this.validateServiceHealth(service);
    
    return {
      isHealthy,
      lastHealthCheck: new Date(),
      configuration: ListMonkConfigValidator.getConfigSummary({
        baseUrl: process.env.LISTMONK_BASE_URL || '',
        username: process.env.LISTMONK_USERNAME || '',
        password: process.env.LISTMONK_PASSWORD || '',
        timeout: process.env.LISTMONK_TIMEOUT ? parseInt(process.env.LISTMONK_TIMEOUT) : undefined
      })
    };
  }

  /**
   * Check environment configuration status
   */
  static checkEnvironmentStatus(): {
    validation: ListMonkConfigValidation;
    envVars: { missing: string[]; present: string[] };
    envStatus: Record<string, { set: boolean; value?: string }>;
  } {
    const validation = ListMonkConfigValidator.validateFromEnv();
    const envVars = ListMonkConfigValidator.checkRequiredEnvVars();
    const envStatus = ListMonkConfigValidator.getEnvVarStatus();

    return {
      validation,
      envVars,
      envStatus
    };
  }

  /**
   * Get recommended configuration for current environment
   */
  static getRecommendedConfig(): Partial<ListMonkConfig> {
    const environment = process.env.NODE_ENV as 'development' | 'staging' | 'production' || 'development';
    return ListMonkConfigValidator.getRecommendedConfig(environment);
  }

  /**
   * Create service with automatic fallback to mock in development
   */
  static createServiceWithAutoFallback(): ListMonkService {
    logger.info('Creating ListMonk service with automatic fallback');
    
    try {
      // Try to create service from environment variables
      return this.createServiceFromEnv();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        logger.warn('Environment configuration failed, using mock service for development', { error });
        return this.createMockService();
      }
      throw error;
    }
  }
}
