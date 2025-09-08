import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by email or name
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query (email or name)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       email:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       displayName:
 *                         type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q: query, limit = '10' } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  const limitNum = parseInt(limit as string, 10);
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    return res.status(400).json({ error: 'Invalid limit parameter' });
  }

  try {
    const searchTerm = `%${query.toLowerCase()}%`;
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            firstName: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            lastName: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            displayName: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        displayName: true
      },
      take: limitNum,
      orderBy: [
        {
          email: 'asc'
        }
      ]
    });

    logger.info(`User search completed`, { 
      query, 
      resultCount: users.length,
      limit: limitNum 
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    logger.error('Error searching users:', { query, error });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(withAuth(withPermissions(handler, ['users:read'])));
