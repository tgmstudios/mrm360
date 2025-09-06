import { NextApiRequest, NextApiResponse } from 'next';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';
import { logger } from '@/utils/logger';

/**
 * @swagger
 * /api/health/wiretap:
 *   get:
 *     summary: Check Wiretap service health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Health check result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                   example: "wiretap"
 *                 status:
 *                   type: string
 *                   enum: [healthy, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 details:
 *                   type: object
 *                   properties:
 *                     isHealthy:
 *                       type: boolean
 *                     lastHealthCheck:
 *                       type: string
 *                       format: date-time
 *                     configuration:
 *                       type: string
 *       500:
 *         description: Internal server error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Performing Wiretap health check');

    // Create service instance
    const service = WiretapServiceFactory.createServiceFromEnv();
    
    // Get service status
    const status = await WiretapServiceFactory.getServiceStatus(service);
    
    const response = {
      service: 'wiretap',
      status: status.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: {
        isHealthy: status.isHealthy,
        lastHealthCheck: status.lastHealthCheck.toISOString(),
        configuration: status.configuration
      }
    };

    logger.info('Wiretap health check completed', { 
      status: response.status, 
      isHealthy: status.isHealthy 
    });

    return res.status(200).json(response);
  } catch (error) {
    logger.error('Wiretap health check failed', { error });
    
    const response = {
      service: 'wiretap',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return res.status(500).json(response);
  }
}
