import { NextApiRequest, NextApiResponse } from 'next';
import { WikiJsServiceFactory } from '@/services/wikijsServiceFactory';
import { WikiJsConfigValidator } from '@/services/wikijsConfigValidator';
import { logger } from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Wiki.js health check requested');

    // Validate environment configuration
    const envValidation = WikiJsConfigValidator.validateEnvironment();
    
    // Try to create service from environment
    let service;
    let isMockService = false;
    let config;
    
    try {
      config = WikiJsConfigValidator.getConfigFromEnv();
      service = WikiJsServiceFactory.createService(config);
      logger.info('Wiki.js service created from environment');
    } catch (error) {
      logger.warn('Failed to create Wiki.js service from environment, using mock service');
      service = WikiJsServiceFactory.createMockService();
      isMockService = true;
      config = WikiJsConfigValidator.getConfigFromEnv();
    }
    
    // Get service status
    const status = await service.getServiceStatus();
    
    // Check if service is healthy
    const isHealthy = await WikiJsServiceFactory.validateServiceHealth(service);
    
    // Check if configuration is production-ready
    const isProductionReady = WikiJsConfigValidator.isProductionReady(config);
    
    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        service: 'wikijs',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          basePath: config.basePath,
          tokenConfigured: !!config.token && config.token !== 'mock-token-for-development',
          isProductionReady,
          validation: {
            isValid: envValidation.isValid,
            errors: envValidation.errors,
            warnings: envValidation.warnings
          }
        },
        health: {
          isHealthy: true,
          isMockService,
          lastHealthCheck: status.lastHealthCheck,
          basePath: status.basePath,
          pageCount: status.pageCount,
          message: 'Wiki.js service is responding correctly'
        }
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'wikijs',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          basePath: config.basePath,
          tokenConfigured: !!config.token && config.token !== 'mock-token-for-development',
          isProductionReady,
          validation: {
            isValid: envValidation.isValid,
            errors: envValidation.errors,
            warnings: envValidation.warnings
          }
        },
        health: {
          isHealthy: false,
          isMockService,
          lastHealthCheck: status.lastHealthCheck,
          basePath: status.basePath,
          pageCount: status.pageCount,
          message: 'Wiki.js service is not responding correctly'
        },
        error: 'Service health check failed'
      });
    }
  } catch (error) {
    logger.error('Wiki.js health check error:', error);
    
    res.status(500).json({
      status: 'error',
      service: 'wikijs',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to perform health check'
    });
  }
}
