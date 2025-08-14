import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '../../../models/prismaClient';
import { UserManager } from '../../../managers/userManager';
import { withAuth } from '../../../middleware/authMiddleware';
import { withPermissions } from '../../../middleware/permissionMiddleware';
import { logger } from '../../../utils/logger';

// Validation schemas
const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'EXEC_BOARD', 'MEMBER']).optional(),
  paidStatus: z.boolean().optional(),
  groupIds: z.array(z.string()).optional(),
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *       200:
 *         description: User updated successfully
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const userManager = new UserManager(prisma);

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    if (req.method === 'GET') {
      // Get user by ID
      const user = await userManager.getUserById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } else if (req.method === 'PUT') {
      // Update user
      const body = updateUserSchema.parse(req.body);
      
      const user = await userManager.updateUser(id, body);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json(user);
    } else if (req.method === 'DELETE') {
      // Delete user
      await userManager.deleteUser(id);
      
      res.status(204).end();
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in user API', { errors: error.errors, userId: id });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    
    logger.error('Error in user API', { error, method: req.method, userId: id });
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Apply middleware: authentication then permissions
export default withAuth(
  withPermissions(
    handler,
    ['users:read', 'users:update', 'users:delete']
  )
);
