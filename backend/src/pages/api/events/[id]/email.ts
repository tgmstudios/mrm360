import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/models/prismaClient';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { getEffectiveSystemRole, hasAdminGroups } from '@/utils/roleUtils';
import {
  sendEventReminderEmail,
  sendPostEventThankYouEmail,
} from '@/services/eventEmailService';

const sendEmailSchema = z.object({
  type: z.enum(['reminder', 'thank-you']),
  // For thank-you emails, optionally target only checked-in users
  attendeesOnly: z.boolean().optional().default(false),
  customMessage: z.string().optional(),
});

/**
 * @swagger
 * /api/events/{id}/email:
 *   post:
 *     summary: Send bulk email to event RSVPs (admin only)
 *     tags: [Events]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [reminder, thank-you]
 *                 description: Type of email to send
 *               attendeesOnly:
 *                 type: boolean
 *                 description: If true, only send to users who checked in (for thank-you)
 *               customMessage:
 *                 type: string
 *                 description: Optional custom message to include
 *             required:
 *               - type
 *     responses:
 *       200:
 *         description: Emails queued successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Event not found
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const eventId = req.query.id as string;
  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  // Check admin/exec permissions
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  const effectiveRole = getEffectiveSystemRole(user.role);
  const isAdmin = effectiveRole === 'ADMIN' || effectiveRole === 'EXEC_BOARD' || hasAdminGroups(user.groups || []);
  if (!isAdmin) {
    return res.status(403).json({ error: 'Only admins can send event emails' });
  }

  try {
    const body = sendEmailSchema.parse(req.body);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        rsvps: {
          where: { status: 'CONFIRMED' },
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
        },
        checkIns: {
          include: {
            user: {
              select: { id: true, email: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    let recipients: Array<{ id: string; email: string; firstName: string; lastName: string }>;

    if (body.type === 'thank-you' && body.attendeesOnly) {
      // Only users who actually checked in
      recipients = event.checkIns.map((ci: any) => ci.user);
    } else {
      // All confirmed RSVPs
      recipients = event.rsvps.map((rsvp: any) => rsvp.user);
    }

    // Deduplicate by user id
    const seen = new Set<string>();
    recipients = recipients.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    if (recipients.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No recipients found for this email type',
        queued: 0,
      });
    }

    // Enqueue emails for each recipient
    const emailPromises = recipients.map((recipient) => {
      if (body.type === 'reminder') {
        return sendEventReminderEmail(recipient, event);
      } else {
        return sendPostEventThankYouEmail(recipient, event, body.customMessage);
      }
    });

    await Promise.allSettled(emailPromises);

    logger.info('Bulk event emails queued', {
      eventId,
      type: body.type,
      recipientCount: recipients.length,
      sentBy: user.id,
    });

    return res.status(200).json({
      success: true,
      message: `${recipients.length} ${body.type} email(s) queued`,
      queued: recipients.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }

    logger.error('Error in event email API', { error, eventId });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(withAuth(handler));
