import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { SeriesManager } from '@/managers/seriesManager';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const seriesId = req.query.id as string;
  if (!seriesId) {
    return res.status(400).json({ error: 'Series ID is required' });
  }

  try {
    const seriesManager = new SeriesManager(prisma);
    const progress = await seriesManager.getSeriesProgress(seriesId);
    res.status(200).json({ success: true, data: progress });
  } catch (error: any) {
    if (error?.message === 'Series not found') {
      return res.status(404).json({ error: 'Series not found' });
    }
    logger.error('Error fetching series progress', { error, seriesId });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(
  withAuth(
    withPermissions(
      handler,
      () => ['events:read']
    )
  )
);
