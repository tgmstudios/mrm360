import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

const listSchema = z.object({
  page: z.string().optional().transform(v => parseInt(v || '1')),
  limit: z.string().optional().transform(v => parseInt(v || '20')),
  entityType: z.string().optional(),
  entityId: z.string().optional()
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const manager = new BackgroundTaskManager(prisma);

  try {
    if (req.method === 'GET') {
      const query = listSchema.parse(req.query);
      const result = await manager.listTasks({ page: query.page, limit: query.limit, entityType: query.entityType, entityId: query.entityId });
      return res.status(200).json(result);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in tasks list API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error in tasks API', { error, method: req.method });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(
  withAuth(
    withPermissions(
      handler,
      ['tasks:read']
    )
  )
);


