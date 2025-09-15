import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { BackgroundTaskManager } from '@/managers/backgroundTaskManager';
import { WiretapServiceFactory } from '@/services/wiretapServiceFactory';

interface WiretapJobData {
  backgroundTaskId: string;
  action: 'provision_event' | 'cleanup_event' | 'sync_users' | 'sync_teams' | 'health_check';
  payload: Record<string, any>;
}

export async function processWiretapJob(job: Job<WiretapJobData>) {
  const { backgroundTaskId, action, payload } = job.data;
  const taskManager = new BackgroundTaskManager(prisma);

  logger.info(`Processing Wiretap job ${job.id} for ${action} task ${backgroundTaskId}`);

  try {
    await taskManager.markTaskRunning(backgroundTaskId);

    // Create Wiretap service instance
    const wiretapService = WiretapServiceFactory.createServiceFromEnv();

    let result: any = {};

    switch (action) {
      case 'provision_event':
        result = await handleProvisionEvent(wiretapService, payload, taskManager, backgroundTaskId);
        break;
      
      case 'cleanup_event':
        result = await handleCleanupEvent(wiretapService, payload, taskManager, backgroundTaskId);
        break;
      
      case 'sync_users':
        result = await handleSyncUsers(wiretapService, payload, taskManager, backgroundTaskId);
        break;
      
      case 'sync_teams':
        result = await handleSyncTeams(wiretapService, payload, taskManager, backgroundTaskId);
        break;
      
      case 'health_check':
        result = await handleHealthCheck(wiretapService, taskManager, backgroundTaskId);
        break;
      
      default:
        throw new Error(`Unknown Wiretap action: ${action}`);
    }

    await taskManager.markTaskCompleted(backgroundTaskId, { 
      message: `Wiretap ${action} completed successfully`,
      result 
    });

    logger.info(`Wiretap job ${job.id} completed successfully`, { action, result });
    return { success: true, result };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Wiretap job ${job.id} failed`, { action, error: errMsg });
    await taskManager.markTaskFailed(backgroundTaskId, errMsg);
    throw error;
  }
}

async function handleProvisionEvent(
  wiretapService: any, 
  payload: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  const { eventId, eventType, resourceSpecs } = payload;
  
  logger.info(`Provisioning Wiretap resources for event ${eventId}`, { eventType, resourceCount: resourceSpecs?.length || 0 });

  try {
    // Actually provision Wiretap resources
    const resources = await wiretapService.provisionEventResources(eventId, eventType, resourceSpecs || []);
    
    // Mark the task as completed
    await taskManager.markTaskCompleted(backgroundTaskId, { 
      message: `Successfully provisioned ${resources.length} Wiretap resources for event ${eventId}`,
      resourcesCreated: resources.length
    });
    
    return {
      eventId,
      eventType,
      resourcesCreated: resources.length,
      resources
    };
  } catch (error) {
    logger.error(`Failed to provision Wiretap resources for event ${eventId}`, { error });
    await taskManager.markTaskFailed(backgroundTaskId, error instanceof Error ? error.message : 'Unknown error during Wiretap resource provisioning');
    throw error;
  }
}

async function handleCleanupEvent(
  wiretapService: any, 
  payload: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  const { eventId } = payload;
  
  logger.info(`Cleaning up Wiretap resources for event ${eventId}`);

  // Actually cleanup Wiretap resources
  await wiretapService.cleanupEventResources(eventId);
  
  return {
    eventId,
    cleanupCompleted: true
  };
}

async function handleSyncUsers(
  wiretapService: any, 
  payload: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  const { projectId, userIds } = payload;
  
  logger.info(`Syncing users for Wiretap project ${projectId}`, { userCount: userIds?.length || 0 });

  // Actually sync users to Wiretap
  if (userIds && userIds.length > 0) {
    await wiretapService.addUsersToProject(projectId, userIds);
  }
  
  return {
    projectId,
    usersSynced: userIds?.length || 0,
    syncCompleted: true
  };
}

async function handleSyncTeams(
  wiretapService: any, 
  payload: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  const { eventId, syncType, membersPerTeam } = payload;
  
  logger.info(`Syncing teams for event ${eventId}`, { syncType, membersPerTeam });

  // Perform actual team sync without artificial progress simulation
  const result = await performTeamSync(eventId, syncType, membersPerTeam, wiretapService);
  
  return {
    eventId,
    syncType,
    ...result,
    syncCompleted: true
  };
}

async function performTeamSync(eventId: string, syncType: string, membersPerTeam: number, wiretapService: any) {
  // Get event with teams and RSVPs
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
      rsvps: {
        include: { user: true }
      },
      checkIns: {
        include: { user: true }
      }
    }
  });

  if (!event) {
    throw new Error('Event not found');
  }

  logger.info(`Starting team sync for event ${eventId}`, {
    eventTitle: event.title,
    wiretapWorkshopId: event.wiretapWorkshopId,
    teamCount: event.eventTeams.length,
    rsvpCount: event.rsvps.length,
    syncType
  });

  const results = {
    usersAssigned: 0,
    usersRemoved: 0,
    teamsUpdated: 0,
    wiretapSyncs: 0
  };

  // First, sync existing Wiretap teams into MRM
  if (event.wiretapWorkshopId && wiretapService) {
    results.teamsUpdated = await syncExistingWiretapTeams(event, wiretapService, results);
    
    // After syncing teams, sync existing team members to Wiretap
    await syncExistingTeamMembersToWiretap(event, wiretapService, results);
  }

  switch (syncType) {
    case 'auto_assign':
      results.usersAssigned = await autoAssignUsers(event, membersPerTeam, wiretapService, results);
      break;
    
    case 'remove_declined':
      results.usersRemoved = await removeDeclinedUsers(event, wiretapService, results);
      break;
    
    case 'sync_all':
      results.usersAssigned = await autoAssignUsers(event, membersPerTeam, wiretapService, results);
      results.usersRemoved = await removeDeclinedUsers(event, wiretapService, results);
      break;
  }

  logger.info(`Team sync completed for event ${eventId}`, results);
  return results;
}

async function autoAssignUsers(event: any, membersPerTeam: number, wiretapService: any, results: any) {
  // Get confirmed users who are also checked in
  const confirmedUsers = event.rsvps
    .filter((rsvp: any) => rsvp.status === 'CONFIRMED')
    .map((rsvp: any) => rsvp.user);

  // Get checked-in user IDs
  const checkedInUserIds = new Set(event.checkIns?.map((checkIn: any) => checkIn.userId) || []);

  // Only assign users who are both confirmed AND checked in
  const eligibleUsers = confirmedUsers.filter((user: any) => checkedInUserIds.has(user.id));

  logger.info(`Auto-assigning users for event ${event.id}`, {
    confirmedUsersCount: confirmedUsers.length,
    checkedInUsersCount: checkedInUserIds.size,
    eligibleUsersCount: eligibleUsers.length,
    wiretapWorkshopId: event.wiretapWorkshopId,
    hasWiretapService: !!wiretapService,
    teamCount: event.eventTeams.length,
    teamDetails: event.eventTeams.map((team: any) => ({
      teamNumber: team.teamNumber,
      memberCount: team.members.length,
      members: team.members.map((m: any) => m.email)
    }))
  });

  if (eligibleUsers.length === 0) {
    logger.info('No confirmed and checked-in users to assign');
    return 0;
  }

  // Get existing team members
  const existingMembers = new Set();
  event.eventTeams.forEach((team: any) => {
    team.members.forEach((member: any) => {
      existingMembers.add(member.userId);
    });
  });

  // Filter out users already assigned to teams
  const unassignedUsers = eligibleUsers.filter((user: any) => !existingMembers.has(user.id));

  logger.info(`Found ${unassignedUsers.length} unassigned users`, {
    unassignedEmails: unassignedUsers.map((u: any) => u.email),
    existingMembers: Array.from(existingMembers)
  });

  if (unassignedUsers.length === 0) {
    logger.info('All eligible users are already assigned to teams');
    return 0;
  }

  // If no teams exist, create them first
  if (event.eventTeams.length === 0) {
    logger.info('No teams exist, creating teams first');
    const numberOfTeams = Math.ceil(unassignedUsers.length / membersPerTeam);
    
    for (let i = 0; i < numberOfTeams; i++) {
      const teamNumber = i + 1;
      const eventTeam = await prisma.eventTeam.create({
        data: {
          eventId: event.id,
          teamNumber
        }
      });
      
      // Add the team to our local event object for assignment
      event.eventTeams.push({
        id: eventTeam.id,
        teamNumber,
        members: []
      });
      
      logger.info(`Created team ${teamNumber} with ID ${eventTeam.id}`);
    }
  }

  // Assign users to teams with balancing and strict capacity limits
  let usersAssigned = 0;

  for (const user of unassignedUsers) {
    // Choose the first team by ascending teamNumber that has capacity (fill teams one by one)
    const teamWithSpace = event.eventTeams
      .filter((t: any) => t.members.length < membersPerTeam)
      .sort((a: any, b: any) => (a.teamNumber || 0) - (b.teamNumber || 0))[0];

    let targetTeam = teamWithSpace || null;

    if (!targetTeam) {
      // All existing teams are full; create a new team and assign user there
      const nextTeamNumber = (event.eventTeams.reduce((max: number, t: any) => Math.max(max, t.teamNumber || 0), 0) || 0) + 1;
      const newTeam = await prisma.eventTeam.create({
        data: {
          eventId: event.id,
          teamNumber: nextTeamNumber
        }
      });
      targetTeam = { id: newTeam.id, teamNumber: nextTeamNumber, members: [] };
      event.eventTeams.push(targetTeam);
      logger.info(`Created new team ${nextTeamNumber} to accommodate assignment`);
    }

    // Guard: enforce capacity
    if (targetTeam.members.length >= membersPerTeam) {
      logger.warn(`Selected team ${targetTeam.teamNumber} reached capacity unexpectedly (${targetTeam.members.length}/${membersPerTeam}), re-evaluating`);
      continue;
    }

    logger.info(`Assigning user ${user.email} to team ${targetTeam.teamNumber} (${targetTeam.members.length}/${membersPerTeam})`);

    // Add user to team
    await prisma.eventTeamMember.create({
      data: {
        eventTeamId: targetTeam.id,
        userId: user.id,
        email: user.email
      }
    });

    // Update the team's member count for next iteration
    targetTeam.members.push({ userId: user.id, email: user.email });

    // Add user to wiretap workshop if available (using optimistic assignment)
    if (event.wiretapWorkshopId && wiretapService) {
      try {
        logger.info(`Adding user to Wiretap workshop`, { 
          email: user.email, 
          wiretapWorkshopId: event.wiretapWorkshopId 
        });
        await wiretapService.addUsersToProjectByEmail(event.wiretapWorkshopId, [user.email]);
        results.wiretapSyncs++;
        logger.info(`Successfully added user to Wiretap workshop`, { email: user.email });
      } catch (error) {
        logger.warn('Failed to add user to wiretap workshop', { email: user.email, error });
      }
    }

    usersAssigned++;
    logger.info(`Successfully assigned user ${user.email} to team ${targetTeam.teamNumber} (${targetTeam.members.length}/${membersPerTeam})`);
  }

  logger.info(`Auto-assignment completed: ${usersAssigned} users assigned to teams`);
  return usersAssigned;
}

async function removeDeclinedUsers(event: any, wiretapService: any, results: any) {
  const declinedUserIds = event.rsvps
    .filter((rsvp: any) => rsvp.status === 'DECLINED')
    .map((rsvp: any) => rsvp.userId);

  logger.info(`Removing declined users for event ${event.id}`, {
    declinedUsersCount: declinedUserIds.length,
    hasWiretapService: !!wiretapService,
    wiretapWorkshopId: event.wiretapWorkshopId,
    declinedUserEmails: event.rsvps
      .filter((rsvp: any) => rsvp.status === 'DECLINED')
      .map((rsvp: any) => rsvp.user.email)
  });

  if (declinedUserIds.length === 0) {
    logger.info('No declined users to remove');
    return 0;
  }

  let usersRemoved = 0;
  const emailsToRemoveFromWiretap: string[] = [];

  for (const team of event.eventTeams) {
    const membersToRemove = team.members.filter((member: any) => 
      declinedUserIds.includes(member.userId)
    );

    logger.info(`Found ${membersToRemove.length} declined users in team ${team.teamNumber}`, {
      teamId: team.id,
      teamNumber: team.teamNumber,
      membersToRemove: membersToRemove.map((m: any) => ({ email: m.email, userId: m.userId }))
    });

    for (const member of membersToRemove) {
      // Remove from database
      await prisma.eventTeamMember.delete({
        where: { id: member.id }
      });

      // Team-level Wiretap removal if possible
      if (team.wiretapTeamId && wiretapService) {
        try {
          const wiretapUsers = await wiretapService.listTeamUsers(team.wiretapTeamId);
          const match = wiretapUsers.find((u: any) => (u.email || '').toLowerCase() === (member.email || '').toLowerCase());
          if (match) {
            await wiretapService.removeTeamUser(team.wiretapTeamId, match.id);
            results.wiretapSyncs++;
            logger.info('Removed declined user from Wiretap team', { wiretapTeamId: team.wiretapTeamId, userId: match.id, email: member.email });
          } else {
            // If not found among team users, check pending assignments and remove
            try {
              const pending = await wiretapService.listTeamPendingAssignments(team.wiretapTeamId);
              const p = pending.find((pa: any) => (pa.email || '').toLowerCase() === (member.email || '').toLowerCase());
              if (p) {
                await wiretapService.removePendingTeamAssignment(member.email, team.wiretapTeamId);
                results.wiretapSyncs++;
                logger.info('Removed declined user pending assignment from Wiretap team', { wiretapTeamId: team.wiretapTeamId, email: member.email, pendingId: p.id });
              } else if (event.wiretapWorkshopId) {
                logger.warn('Declined user not found in team or pending; will fallback to project/email removal if available', { wiretapTeamId: team.wiretapTeamId, email: member.email });
                emailsToRemoveFromWiretap.push(member.email);
              }
            } catch (pendErr) {
              logger.warn('Failed to check/remove pending assignment for declined user; fallback to project/email removal', { wiretapTeamId: team.wiretapTeamId, email: member.email, error: pendErr instanceof Error ? pendErr.message : 'Unknown error' });
              if (event.wiretapWorkshopId) emailsToRemoveFromWiretap.push(member.email);
            }
          }
        } catch (error) {
          logger.warn('Team-level user removal failed in Wiretap for declined user; queueing for project/email removal', { wiretapTeamId: team.wiretapTeamId, email: member.email, error: error instanceof Error ? error.message : 'Unknown error' });
          if (event.wiretapWorkshopId) emailsToRemoveFromWiretap.push(member.email);
        }
      } else if (event.wiretapWorkshopId && wiretapService) {
        // Collect emails for bulk Wiretap removal at workshop level
        emailsToRemoveFromWiretap.push(member.email);
      }

      usersRemoved++;
      logger.info(`Removed declined user ${member.email} from team ${team.teamNumber}`);
    }
  }

  // Bulk remove from Wiretap workshop if needed
  if (emailsToRemoveFromWiretap.length > 0 && event.wiretapWorkshopId && wiretapService) {
    try {
      logger.info(`Bulk removing ${emailsToRemoveFromWiretap.length} declined users from Wiretap workshop`, {
        wiretapWorkshopId: event.wiretapWorkshopId,
        emails: emailsToRemoveFromWiretap
      });
      
      await wiretapService.removeUsersFromProjectByEmail(event.wiretapWorkshopId, emailsToRemoveFromWiretap);
      results.wiretapSyncs += emailsToRemoveFromWiretap.length;
      
      logger.info(`Successfully bulk removed ${emailsToRemoveFromWiretap.length} users from Wiretap workshop`);
    } catch (error) {
      logger.warn('Failed to bulk remove declined users from wiretap workshop', { 
        emails: emailsToRemoveFromWiretap,
        wiretapWorkshopId: event.wiretapWorkshopId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  logger.info(`Removed ${usersRemoved} declined users from teams`);
  return usersRemoved;
}

async function syncExistingWiretapTeams(event: any, wiretapService: any, results: any) {
  logger.info(`Syncing existing Wiretap teams for event ${event.id}`, {
    wiretapWorkshopId: event.wiretapWorkshopId
  });

  try {
    // Get all workshops from Wiretap and find the one matching our event's workshop ID
    const workshops = await wiretapService.listWorkshops();
    
    logger.info(`Retrieved ${workshops.length} workshops from Wiretap`);
    
    // Find the workshop that matches our event's wiretapWorkshopId
    const workshop = workshops.find((w: any) => w.id === event.wiretapWorkshopId);
    
    if (!workshop) {
      logger.warn(`Workshop ${event.wiretapWorkshopId} not found in Wiretap workshops list`);
      return 0;
    }
    
    logger.info(`Found matching workshop in Wiretap`, {
      workshopId: workshop.id,
      workshopName: workshop.name,
      teamsCount: workshop.teams?.length || 0
    });

    if (!workshop.teams || workshop.teams.length === 0) {
      logger.info('No teams found in Wiretap workshop');
      return 0;
    }

    let teamsSynced = 0;

    // Get existing MRM teams for this event
    const existingTeams = await prisma.eventTeam.findMany({
      where: { eventId: event.id }
    });

    logger.info(`Found ${existingTeams.length} existing MRM teams`);

    // Create MRM teams to match Wiretap teams
    for (const wiretapTeam of workshop.teams) {
      logger.info(`Processing Wiretap team`, {
        wiretapTeamId: wiretapTeam.id,
        teamName: wiretapTeam.name,
        teamNumber: wiretapTeam.team_number
      });

      // Check if we already have a team with this number
      const teamNumber = wiretapTeam.team_number || (existingTeams.length + 1);
      const existingTeam = existingTeams.find(team => team.teamNumber === teamNumber);
      
      if (existingTeam) {
        logger.info(`Team ${teamNumber} already exists in MRM`, { 
          mrmTeamId: existingTeam.id
        });
        continue;
      }

      // Create new team in MRM to match Wiretap team
      const newTeam = await prisma.eventTeam.create({
        data: {
          eventId: event.id,
          teamNumber: teamNumber,
          wiretapTeamId: wiretapTeam.id
        }
      });

      logger.info(`Created new team in MRM to match Wiretap team`, {
        mrmTeamId: newTeam.id,
        teamNumber: teamNumber,
        wiretapTeamId: wiretapTeam.id
      });

      teamsSynced++;
      results.wiretapSyncs++;
    }

    logger.info(`Successfully synced ${teamsSynced} teams from Wiretap`);
    return teamsSynced;

  } catch (error) {
    logger.error('Failed to sync existing Wiretap teams', { 
      eventId: event.id, 
      wiretapWorkshopId: event.wiretapWorkshopId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return 0;
  }
}

async function syncExistingTeamMembersToWiretap(event: any, wiretapService: any, results: any) {
  logger.info(`Syncing existing team members to Wiretap for event ${event.id}`);

  try {
    // Get all teams for this event
    const teams = await prisma.eventTeam.findMany({
      where: { eventId: event.id },
      include: {
        members: {
          include: { user: true }
        }
      }
    });

    logger.info(`Found ${teams.length} teams to sync to Wiretap`);

    // Sync team members to their respective Wiretap teams
    let totalMembersSynced = 0;
    
    for (const team of teams) {
      if (!team.wiretapTeamId) {
        logger.info(`Skipping team ${team.id} - no Wiretap team ID`, { teamNumber: team.teamNumber });
        continue;
      }

      logger.info(`Syncing members for team ${team.teamNumber} to Wiretap team ${team.wiretapTeamId}`, {
        memberCount: team.members.length
      });

      for (const member of team.members) {
        try {
          await wiretapService.addTeamMemberByEmail(team.wiretapTeamId, member.email);
          totalMembersSynced++;
          logger.info(`Successfully added ${member.email} to Wiretap team ${team.wiretapTeamId}`);
        } catch (error) {
          logger.warn(`Failed to add ${member.email} to Wiretap team ${team.wiretapTeamId}`, { 
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    if (totalMembersSynced === 0) {
      logger.info('No team members to sync to Wiretap teams');
      return;
    }

    logger.info(`Successfully synced ${totalMembersSynced} team members to Wiretap teams`);
    results.wiretapSyncs += totalMembersSynced;

  } catch (error) {
    logger.error('Failed to sync existing team members to Wiretap', {
      eventId: event.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleHealthCheck(
  wiretapService: any, 
  taskManager: BackgroundTaskManager, 
  backgroundTaskId: string
) {
  logger.info('Performing Wiretap health check');

  // Perform actual health check
  const isHealthy = await wiretapService.healthCheck();
  
  return {
    isHealthy,
    healthCheckCompleted: true,
    timestamp: new Date().toISOString()
  };
}

export async function processWiretapJobFailed(job: Job<WiretapJobData>, error: Error) {
  logger.error(`Wiretap job ${job.id} failed permanently:`, {
    error: error.message,
    data: job.data,
    attempts: job.attemptsMade
  });
}

// Export performTeamSync for direct use
export { performTeamSync };


