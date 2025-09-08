import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/events/{id}/teams/{teamId}/members:
 *   post:
 *     summary: Add member to event team
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of user to add to team
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Event, team, or user not found
 *       409:
 *         description: User already in team
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Remove member from event team
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of user to remove from team
 *     responses:
 *       200:
 *         description: Member removed successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Event, team, or member not found
 *       500:
 *         description: Internal server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id: eventId, teamId } = req.query;

  if (typeof eventId !== 'string' || typeof teamId !== 'string') {
    return res.status(400).json({ error: 'Invalid event ID or team ID' });
  }

  try {
    // Verify event and team exist
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const team = await prisma.eventTeam.findUnique({
      where: { id: teamId },
      include: {
        event: true,
        members: {
          include: { user: true }
        }
      }
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (team.eventId !== eventId) {
      return res.status(400).json({ error: 'Team does not belong to this event' });
    }

    if (req.method === 'POST') {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user is already in team
      const existingMember = await prisma.eventTeamMember.findFirst({
        where: {
          eventTeamId: teamId,
          email: email
        }
      });

      if (existingMember) {
        return res.status(409).json({ 
          error: 'This user is already a member of this team',
          message: 'The user you are trying to add is already part of this team.'
        });
      }

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Try to get user from wiretap
        try {
          const wiretapService = WiretapServiceFactory.createServiceFromEnv();
          const wiretapUser = await wiretapService.getUserByEmail(email);
          
          user = await prisma.user.create({
            data: {
              email: wiretapUser.email,
              firstName: wiretapUser.username || 'Unknown',
              lastName: '',
              displayName: wiretapUser.username
            }
          });
        } catch (error) {
          return res.status(404).json({ error: 'User not found in system or wiretap' });
        }
      }

      // Add member to team
      const teamMember = await prisma.eventTeamMember.create({
        data: {
          eventTeamId: teamId,
          userId: user.id,
          email: email
        },
        include: { user: true }
      });

      // Sync to wiretap if event has wiretap workshop
      if (team.event.wiretapWorkshopId) {
        try {
          const wiretapService = WiretapServiceFactory.createServiceFromEnv();
          // Use optimistic assignment with email
          await wiretapService.addUsersToProjectByEmail(team.event.wiretapWorkshopId, [email]);
          logger.info('Successfully synced user to wiretap workshop', { teamId, email });
        } catch (error) {
          logger.warn('Failed to sync user to wiretap workshop', { 
            teamId, 
            email, 
            wiretapWorkshopId: team.event.wiretapWorkshopId,
            error 
          });
          // Don't fail the request if wiretap sync fails
        }
      }

      logger.info(`Added user ${email} to team ${teamId}`);

      return res.status(201).json({
        success: true,
        data: teamMember,
        message: 'Member added successfully'
      });
    }

    if (req.method === 'DELETE') {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Find team member
      const teamMember = await prisma.eventTeamMember.findFirst({
        where: {
          eventTeamId: teamId,
          email: email
        }
      });

      if (!teamMember) {
        return res.status(404).json({ error: 'Member not found in team' });
      }

      // Remove member from team
      await prisma.eventTeamMember.delete({
        where: { id: teamMember.id }
      });

      // Sync to wiretap if event has wiretap workshop
      if (team.event.wiretapWorkshopId) {
        try {
          const wiretapService = WiretapServiceFactory.createServiceFromEnv();
          // Use optimistic assignment with email
          await wiretapService.removeUsersFromProjectByEmail(team.event.wiretapWorkshopId, [email]);
          logger.info('Successfully synced user removal to wiretap workshop', { teamId, email });
        } catch (error) {
          logger.warn('Failed to sync user removal to wiretap workshop', { 
            teamId, 
            email, 
            wiretapWorkshopId: team.event.wiretapWorkshopId,
            error 
          });
          // Don't fail the request if wiretap sync fails
        }
      }

      logger.info(`Removed user ${email} from team ${teamId}`);

      return res.status(200).json({
        success: true,
        message: 'Member removed successfully'
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    logger.error('Error handling team member request', { eventId, teamId, error });
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export default withCORS(withAuth(handler));
