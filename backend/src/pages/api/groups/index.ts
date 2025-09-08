import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { GroupManager } from '../../../managers/groupManager';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';
import { handleApiError, ApiError } from '@/middleware/errorHandler';



/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: List groups with filtering and pagination
 *     tags: [Groups]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of groups per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for group name
 *       - in: query
 *         name: isExternal
 *         schema:
 *           type: boolean
 *         description: Filter by external (Authentik) groups
 *     responses:
 *       200:
 *         description: List of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Group'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const groupManager = new GroupManager(prisma);

  try {
    if (req.method === 'GET') {
      // List groups
      const result = await groupManager.getAllGroups();
      
      // Transform to match expected response format
      const response = {
        data: result,
        pagination: {
          page: 1,
          limit: result.length,
          total: result.length,
          totalPages: 1
        }
      };

      // Return the response in the format expected by the frontend
      res.status(200).json(response);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in groups API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    // Handle custom API errors (like CONFLICT, NOT_FOUND, etc.)
    if (error instanceof Error && (error as ApiError).statusCode) {
      return handleApiError(error, req, res);
    }
    
    logger.error('Error in groups API', { error, method: req.method });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware: CORS, authentication then permissions
export default withCORS(
  withAuth(
    withPermissions(
      handler,
      ['groups:read']
    )
  )
);
