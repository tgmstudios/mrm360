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

    // Sync member removals to Wiretap before deleting the team
    if (team.wiretapTeamId && team.members.length > 0) {
      try {
        const wiretapService = WiretapServiceFactory.createServiceFromEnv();
        // Prefer team-level removal by user id looked up from team
        const wiretapUsers = await wiretapService.listTeamUsers(team.wiretapTeamId);
        const idsToRemove = wiretapUsers
          .filter(wu => team.members.some(m => (m.email || '').toLowerCase() === (wu.email || '').toLowerCase()))
          .map(wu => wu.id);
        for (const userId of idsToRemove) {
          await wiretapService.removeTeamUser(team.wiretapTeamId, userId);
        }
        // Also clear pending assignments matching team members
        try {
          const pending = await wiretapService.listTeamPendingAssignments(team.wiretapTeamId);
          const emails = team.members.map(m => (m.email || '').toLowerCase());
          const pendToRemove = pending.filter(pa => emails.includes((pa.email || '').toLowerCase()));
          for (const p of pendToRemove) {
            await wiretapService.removePendingTeamAssignment(p.email, team.wiretapTeamId);
          }
          logger.info('Removed users and pending assignments from Wiretap team before deletion', { teamId, wiretapTeamId: team.wiretapTeamId, removedUsers: idsToRemove.length, removedPending: pendToRemove.length });
        } catch (pendErr) {
          logger.warn('Failed to clear pending assignments during team deletion', { teamId, wiretapTeamId: team.wiretapTeamId, error: pendErr instanceof Error ? pendErr.message : 'Unknown error' });
        }
      } catch (error) {
        logger.warn('Failed to remove users from Wiretap team during team deletion', { teamId, wiretapTeamId: team.wiretapTeamId, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    } else if (event.wiretapWorkshopId && team.members.length > 0) {
      try {
        const wiretapService = WiretapServiceFactory.createServiceFromEnv();
        const memberEmails = team.members.map(member => member.email);
        
        logger.info(`Removing ${memberEmails.length} team members from Wiretap workshop before team deletion`, {
          teamId,
          wiretapWorkshopId: event.wiretapWorkshopId,
          memberEmails
        });
        
        await wiretapService.removeUsersFromProjectByEmail(event.wiretapWorkshopId, memberEmails);
        
        logger.info(`Successfully removed team members from Wiretap workshop`, {
          teamId,
          removedCount: memberEmails.length
        });
      } catch (error) {
        logger.warn('Failed to remove team members from Wiretap workshop during team deletion', {
          teamId,
          wiretapWorkshopId: event.wiretapWorkshopId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Continue with team deletion even if Wiretap sync fails
      }
    }

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
