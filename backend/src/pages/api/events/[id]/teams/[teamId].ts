import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/events/{id}/teams/{teamId}:
 *   delete:
 *     summary: Delete event team
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team deleted successfully
 *       404:
 *         description: Event or team not found
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: eventId, teamId } = req.query;

  if (typeof eventId !== 'string' || typeof teamId !== 'string') {
    return res.status(400).json({ error: 'Invalid event ID or team ID' });
  }

  if (req.method !== 'DELETE') {
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

    // Get team with members
    const team = await prisma.eventTeam.findUnique({
      where: { id: teamId },
      include: {
        members: true
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.eventId !== eventId) {
      return res.status(400).json({ error: 'Team does not belong to this event' });
    }

    // Note: We don't delete individual Wiretap projects anymore
    // Teams are part of the workshop, so we just remove the MRM team

    // Delete team (members will be cascade deleted)
    await prisma.eventTeam.delete({
      where: { id: teamId }
    });

    logger.info(`Deleted team ${teamId} from event ${eventId}`);

    return res.status(200).json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting team', { eventId, teamId, error });
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export default withCORS(withAuth(handler));
