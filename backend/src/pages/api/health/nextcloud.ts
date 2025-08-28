import { NextApiRequest, NextApiResponse } from 'next';
import { NextcloudServiceFactory } from '@/services/nextcloudServiceFactory';
import { getNextcloudConfig } from '@/config/externalServices';
import { logger } from '@/utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Nextcloud health check requested');

    // Get configuration
    const config = getNextcloudConfig();
    
    // Create service instance
    const service = NextcloudServiceFactory.createService(config);
    
    // Perform health check
    const healthStatus = await service.getHealthStatus();
    
    // Get service status
    const serviceStatus = NextcloudServiceFactory.getServiceStatus(config);
    
    if (healthStatus.status === 'healthy') {
      res.status(200).json({
        status: 'healthy',
        service: 'nextcloud',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          username: config.username,
          basePath: config.basePath,
          passwordConfigured: !!config.password && config.password !== 'mock-password'
        },
        health: {
          status: healthStatus.status,
          message: healthStatus.message,
          timestamp: healthStatus.timestamp,
          details: healthStatus.details
        },
        serviceStatus: {
          configured: serviceStatus.configured,
          baseUrl: serviceStatus.baseUrl,
          username: serviceStatus.username,
          basePath: serviceStatus.basePath,
          hasPassword: serviceStatus.hasPassword
        }
      });
    } else if (healthStatus.status === 'degraded') {
      res.status(200).json({
        status: 'degraded',
        service: 'nextcloud',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          username: config.username,
          basePath: config.basePath,
          passwordConfigured: !!config.password && config.password !== 'mock-password'
        },
        health: {
          status: healthStatus.status,
          message: healthStatus.message,
          timestamp: healthStatus.timestamp,
          details: healthStatus.details
        },
        serviceStatus: {
          configured: serviceStatus.configured,
          baseUrl: serviceStatus.baseUrl,
          username: serviceStatus.username,
          basePath: serviceStatus.basePath,
          hasPassword: serviceStatus.hasPassword
        },
        warning: 'Service is responding but with degraded performance'
      });
    } else {
      res.status(503).json({
        status: 'unhealthy',
        service: 'nextcloud',
        timestamp: new Date().toISOString(),
        configuration: {
          baseUrl: config.baseUrl,
          username: config.username,
          basePath: config.basePath,
          passwordConfigured: !!config.password && config.password !== 'mock-password'
        },
        health: {
          status: healthStatus.status,
          message: healthStatus.message,
          timestamp: healthStatus.timestamp,
          details: healthStatus.details
        },
        serviceStatus: {
          configured: serviceStatus.configured,
          baseUrl: serviceStatus.baseUrl,
          username: serviceStatus.username,
          basePath: serviceStatus.basePath,
          hasPassword: serviceStatus.hasPassword
        },
        error: 'Service health check failed'
      });
    }
  } catch (error) {
    logger.error('Nextcloud health check error:', error);
    
    res.status(500).json({
      status: 'error',
      service: 'nextcloud',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to perform health check'
    });
  }
}
