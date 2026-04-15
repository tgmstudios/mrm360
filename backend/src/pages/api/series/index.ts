import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { SeriesManager } from '@/managers/seriesManager';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

const createSeriesSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  badgeClassId: z.string().min(1),
  requiredCheckIns: z.number().int().min(1),
  autoIssue: z.boolean().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const seriesManager = new SeriesManager(prisma);

  try {
    if (req.method === 'GET') {
      const allSeries = await seriesManager.getAllSeries();
      res.status(200).json({ success: true, data: allSeries });
    } else if (req.method === 'POST') {
      const body = createSeriesSchema.parse(req.body);
      const series = await seriesManager.createSeries(body);
      res.status(201).json({ success: true, data: series });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in series API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error in series API', { error, method: req.method });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(
  withAuth(
    withPermissions(
      handler,
      (req: NextApiRequest) => {
        if (req.method === 'GET') return ['events:read'];
        if (req.method === 'POST') return ['events:create'];
        return [];
      }
    )
  )
);
