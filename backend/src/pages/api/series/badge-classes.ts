import { NextApiRequest, NextApiResponse } from 'next';
import { getBadgeClasses } from '@/services/openbadgeService';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const badgeClasses = await getBadgeClasses();
    res.status(200).json({ success: true, data: badgeClasses });
  } catch (error: any) {
    logger.error('Error fetching badge classes', {
      error: error?.message || error,
      baseUrl: process.env.OPENBADGE_BASE_URL || '(not set)',
      hasApiKey: !!process.env.OPENBADGE_API_KEY,
    });
    res.status(500).json({
      error: 'Failed to fetch badge classes from OpenBadge',
      details: error?.message || 'Connection failed - check OPENBADGE_BASE_URL and OPENBADGE_API_KEY',
    });
  }
}

export default withCORS(
  withAuth(
    withPermissions(
      handler,
      () => ['events:create']
    )
  )
);
