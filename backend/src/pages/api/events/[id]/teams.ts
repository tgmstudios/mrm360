import { NextApiRequest, NextApiResponse } from 'next';
import { withCORS } from '@/middleware/corsMiddleware';
import { withAuth } from '@/middleware/authMiddleware';
import { logger } from '@/utils/logger';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';
import { prisma } from '@/models/prismaClient';

/**
 * @swagger
 * /api/events/{id}/teams:
 *   get:
 *     summary: Get all teams for an event
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
 *         description: Event teams retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       teamNumber:
 *                         type: integer
 *                       members:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             userId:
 *                               type: string
 *                             email:
 *                               type: string
 *                             user:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 email:
 *                                   type: string
 *                                 firstName:
 *                                   type: string
 *                                 lastName:
 *                                   type: string
 *                                 displayName:
 *                                   type: string
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create teams for an event from wiretap workshop
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
 *             required:
 *               - wiretapWorkshopId
 *             properties:
 *               wiretapWorkshopId:
 *                 type: string
 *                 description: Wiretap workshop/project ID
 *               membersPerTeam:
 *                 type: integer
 *                 default: 4
 *                 description: Number of members per team
 *     responses:
 *       201:
 *         description: Teams created successfully
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

  try {
    // Verify event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        checkIns: {
          include: { user: true }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (req.method === 'GET') {
      // Get all teams for the event
      const teams = await prisma.eventTeam.findMany({
        where: { eventId },
        include: {
          members: {
            include: { user: true }
          }
        },
        orderBy: { teamNumber: 'asc' }
      });

      // If teams have Wiretap integration, try to get the workshop ID from Wiretap
      return res.status(200).json({
        success: true,
        data: teams
      });
    }

    if (req.method === 'POST') {
      const { wiretapWorkshopId: requestWiretapWorkshopId, membersPerTeam = 4, assignmentType = 'manual' } = req.body;

      // Check if teams already exist
      const existingTeams = await prisma.eventTeam.findMany({
        where: { eventId }
      });

      if (existingTeams.length > 0) {
        return res.status(400).json({ error: 'Teams already exist for this event' });
      }

      // Use the event's wiretapWorkshopId if not provided in request
      const wiretapWorkshopId = requestWiretapWorkshopId || event.wiretapWorkshopId;
      
      logger.info(`Team creation for event ${eventId}`, {
        requestWiretapWorkshopId,
        eventWiretapWorkshopId: event.wiretapWorkshopId,
        finalWiretapWorkshopId: wiretapWorkshopId,
        assignmentType,
        membersPerTeam
      });

      let eligibleUsers = [];
      let wiretapService = null;

      // Get RSVPs for the event to determine eligible users
      const rsvps = await prisma.rSVP.findMany({
        where: { eventId },
        include: { user: true }
      });

      logger.info(`Found ${rsvps.length} RSVPs for event ${eventId}`, {
        rsvpStatuses: rsvps.map(rsvp => ({ email: rsvp.user.email, status: rsvp.status }))
      });

      // Filter users based on assignment type
      if (assignmentType === 'automatic') {
        // For automatic assignment, use users with CONFIRMED RSVP status
        const confirmedUsers = rsvps
          .filter(rsvp => rsvp.status === 'CONFIRMED')
          .map(rsvp => ({
            id: rsvp.user.id,
            email: rsvp.user.email,
            username: rsvp.user.displayName || `${rsvp.user.firstName} ${rsvp.user.lastName}`
          }));
        eligibleUsers = confirmedUsers;
        logger.info(`Automatic assignment: Found ${confirmedUsers.length} users with CONFIRMED RSVP status`);
      } else {
        // For manual assignment, use checked-in users
        eligibleUsers = event.checkIns.map(checkIn => ({
          id: checkIn.user.id,
          email: checkIn.user.email,
          username: checkIn.user.displayName || `${checkIn.user.firstName} ${checkIn.user.lastName}`
        }));
        logger.info(`Manual assignment: Found ${eligibleUsers.length} checked-in users`);
      }

      // If wiretap integration is enabled, prepare for optimistic user assignment
      if (wiretapWorkshopId) {
        try {
          // Get wiretap service
          wiretapService = WiretapServiceFactory.createServiceFromEnv();
          
          // Get wiretap project details
          const wiretapProject = await wiretapService.getProject(wiretapWorkshopId);
          
          logger.info(`Wiretap integration enabled for project ${wiretapWorkshopId}`, {
            eligibleUserCount: eligibleUsers.length,
            eligibleEmails: eligibleUsers.map(user => user.email)
          });
          
          // Wiretap supports optimistic users, so we can assign users by email directly
          // No need to check if users exist in Wiretap first
          logger.info('Using optimistic user assignment - users will be created in Wiretap as needed');
          
        } catch (error) {
          logger.warn('Failed to initialize Wiretap service, continuing without Wiretap integration', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            wiretapWorkshopId 
          });
          wiretapService = null; // Disable Wiretap integration for this request
        }
      }

      logger.info(`Final eligible users count: ${eligibleUsers.length}`, {
        assignmentType,
        wiretapWorkshopId: wiretapWorkshopId || 'none',
        eventId
      });

      // Allow creating empty teams - users can be assigned later
      logger.info(`Creating teams with ${eligibleUsers.length} users (empty teams allowed)`);

      // Create teams - ensure at least 1 team is created even if no users
      const numberOfTeams = Math.max(1, Math.ceil(eligibleUsers.length / membersPerTeam));
      const teams = [];

      for (let i = 0; i < numberOfTeams; i++) {
        const teamNumber = i + 1;
        const startIndex = i * membersPerTeam;
        const endIndex = Math.min(startIndex + membersPerTeam, eligibleUsers.length);
        const teamUsers = eligibleUsers.slice(startIndex, endIndex);

        // Create event team in database
        const eventTeam = await prisma.eventTeam.create({
          data: {
            eventId,
            teamNumber
          }
        });

        // Add team members
        for (const user of teamUsers) {
          // Find or create user in our database
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                firstName: user.username || 'Unknown',
                lastName: '',
                displayName: user.username
              }
            });
          }

          // Add user to event team
          await prisma.eventTeamMember.create({
            data: {
              eventTeamId: eventTeam.id,
              userId: dbUser.id,
              email: user.email
            }
          });

          // Add user to wiretap workshop if available (using optimistic assignment)
          if (wiretapService && wiretapWorkshopId) {
            try {
              // Use email for optimistic user assignment
              await wiretapService.addUsersToProjectByEmail(wiretapWorkshopId, [user.email]);
              logger.info(`Added user ${user.email} to Wiretap workshop ${wiretapWorkshopId}`);
            } catch (error) {
              logger.warn('Failed to add user to wiretap workshop', { 
                email: user.email, 
                wiretapWorkshopId,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          }
        }

        teams.push({
          id: eventTeam.id,
          teamNumber,
          memberCount: teamUsers.length
        });
      }

      logger.info(`Created ${teams.length} teams for event ${eventId}`);

      return res.status(201).json({
        success: true,
        data: teams,
        message: `Successfully created ${teams.length} teams with ${eligibleUsers.length} members`
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    logger.error('Error handling event teams request', { 
      eventId, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

export default withCORS(withAuth(handler));

