import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { SeriesManager } from '@/managers/seriesManager';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

const updateSeriesSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  badgeClassId: z.string().min(1).optional(),
  requiredCheckIns: z.number().int().min(1).optional(),
  autoIssue: z.boolean().optional(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const seriesManager = new SeriesManager(prisma);
  const seriesId = req.query.id as string;

  if (!seriesId) {
    return res.status(400).json({ error: 'Series ID is required' });
  }

  try {
    if (req.method === 'GET') {
      const series = await seriesManager.getSeriesById(seriesId);
      if (!series) {
        return res.status(404).json({ error: 'Series not found' });
      }
      res.status(200).json({ success: true, data: series });
    } else if (req.method === 'PUT') {
      const body = updateSeriesSchema.parse(req.body);
      const series = await seriesManager.updateSeries(seriesId, body);
      res.status(200).json({ success: true, data: series });
    } else if (req.method === 'DELETE') {
      await seriesManager.deleteSeries(seriesId);
      res.status(200).json({ success: true, message: 'Series deleted successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in series API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ error: 'Series not found' });
    }
    logger.error('Error in series API', { error, method: req.method, seriesId });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(
  withAuth(
    withPermissions(
      handler,
      (req: NextApiRequest) => {
        if (req.method === 'GET') return ['events:read'];
        if (req.method === 'PUT') return ['events:update'];
        if (req.method === 'DELETE') return ['events:delete'];
        return [];
      }
    )
  )
);
