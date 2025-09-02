import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../../utils/logger';
import { withCORS } from '../../../middleware/corsMiddleware';
import { ListMonkServiceFactory } from '../../../services/listmonkServiceFactory';

export default withCORS(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Debug endpoint not available in production' });
    }

    const service = ListMonkServiceFactory.createServiceFromEnv();
    const configInfo = service.getConfigurationInfo();

    // Test basic connectivity
    let connectivityTest = null;
    try {
      const response = await fetch(`${configInfo.baseUrl}/api/lists`, {
        method: 'GET',
        headers: {
          'Authorization': `token ${configInfo.username}:${process.env.LISTMONK_PASSWORD}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      connectivityTest = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      };

      if (response.ok) {
        const data = await response.json();
        connectivityTest.data = data;
      } else {
        const errorText = await response.text();
        connectivityTest.error = errorText;
      }
    } catch (error) {
      connectivityTest = {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };
    }

    return res.status(200).json({
      environment: process.env.NODE_ENV,
      configuration: {
        baseUrl: configInfo.baseUrl,
        username: configInfo.username,
        hasPassword: configInfo.hasPassword
      },
      connectivityTest
    });

  } catch (error) {
    logger.error('ListMonk test endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
