import { NextApiRequest, NextApiResponse } from 'next';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';

/**
 * @swagger
 * /api/events/{id}/teams/my-team:
 *   get:
 *     summary: Get user's current team and available teams for switching
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: User's team information
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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requestingUser = (req as any).user;

    // Get event with teams
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

    // Check if teams are enabled
    if (!event.teamsEnabled) {
      return res.status(200).json({
        allowTeamSwitching: false,
        currentTeam: null,
        availableTeams: []
      });
    }

    // Check if user is checked in
    if (event.checkIns.length === 0) {
      return res.status(200).json({
        allowTeamSwitching: event.allowTeamSwitching,
        currentTeam: null,
        availableTeams: []
      });
    }

    // Find user's current team
    const currentMembership = await prisma.eventTeamMember.findFirst({
      where: {
        userId: requestingUser.id,
        eventTeam: {
          eventId: eventId
        }
      },
      include: {
        eventTeam: {
          include: {
            members: {
              include: { user: true }
            }
          }
        }
      }
    });

    // Get all teams with availability info
    const maxMembers = event.membersPerTeam || 4;
    const availableTeams = event.eventTeams.map(team => ({
      id: team.id,
      teamNumber: team.teamNumber,
      memberCount: team.members.length,
      maxMembers,
      hasSpace: team.members.length < maxMembers,
      members: team.members.map(member => ({
        id: member.user.id,
        displayName: member.user.displayName || `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email
      }))
    }));

    const response = {
      allowTeamSwitching: event.allowTeamSwitching,
      currentTeam: currentMembership ? {
        id: currentMembership.eventTeam.id,
        teamNumber: currentMembership.eventTeam.teamNumber,
        memberCount: currentMembership.eventTeam.members.length,
        maxMembers,
        members: currentMembership.eventTeam.members.map(member => ({
          id: member.user.id,
          displayName: member.user.displayName || `${member.user.firstName} ${member.user.lastName}`,
          email: member.user.email
        }))
      } : null,
      availableTeams: event.allowTeamSwitching ? availableTeams : []
    };

    return res.status(200).json(response);

  } catch (error) {
    logger.error('Error getting user team information', { 
      eventId, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export default withCORS(withAuth(handler));
