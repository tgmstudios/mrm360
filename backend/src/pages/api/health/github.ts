import { NextApiRequest, NextApiResponse } from 'next';
import { GitHubServiceFactory } from '@/services/githubServiceFactory';
import { GitHubConfigValidator } from '@/services/githubConfigValidator';
import { logger } from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('GitHub health check requested');

    // Get configuration from environment
    const config = GitHubConfigValidator.getConfigFromEnv();
    
    // Validate configuration
    const validation = GitHubConfigValidator.validate(config);
    
    if (!validation.isValid) {
      return res.status(503).json({
        status: 'unhealthy',
        service: 'github',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          organization: config.organization,
          tokenConfigured: !!config.token && config.token !== 'mock-token-for-development',
          parentTeamId: config.parentTeamId
        },
        validation: {
          isValid: false,
          errors: validation.errors,
          warnings: validation.warnings
        },
        health: {
          isHealthy: false,
          message: 'GitHub service configuration is invalid'
        },
        error: 'Configuration validation failed'
      });
    }

    // Create service instance
    let service;
    let serviceCreationMethod = 'direct';
    
    try {
      service = GitHubServiceFactory.createService(config);
    } catch (error) {
      logger.warn('Failed to create GitHub service directly, trying with fallback:', error);
      service = GitHubServiceFactory.createServiceWithFallback(config);
      serviceCreationMethod = 'fallback';
    }
    
    // Perform health check
    const isHealthy = await service.checkHealth();
    
    // Get service status
    const serviceCreationStatus = GitHubServiceFactory.getServiceCreationStatus(config);
    
    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        service: 'github',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          organization: config.organization,
          tokenConfigured: !!config.token && config.token !== 'mock-token-for-development',
          parentTeamId: config.parentTeamId
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: validation.warnings
        },
        serviceCreation: {
          method: serviceCreationMethod,
          canCreate: serviceCreationStatus.canCreate,
          missingEnvVars: serviceCreationStatus.missingEnvVars
        },
        health: {
          isHealthy: true,
          message: 'GitHub service is responding correctly',
          configSummary: service.getConfigSummary()
        }
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'github',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          organization: config.organization,
          tokenConfigured: !!config.token && config.token !== 'mock-token-for-development',
          parentTeamId: config.parentTeamId
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: validation.warnings
        },
        serviceCreation: {
          method: serviceCreationMethod,
          canCreate: serviceCreationStatus.canCreate,
          missingEnvVars: serviceCreationStatus.missingEnvVars
        },
        health: {
          isHealthy: false,
          message: 'GitHub service is not responding correctly',
          configSummary: service.getConfigSummary()
        },
        error: 'Service health check failed'
      });
    }
  } catch (error) {
    logger.error('GitHub health check error:', error);
    
    // Try to get configuration for error response
    let config;
    let validation = { isValid: false, errors: ['Unknown'], warnings: [] };
    
    try {
      config = GitHubConfigValidator.getConfigFromEnv();
      validation = GitHubConfigValidator.validate(config);
    } catch (configError) {
      config = {
        baseUrl: 'unknown',
        token: 'unknown',
        organization: 'unknown'
      };
    }
    
    res.status(500).json({
      status: 'error',
      service: 'github',
      timestamp: new Date().toISOString(),
      configuration: {
        baseUrl: config.baseUrl,
        organization: config.organization,
        tokenConfigured: !!config.token && config.token !== 'mock-token-for-development',
        parentTeamId: config.parentTeamId
      },
      validation: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings
      },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to perform health check'
    });
  }
}
