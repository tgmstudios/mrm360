import { NextApiRequest, NextApiResponse } from 'next';
import { AuthentikServiceFactory } from '@/services/authentikServiceFactory';
import { getAuthentikConfig } from '@/config/externalServices';
import { logger } from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Authentik health check requested');

    // Get configuration
    const config = getAuthentikConfig();
    
    // Create service instance
    const service = AuthentikServiceFactory.createService(config);
    
    // Perform health check
    const isHealthy = await service.healthCheck();
    
    // Get service status
    const status = await AuthentikServiceFactory.getServiceStatus(service);
    
    if (isHealthy) {
      res.status(200).json({
        status: 'healthy',
        service: 'authentik',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          parentGroupTemplate: config.parentGroupTemplate,
          tokenConfigured: !!config.token && config.token !== 'mock-token'
        },
        health: {
          isHealthy: true,
          lastHealthCheck: status.lastHealthCheck,
          message: 'Authentik service is responding correctly'
        }
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'authentik',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          parentGroupTemplate: config.parentGroupTemplate,
          tokenConfigured: !!config.token && config.token !== 'mock-token'
        },
        health: {
          isHealthy: false,
          lastHealthCheck: status.lastHealthCheck,
          message: 'Authentik service is not responding correctly'
        },
        error: 'Service health check failed'
      });
    }
  } catch (error) {
    logger.error('Authentik health check error:', error);
    
    res.status(500).json({
      status: 'error',
      service: 'authentik',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to perform health check'
    });
  }
}
