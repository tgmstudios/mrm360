import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../models/prismaClient';
import { GroupManager } from '../../../managers/groupManager';
import { withCORS } from '../../../middleware/corsMiddleware';
import { withAuth } from '../../../middleware/authMiddleware';
import { withPermissions } from '../../../middleware/permissionMiddleware';
import { logger } from '../../../utils/logger';

// Validation schemas
const listGroupsSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  search: z.string().optional(),
  isExternal: z.string().optional().transform(val => val === 'true'),
});

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
      const queryParams = listGroupsSchema.parse(req.query);
      
      const result = await groupManager.getGroups({
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search,
        isExternal: queryParams.isExternal,
      });

      res.status(200).json(result);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in groups API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
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
