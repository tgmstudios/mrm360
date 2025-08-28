import { WikiJsService } from './wikijsService';
import { WikiJsConfigValidator, WikiJsConfig } from './wikijsConfigValidator';
import { logger } from '@/utils/logger';

export class WikiJsServiceFactory {
  /**
   * Create Wiki.js service with configuration
   */
  static createService(config: WikiJsConfig): WikiJsService {
    logger.info('Creating Wiki.js service with configuration');
    
    // Validate configuration
    const validation = WikiJsConfigValidator.validate(config);
    
    if (!validation.isValid) {
      const errorMessage = `Invalid Wiki.js configuration: ${validation.errors.join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      logger.warn(`Wiki.js configuration warnings: ${validation.warnings.join(', ')}`);
    }

    // Check if production-ready
    const isProductionReady = WikiJsConfigValidator.isProductionReady(config);
    if (!isProductionReady) {
      logger.warn('Wiki.js configuration is not production-ready');
    }

    // Create service
    const service = new WikiJsService(config);
    logger.info(`Wiki.js service created successfully: ${WikiJsConfigValidator.getConfigSummary(config)}`);
    
    return service;
  }

  /**
   * Create Wiki.js service from environment variables
   */
  static createServiceFromEnv(): WikiJsService {
    logger.info('Creating Wiki.js service from environment variables');
    
    const { config, validation } = WikiJsConfigValidator.validateAndGetConfig();
    
    if (!validation.isValid) {
      const errorMessage = `Invalid Wiki.js environment configuration: ${validation.errors.join(', ')}`;
      logger.error(errorMessage);
      
      // Check for missing environment variables
      const missingVars = WikiJsConfigValidator.getMissingEnvVars();
      if (missingVars.length > 0) {
        logger.error(`Missing environment variables: ${missingVars.join(', ')}`);
        logger.error('Please set the following environment variables:');
        logger.error('  WIKIJS_BASE_URL - The base URL of your Wiki.js instance');
        logger.error('  WIKIJS_API_TOKEN - Your Wiki.js API token');
        logger.error('  WIKIJS_BASE_PATH - The base path for Wiki.js pages');
      }
      
      throw new Error(errorMessage);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      logger.warn(`Wiki.js environment configuration warnings: ${validation.warnings.join(', ')}`);
    }

    // Check if production-ready
    const isProductionReady = WikiJsConfigValidator.isProductionReady(config);
    if (!isProductionReady) {
      logger.warn('Wiki.js environment configuration is not production-ready');
    }

    // Create service
    const service = new WikiJsService(config);
    logger.info(`Wiki.js service created successfully from environment: ${WikiJsConfigValidator.getConfigSummary(config)}`);
    
    return service;
  }

  /**
   * Create mock Wiki.js service for development/testing
   */
  static createMockService(): WikiJsService {
    logger.info('Creating mock Wiki.js service for development/testing');
    
    const mockConfig: WikiJsConfig = {
      baseUrl: 'http://localhost:3000',
      token: 'mock-token-for-development',
      basePath: '/mock-wiki'
    };

    const service = new WikiJsService(mockConfig);
    logger.info('Mock Wiki.js service created successfully');
    
    return service;
  }

  /**
   * Create Wiki.js service with fallback to mock
   */
  static createServiceWithFallback(): WikiJsService {
    try {
      return this.createServiceFromEnv();
    } catch (error) {
      logger.warn('Failed to create Wiki.js service from environment, falling back to mock service');
      return this.createMockService();
    }
  }

  /**
   * Validate service health
   */
  static async validateServiceHealth(service: WikiJsService): Promise<boolean> {
    try {
      logger.info('Validating Wiki.js service health');
      
      const isHealthy = await service.healthCheck();
      
      if (isHealthy) {
        logger.info('Wiki.js service health check passed');
      } else {
        logger.warn('Wiki.js service health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('Wiki.js service health check error:', error);
      return false;
    }
  }

  /**
   * Create service with health validation
   */
  static async createServiceWithHealthCheck(config?: WikiJsConfig): Promise<WikiJsService> {
    const service = config ? this.createService(config) : this.createServiceFromEnv();
    
    // Perform health check
    const isHealthy = await this.validateServiceHealth(service);
    
    if (!isHealthy) {
      logger.warn('Wiki.js service health check failed, but service was created');
    }
    
    return service;
  }

  /**
   * Get service status information
   */
  static async getServiceStatus(service: WikiJsService): Promise<{
    isHealthy: boolean;
    config: WikiJsConfig;
    isProductionReady: boolean;
    lastHealthCheck: Date;
  }> {
    const isHealthy = await this.validateServiceHealth(service);
    const config = service.getConfig();
    const isProductionReady = WikiJsConfigValidator.isProductionReady(config);
    
    return {
      isHealthy,
      config,
      isProductionReady,
      lastHealthCheck: new Date()
    };
  }

  /**
   * Create service with retry logic
   */
  static async createServiceWithRetry(
    config?: WikiJsConfig, 
    maxRetries: number = 3, 
    retryDelay: number = 1000
  ): Promise<WikiJsService> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Creating Wiki.js service (attempt ${attempt}/${maxRetries})`);
        
        const service = config ? this.createService(config) : this.createServiceFromEnv();
        
        // Validate health
        const isHealthy = await this.validateServiceHealth(service);
        if (isHealthy) {
          logger.info(`Wiki.js service created successfully on attempt ${attempt}`);
          return service;
        }
        
        throw new Error('Service health check failed');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`Wiki.js service creation attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          logger.info(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
        }
      }
    }
    
    logger.error(`Failed to create Wiki.js service after ${maxRetries} attempts`);
    throw lastError!;
  }
}
