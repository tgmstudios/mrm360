import { NextApiRequest, NextApiResponse } from 'next';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';

/**
 * @swagger
 * /api/wiretap/workshops:
 *   get:
 *     summary: Get list of Wiretap workshops
 *     tags: [Wiretap]
 *     responses:
 *       200:
 *         description: List of workshops retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Fetching Wiretap workshops');

    const wiretapService = WiretapServiceFactory.createServiceFromEnv();
    const workshops = await wiretapService.listWorkshops();
    
    logger.info(`Successfully retrieved ${workshops.length} Wiretap workshops`);

    return res.status(200).json({
      success: true,
      data: workshops
    });
  } catch (error) {
    logger.error('Failed to fetch Wiretap workshops', { error });
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Apply middleware: CORS then authentication
export default withCORS(withAuth(handler));
