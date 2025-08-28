import { logger } from '@/utils/logger';
import { GitHubService } from './githubService';
import { GitHubConfigValidator, GitHubConfig } from './githubConfigValidator';

export class GitHubServiceFactory {
  /**
   * Create GitHub service with configuration validation
   */
  static createService(config: GitHubConfig): GitHubService {
    logger.info('Creating GitHub service with configuration validation');
    
    // Validate configuration before creating service
    const validation = GitHubConfigValidator.validateAndLog(config);
    
    if (!validation.isValid) {
      const errorMessage = `GitHub service configuration validation failed: ${validation.errors.join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Log configuration summary (without sensitive data)
    logger.info(GitHubConfigValidator.getConfigSummary(config));
    
    try {
      const service = new GitHubService(config);
      logger.info('GitHub service created successfully');
      return service;
    } catch (error) {
      logger.error('Failed to create GitHub service:', error);
      throw error;
    }
  }

  /**
   * Create GitHub service from environment variables
   */
  static createServiceFromEnv(): GitHubService {
    logger.info('Creating GitHub service from environment variables');
    
    const config = GitHubConfigValidator.getConfigFromEnv();
    return this.createService(config);
  }

  /**
   * Create mock GitHub service for development/testing
   */
  static createMockService(): GitHubService {
    logger.info('Creating mock GitHub service for development');
    
    const mockConfig: GitHubConfig = {
      baseUrl: 'https://api.github.com',
      token: 'mock-token-for-development',
      organization: 'mock-organization',
      parentTeamId: '123'
    };
    
    return new GitHubService(mockConfig);
  }

  /**
   * Create GitHub service with fallback to mock if configuration is invalid
   */
  static createServiceWithFallback(config: GitHubConfig): GitHubService {
    try {
      return this.createService(config);
    } catch (error) {
      logger.warn('Failed to create GitHub service with provided config, falling back to mock service:', error);
      return this.createMockService();
    }
  }

  /**
   * Create GitHub service from environment with fallback
   */
  static createServiceFromEnvWithFallback(): GitHubService {
    try {
      return this.createServiceFromEnv();
    } catch (error) {
      logger.warn('Failed to create GitHub service from environment, falling back to mock service:', error);
      return this.createMockService();
    }
  }

  /**
   * Validate service health
   */
  static async validateServiceHealth(service: GitHubService): Promise<boolean> {
    try {
      logger.info('Validating GitHub service health');
      
      // Check if service can perform basic operations
      const isHealthy = await service.checkHealth();
      
      if (isHealthy) {
        logger.info('GitHub service health check passed');
      } else {
        logger.warn('GitHub service health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('GitHub service health check error:', error);
      return false;
    }
  }

  /**
   * Create service with health validation
   */
  static async createServiceWithHealthCheck(config: GitHubConfig): Promise<GitHubService> {
    const service = this.createService(config);
    
    // Perform health check
    const isHealthy = await this.validateServiceHealth(service);
    
    if (!isHealthy) {
      logger.warn('GitHub service health check failed, but service was created');
    }
    
    return service;
  }

  /**
   * Create service from environment with health validation
   */
  static async createServiceFromEnvWithHealthCheck(): Promise<GitHubService> {
    const service = this.createServiceFromEnv();
    
    // Perform health check
    const isHealthy = await this.validateServiceHealth(service);
    
    if (!isHealthy) {
      logger.warn('GitHub service health check failed, but service was created');
    }
    
    return service;
  }

  /**
   * Check if service can be created with current configuration
   */
  static canCreateService(config?: GitHubConfig): boolean {
    try {
      if (config) {
        const validation = GitHubConfigValidator.validate(config);
        return validation.isValid;
      } else {
        const validation = GitHubConfigValidator.validateEnvironment();
        return validation.isValid;
      }
    } catch (error) {
      logger.error('Error checking if GitHub service can be created:', error);
      return false;
    }
  }

  /**
   * Get service creation status
   */
  static getServiceCreationStatus(config?: GitHubConfig): {
    canCreate: boolean;
    validation: any;
    missingEnvVars: string[];
  } {
    const configToValidate = config || GitHubConfigValidator.getConfigFromEnv();
    const validation = GitHubConfigValidator.validate(configToValidate);
    const missingEnvVars = GitHubConfigValidator.checkRequiredEnvVars();
    
    return {
      canCreate: validation.isValid,
      validation,
      missingEnvVars
    };
  }

  /**
   * Create service with retry logic
   */
  static async createServiceWithRetry(
    config: GitHubConfig, 
    maxRetries: number = 3, 
    delayMs: number = 1000
  ): Promise<GitHubService> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Creating GitHub service, attempt ${attempt}/${maxRetries}`);
        const service = this.createService(config);
        
        // Validate service health
        const isHealthy = await this.validateServiceHealth(service);
        if (isHealthy) {
          logger.info(`GitHub service created successfully on attempt ${attempt}`);
          return service;
        } else {
          throw new Error('Service health check failed');
        }
      } catch (error) {
        lastError = error as Error;
        logger.warn(`GitHub service creation attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          logger.info(`Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    logger.error(`Failed to create GitHub service after ${maxRetries} attempts`);
    throw lastError || new Error('Failed to create GitHub service');
  }
}
