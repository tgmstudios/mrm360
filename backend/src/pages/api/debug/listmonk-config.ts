import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/utils/logger';
import { withCORS } from '@/middleware/corsMiddleware';
import { ListMonkServiceFactory } from '@/services/listmonkServiceFactory';
import { ListMonkConfigValidator } from '@/utils/listmonkConfigValidator';

export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Only allow in development or with proper authentication
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Debug endpoint not available in production' });
    }

    // Get configuration status
    const configStatus = ListMonkConfigValidator.checkEnvironmentStatus();
    
    // Try to create service
    let serviceCreated = false;
    let serviceError = null;
    let healthCheck = null;
    
    try {
      const service = ListMonkServiceFactory.createServiceFromEnv();
      serviceCreated = true;
      
      // Get configuration info (without sensitive data)
      const configInfo = service.getConfigurationInfo();
      
      // Try health check
      try {
        healthCheck = await service.healthCheck();
      } catch (error) {
        healthCheck = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
      
      return res.status(200).json({
        environment: process.env.NODE_ENV,
        configuration: {
          validation: configStatus.validation,
          envVars: configStatus.envVars,
          configInfo: {
            baseUrl: configInfo.baseUrl,
            username: configInfo.username,
            hasPassword: configInfo.hasPassword
          }
        },
        service: {
          created: serviceCreated,
          healthCheck
        }
      });
      
    } catch (error) {
      serviceError = error instanceof Error ? error.message : 'Unknown error';
      
      return res.status(200).json({
        environment: process.env.NODE_ENV,
        configuration: {
          validation: configStatus.validation,
          envVars: configStatus.envVars
        },
        service: {
          created: serviceCreated,
          error: serviceError
        }
      });
    }

  } catch (error) {
    logger.error('ListMonk debug endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
