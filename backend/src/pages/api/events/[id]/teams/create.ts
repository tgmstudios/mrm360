import { NextApiRequest, NextApiResponse } from 'next';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';

/**
 * @swagger
 * /api/events/{id}/teams/create:
 *   post:
 *     summary: Create a single team for an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     teamNumber:
 *                       type: integer
 *                     memberCount:
 *                       type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
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
    // Verify event exists and teams are enabled
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventTeams: {
          orderBy: { teamNumber: 'desc' },
          take: 1
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!event.teamsEnabled) {
      return res.status(400).json({ error: 'Teams are not enabled for this event' });
    }

    // Calculate the next team number
    const nextTeamNumber = event.eventTeams.length > 0 
      ? event.eventTeams[0].teamNumber + 1 
      : 1;

    // Create the new team
    const newTeam = await prisma.eventTeam.create({
      data: {
        eventId,
        teamNumber: nextTeamNumber
      }
    });

    logger.info(`Created new team ${nextTeamNumber} for event ${eventId}`);

    return res.status(201).json({
      success: true,
      data: {
        id: newTeam.id,
        teamNumber: newTeam.teamNumber,
        memberCount: 0
      },
      message: `Team ${nextTeamNumber} created successfully`
    });

  } catch (error) {
    logger.error('Error creating event team', { 
      eventId, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export default withCORS(withAuth(handler));
