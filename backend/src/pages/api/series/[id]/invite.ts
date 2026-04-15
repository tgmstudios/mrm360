import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { sendBadgeInvite, getInvitesForBadge } from '@/services/openbadgeService';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

const issueSchema = z.object({
  userId: z.string().min(1),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const seriesId = req.query.id as string;
  if (!seriesId) {
    return res.status(400).json({ error: 'Series ID is required' });
  }

  try {
    const body = issueSchema.parse(req.body);

    const series = await prisma.workshopSeries.findUnique({ where: { id: seriesId } });
    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for existing invite
    try {
      const existing = await getInvitesForBadge(series.badgeClassId);
      const alreadyInvited = existing.some(
        inv => inv.recipientEmail?.toLowerCase() === user.email.toLowerCase()
          && (inv.status === 'pending' || inv.status === 'claimed'),
      );
      if (alreadyInvited) {
        return res.status(409).json({ error: 'Badge invite already sent to this user' });
      }
    } catch (err) {
      logger.warn('Could not check existing invites', { err });
    }

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    const invite = await sendBadgeInvite(series.badgeClassId, user.email, fullName || undefined);

    logger.info('Badge invite sent for series', {
      seriesId,
      userId: body.userId,
      inviteId: invite.id,
    });

    res.status(201).json({ success: true, data: invite });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error sending series badge invite', { error: error?.message, seriesId });
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
}

export default withCORS(
  withAuth(
    withPermissions(
      handler,
      () => ['events:update']
    )
  )
);
