import { WiretapService } from './wiretapService';
import { WiretapConfigValidator, WiretapConfig } from '@/utils/wiretapConfigValidator';
import { logger } from '@/utils/logger';

export class WiretapServiceFactory {
  /**
   * Create and validate Wiretap service instance
   */
  static createService(config: WiretapConfig): WiretapService {
    logger.info('Creating Wiretap service instance');
    
    // Validate configuration
    const validation = WiretapConfigValidator.validate(config);
    
    if (!validation.isValid) {
      const errorMessage = `Invalid Wiretap configuration: ${validation.errors.join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    if (validation.warnings.length > 0) {
      logger.warn('Wiretap configuration warnings', { warnings: validation.warnings });
    }
    
    // Log configuration summary
    const configSummary = WiretapConfigValidator.getConfigSummary(config);
    logger.info('Wiretap service configuration:', configSummary);
    
    // Create service instance
    const service = new WiretapService(config);
    
    logger.info('Wiretap service instance created successfully');
    return service;
  }

  /**
   * Create service from environment variables
   */
  static createServiceFromEnv(): WiretapService {
    logger.info('Creating Wiretap service from environment variables');
    
    const config: WiretapConfig = {
      baseUrl: process.env.WIRETAP_BASE_URL || '',
      token: process.env.WIRETAP_TOKEN || '',
      projectTemplate: process.env.WIRETAP_PROJECT_TEMPLATE || '{event_type}-project'
    };
    
    return this.createService(config);
  }

  /**
   * Create service with fallback configuration
   */
  static createServiceWithFallback(
    primaryConfig: WiretapConfig,
    fallbackConfig?: WiretapConfig
  ): WiretapService {
    logger.info('Creating Wiretap service with fallback configuration');
    
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
  static createMockService(): WiretapService {
    logger.info('Creating mock Wiretap service for testing/development');
    
    const mockConfig: WiretapConfig = {
      baseUrl: 'http://localhost:8080',
      token: 'mock-token',
      projectTemplate: '{event_type}-project'
    };
    
    // Override validation for mock service
    const originalValidate = WiretapConfigValidator.validate;
    WiretapConfigValidator.validate = () => ({
      isValid: true,
      errors: [],
      warnings: ['Using mock configuration']
    });
    
    try {
      const service = new WiretapService(mockConfig);
      logger.info('Mock Wiretap service created successfully');
      return service;
    } finally {
      // Restore original validation
      WiretapConfigValidator.validate = originalValidate;
    }
  }

  /**
   * Validate service health
   */
  static async validateServiceHealth(service: WiretapService): Promise<boolean> {
    try {
      logger.info('Validating Wiretap service health');
      
      const isHealthy = await service.healthCheck();
      
      if (isHealthy) {
        logger.info('Wiretap service health check passed');
      } else {
        logger.warn('Wiretap service health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('Wiretap service health check error:', error);
      return false;
    }
  }

  /**
   * Get service status information
   */
  static async getServiceStatus(service: WiretapService): Promise<{
    isHealthy: boolean;
    lastHealthCheck: Date;
    configuration: string;
  }> {
    const isHealthy = await this.validateServiceHealth(service);
    
    return {
      isHealthy,
      lastHealthCheck: new Date(),
      configuration: WiretapConfigValidator.getConfigSummary({
        baseUrl: process.env.WIRETAP_BASE_URL || '',
        token: process.env.WIRETAP_TOKEN || '',
        projectTemplate: process.env.WIRETAP_PROJECT_TEMPLATE || '{event_type}-project'
      })
    };
  }
}


