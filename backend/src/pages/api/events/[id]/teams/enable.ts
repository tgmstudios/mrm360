import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/models/prismaClient';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { withPermissions } from '@/middleware/permissionMiddleware';
import { logger } from '@/utils/logger';

/**
 * @swagger
 * /api/events/{id}/teams/enable:
 *   post:
 *     summary: Enable teams for an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Teams enabled successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: eventId } = req.query;

  if (typeof eventId !== 'string') {
    return res.status(400).json({ error: 'Invalid event ID' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Enable teams for the event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { teamsEnabled: true }
    });

    logger.info(`Teams enabled for event ${eventId}`);

    res.status(200).json({
      success: true,
      message: 'Teams enabled successfully',
      data: updatedEvent
    });
  } catch (error) {
    logger.error('Error enabling teams for event:', { eventId, error });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default withCORS(withAuth(withPermissions(handler, ['Event', 'update'])));
