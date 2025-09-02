import { AuthentikService } from './authentikService';
import { AuthentikConfigValidator, AuthentikConfig } from '@/utils/authentikConfigValidator';
import { logger } from '@/utils/logger';

export class AuthentikServiceFactory {
  /**
   * Create and validate Authentik service instance
   */
  static createService(config: AuthentikConfig): AuthentikService {
    logger.info('Creating Authentik service instance');
    
    // Validate configuration
    const validation = AuthentikConfigValidator.validate(config);
    
    if (!validation.isValid) {
      const errorMessage = `Invalid Authentik configuration: ${validation.errors.join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    if (validation.warnings.length > 0) {
      logger.warn('Authentik configuration warnings', { warnings: validation.warnings });
    }
    
    // Log configuration summary
    const configSummary = AuthentikConfigValidator.getConfigSummary(config);
    logger.info('Authentik service configuration:', configSummary);
    
    // Create service instance
    const service = new AuthentikService(config);
    
    logger.info('Authentik service instance created successfully');
    return service;
  }

  /**
   * Create service from environment variables
   */
  static createServiceFromEnv(): AuthentikService {
    logger.info('Creating Authentik service from environment variables');
    
    const config: AuthentikConfig = {
      baseUrl: process.env.AUTHENTIK_BASE_URL || '',
      token: process.env.AUTHENTIK_TOKEN || '',
      parentGroupTemplate: process.env.AUTHENTIK_PARENT_GROUP_TEMPLATE || '{parent_team_type}'
    };
    
    return this.createService(config);
  }

  /**
   * Create service with fallback configuration
   */
  static createServiceWithFallback(
    primaryConfig: AuthentikConfig,
    fallbackConfig?: AuthentikConfig
  ): AuthentikService {
    logger.info('Creating Authentik service with fallback configuration');
    
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
  static createMockService(): AuthentikService {
    logger.info('Creating mock Authentik service for testing/development');
    
    const mockConfig: AuthentikConfig = {
      baseUrl: 'http://localhost:9000',
      token: 'mock-token',
      parentGroupTemplate: '{parent_team_type}'
    };
    
    // Override validation for mock service
    const originalValidate = AuthentikConfigValidator.validate;
    AuthentikConfigValidator.validate = () => ({
      isValid: true,
      errors: [],
      warnings: ['Using mock configuration']
    });
    
    try {
      const service = new AuthentikService(mockConfig);
      logger.info('Mock Authentik service created successfully');
      return service;
    } finally {
      // Restore original validation
      AuthentikConfigValidator.validate = originalValidate;
    }
  }

  /**
   * Validate service health
   */
  static async validateServiceHealth(service: AuthentikService): Promise<boolean> {
    try {
      logger.info('Validating Authentik service health');
      
      const isHealthy = await service.healthCheck();
      
      if (isHealthy) {
        logger.info('Authentik service health check passed');
      } else {
        logger.warn('Authentik service health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('Authentik service health check error:', error);
      return false;
    }
  }

  /**
   * Get service status information
   */
  static async getServiceStatus(service: AuthentikService): Promise<{
    isHealthy: boolean;
    lastHealthCheck: Date;
    configuration: string;
  }> {
    const isHealthy = await this.validateServiceHealth(service);
    
    return {
      isHealthy,
      lastHealthCheck: new Date(),
      configuration: AuthentikConfigValidator.getConfigSummary({
        baseUrl: process.env.AUTHENTIK_BASE_URL || '',
        token: process.env.AUTHENTIK_TOKEN || '',
        parentGroupTemplate: process.env.AUTHENTIK_PARENT_GROUP_TEMPLATE || '{parent_team_type}'
      })
    };
  }
}
