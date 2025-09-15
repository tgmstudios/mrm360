import { NextApiRequest, NextApiResponse } from 'next';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { z } from 'zod';

const switchTeamSchema = z.object({
  targetTeamId: z.string().min(1, 'Target team ID is required'),
});

/**
 * @swagger
 * /api/events/{id}/teams/switch:
 *   post:
 *     summary: Switch user to a different team
 *     tags: [Events]
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
 *               targetTeamId:
 *                 type: string
 *                 description: ID of the team to switch to
 *     responses:
 *       200:
 *         description: Successfully switched teams
 *       400:
 *         description: Bad request or team switching not allowed
 *       404:
 *         description: Event or team not found
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
    const requestingUser = (req as any).user;
    const { targetTeamId } = switchTeamSchema.parse(req.body);

    // Get event with teams and check if team switching is allowed
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventTeams: {
          include: {
            members: {
              include: { user: true }
            }
          }
        },
        checkIns: {
          where: { userId: requestingUser.id }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if team switching is enabled
    if (!event.allowTeamSwitching) {
      return res.status(400).json({ 
        error: 'Team switching is not enabled for this event' 
      });
    }

    // Check if teams are enabled
    if (!event.teamsEnabled) {
      return res.status(400).json({ 
        error: 'Teams are not enabled for this event' 
      });
    }

    // Check if user is checked in
    if (event.checkIns.length === 0) {
      return res.status(400).json({ 
        error: 'You must be checked in to switch teams' 
      });
    }

    // Find target team
    const targetTeam = event.eventTeams.find(team => team.id === targetTeamId);
    if (!targetTeam) {
      return res.status(404).json({ error: 'Target team not found' });
    }

    // Check if target team has space
    const currentMemberCount = targetTeam.members.length;
    const maxMembers = event.membersPerTeam || 4;
    
    if (currentMemberCount >= maxMembers) {
      return res.status(400).json({ 
        error: `Team ${targetTeam.teamNumber} is full (${currentMemberCount}/${maxMembers} members)` 
      });
    }

    // Find user's current team membership
    const currentMembership = await prisma.eventTeamMember.findFirst({
      where: {
        userId: requestingUser.id,
        eventTeam: {
          eventId: eventId
        }
      },
      include: {
        eventTeam: true
      }
    });

    if (!currentMembership) {
      return res.status(400).json({ 
        error: 'You are not currently assigned to any team' 
      });
    }

    // Check if user is already in the target team
    if (currentMembership.eventTeamId === targetTeamId) {
      return res.status(400).json({ 
        error: 'You are already in this team' 
      });
    }

    // Perform the team switch in a transaction
    await prisma.$transaction(async (tx) => {
      // Remove from current team
      await tx.eventTeamMember.delete({
        where: { id: currentMembership.id }
      });

      // Add to target team
      await tx.eventTeamMember.create({
        data: {
          eventTeamId: targetTeamId,
          userId: requestingUser.id,
          email: requestingUser.email
        }
      });
    });

    logger.info('User switched teams successfully', {
      userId: requestingUser.id,
      eventId,
      fromTeam: currentMembership.eventTeam.teamNumber,
      toTeam: targetTeam.teamNumber
    });

    // Wiretap sync: remove from old Wiretap team, add to new Wiretap team
    try {
      const oldWiretapTeamId = currentMembership.eventTeam.wiretapTeamId;
      const newWiretapTeamId = targetTeam.wiretapTeamId;

      if (oldWiretapTeamId) {
        try {
          const wiretapService = (await import('@/services/wiretapServiceFactory')).WiretapServiceFactory.createServiceFromEnv();
          const teamUsers = await wiretapService.listTeamUsers(oldWiretapTeamId);
          const match = teamUsers.find((u: any) => (u.email || '').toLowerCase() === (requestingUser.email || '').toLowerCase());
          if (match) {
            await wiretapService.removeTeamUser(oldWiretapTeamId, match.id);
            logger.info('Removed user from old Wiretap team', { oldWiretapTeamId, userId: match.id, email: requestingUser.email });
          } else {
            try {
              const pending = await wiretapService.listTeamPendingAssignments(oldWiretapTeamId);
              const p = pending.find((pa: any) => (pa.email || '').toLowerCase() === (requestingUser.email || '').toLowerCase());
              if (p) {
                await wiretapService.removePendingTeamAssignment(requestingUser.email, oldWiretapTeamId);
                logger.info('Removed pending assignment from old Wiretap team', { oldWiretapTeamId, email: requestingUser.email, pendingId: p.id });
              }
            } catch (pendErr) {
              logger.warn('Failed to check/remove pending assignment on old Wiretap team', { oldWiretapTeamId, email: requestingUser.email, error: pendErr instanceof Error ? pendErr.message : 'Unknown error' });
            }
          }
        } catch (wtErr) {
          logger.warn('Failed to remove user from old Wiretap team during switch', { oldWiretapTeamId, email: requestingUser.email, error: wtErr instanceof Error ? wtErr.message : 'Unknown error' });
        }
      }

      if (newWiretapTeamId) {
        try {
          const wiretapService = (await import('@/services/wiretapServiceFactory')).WiretapServiceFactory.createServiceFromEnv();
          await wiretapService.addTeamMemberByEmail(newWiretapTeamId, requestingUser.email);
          logger.info('Added user to new Wiretap team', { newWiretapTeamId, email: requestingUser.email });
        } catch (wtAddErr) {
          logger.warn('Failed to add user to new Wiretap team during switch', { newWiretapTeamId, email: requestingUser.email, error: wtAddErr instanceof Error ? wtAddErr.message : 'Unknown error' });
        }
      }
    } catch (wiretapErr) {
      logger.warn('Wiretap sync error during team switch', { error: wiretapErr instanceof Error ? wiretapErr.message : 'Unknown error' });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully switched to Team ${targetTeam.teamNumber}`,
      teamNumber: targetTeam.teamNumber
    });

  } catch (error) {
    logger.error('Error switching teams', { 
      eventId, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export default withCORS(withAuth(handler));
