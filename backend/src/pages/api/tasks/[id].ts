import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

const paramsSchema = z.object({ id: z.string() });

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const manager = new BackgroundTaskManager(prisma);
  try {
    const { id } = paramsSchema.parse(req.query);

    if (req.method === 'GET') {
      const task = await manager.getTask(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.status(200).json({ data: task });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in task detail API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error in task detail API', { error, method: req.method });
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


