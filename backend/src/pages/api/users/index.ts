import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../models/prismaClient';
import { UserManager } from '../../../managers/userManager';
import { withCORS } from '../../../middleware/corsMiddleware';
import { withAuth } from '../../../middleware/authMiddleware';
import { withPermissions } from '../../../middleware/permissionMiddleware';
import { logger } from '../../../utils/logger';
import { handleApiError, ApiError } from '../../../middleware/errorHandler';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'EXEC_BOARD', 'MEMBER']).optional(),
  paidStatus: z.boolean().optional(),
});

const listUsersSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '20')),
  search: z.string().optional(),
  role: z.string().optional().transform(val => {
    if (val === '') return undefined;
    if (val === 'ADMIN' || val === 'EXEC_BOARD' || val === 'MEMBER') return val;
    return undefined;
  }),
  paidStatus: z.string().optional().transform(val => {
    if (val === '') return undefined;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
  groupId: z.string().optional().transform(val => {
    if (val === '') return undefined;
    return val;
  }),
  teamId: z.string().optional().transform(val => {
    if (val === '') return undefined;
    return val;
  }),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List users with filtering and pagination
 *     tags: [Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, EXEC_BOARD, MEMBER]
 *         description: Filter by user role
 *       - in: query
 *         name: paidStatus
 *         schema:
 *           type: boolean
 *         description: Filter by paid status
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *         description: Filter by group membership
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               role:
 *                 type: string
 *                 enum: [ADMIN, EXEC_BOARD, MEMBER]
 *               paidStatus:
 *                 type: boolean
 *               groupIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userManager = new UserManager(prisma);

  try {
    if (req.method === 'GET') {
      // List users
      const queryParams = listUsersSchema.parse(req.query);
      
      const result = await userManager.getUsers({
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search,
        role: queryParams.role,
        paidStatus: queryParams.paidStatus,
        groupId: queryParams.groupId,
      });

      res.status(200).json(result);
    } else if (req.method === 'POST') {
      // Create user
      const body = createUserSchema.parse(req.body);
      
      const user = await userManager.createUser({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        displayName: body.displayName,
        paidStatus: body.paidStatus,
        role: body.role,
      });
      
      res.status(201).json({ success: true, data: user });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in users API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    // Handle custom API errors (like CONFLICT, NOT_FOUND, etc.)
    if (error instanceof Error && (error as ApiError).statusCode) {
      return handleApiError(error, req, res);
    }
    
    logger.error('Error in users API', { error, method: req.method });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware: CORS, authentication then permissions
export default withCORS(
  withAuth(
    withPermissions(
      handler,
      ['users:read', 'users:create']
    )
  )
);
