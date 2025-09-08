import { NextApiRequest, NextApiResponse } from 'next';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';

/**
 * Debug endpoint to test Wiretap API connectivity and discover available endpoints
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Testing Wiretap API connectivity');

    const wiretapService = WiretapServiceFactory.createServiceFromEnv();
    
    // Test health check first
    const healthCheck = await wiretapService.healthCheck();
    
    const debugInfo = {
      healthCheck,
      baseUrl: process.env.WIRETAP_BASE_URL,
      timestamp: new Date().toISOString(),
      endpoints: [
        '/api/workshops',
        '/api/teams',
        '/api/users',
        '/api/instances',
        '/api/providers',
        '/api/auth/me'
      ]
    };

    logger.info('Wiretap debug info', debugInfo);

    return res.status(200).json({
      success: true,
      data: debugInfo
    });
  } catch (error) {
    logger.error('Wiretap debug failed', { error });
    
    return res.status(200).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      baseUrl: process.env.WIRETAP_BASE_URL,
      timestamp: new Date().toISOString()
    });
  }
}

// Apply middleware: CORS then authentication
export default withCORS(withAuth(handler));
