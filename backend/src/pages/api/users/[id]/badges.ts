import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { sendBadgeInvite, getInvitesForBadge, getAssertionsForBadge, getBadgeClasses } from '@/services/openbadgeService';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

const inviteBadgeSchema = z.object({
  badgeClassId: z.string().min(1),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.query.id as string;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.method === 'GET') {
      // Get all badge invites for this user across all badge classes
      try {
        const badgeClasses = await getBadgeClasses();
        const userBadges: any[] = [];

        for (const bc of badgeClasses) {
          const invites = await getInvitesForBadge(bc.id);
          const userInvites = invites.filter(
            (inv) => inv.recipientEmail?.toLowerCase() === user.email.toLowerCase(),
          );
          for (const invite of userInvites) {
            userBadges.push({
              ...invite,
              badgeClass: bc,
            });
          }
        }

        res.status(200).json({ success: true, data: userBadges });
      } catch (error) {
        logger.error('Failed to fetch user badges from OpenBadge', { error, userId });
        res.status(200).json({ success: true, data: [] });
      }
    } else if (req.method === 'POST') {
      // Send a badge invite to this user
      const body = inviteBadgeSchema.parse(req.body);
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

      const invite = await sendBadgeInvite(
        body.badgeClassId,
        user.email,
        fullName || undefined,
      );

      logger.info('Badge invite sent to user', { userId, badgeClassId: body.badgeClassId, inviteId: invite.id });
      res.status(201).json({ success: true, data: invite });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Validation error in user badges API', { errors: error.errors });
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    logger.error('Error in user badges API', { error, method: req.method, userId });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(
  withAuth(
    withPermissions(
      handler,
      (req: NextApiRequest) => {
        if (req.method === 'GET') return ['users:read'];
        if (req.method === 'POST') return ['users:update'];
        return [];
      }
    )
  )
);
