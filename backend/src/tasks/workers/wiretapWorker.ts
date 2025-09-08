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
    await taskManager.markTaskFailed(backgroundTaskId, {
      message: error instanceof Error ? error.message : 'Unknown error during Wiretap resource provisioning'
    });
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
  const confirmedUsers = event.rsvps
    .filter((rsvp: any) => rsvp.status === 'CONFIRMED')
    .map((rsvp: any) => rsvp.user);

  logger.info(`Auto-assigning users for event ${event.id}`, {
    confirmedUsersCount: confirmedUsers.length,
    wiretapWorkshopId: event.wiretapWorkshopId,
    hasWiretapService: !!wiretapService
  });

  if (confirmedUsers.length === 0) {
    logger.info('No confirmed users to assign');
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
  const unassignedUsers = confirmedUsers.filter((user: any) => !existingMembers.has(user.id));

  if (unassignedUsers.length === 0) {
    return 0;
  }

  // Assign users to teams
  let usersAssigned = 0;

  for (const user of unassignedUsers) {
    // Find a team with space (only from existing Wiretap teams)
    let targetTeam = event.eventTeams.find(team => team.members.length < membersPerTeam);
    
    if (!targetTeam) {
      // No available team slots - skip assignment
      logger.info(`No available team slots for user ${user.email}, skipping assignment`);
      continue;
    }

    // Add user to team
    await prisma.eventTeamMember.create({
      data: {
        eventTeamId: targetTeam.id,
        userId: user.id,
        email: user.email
      }
    });

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
    
    // Move to next team if current team is full
    if (targetTeam.members.length + 1 >= membersPerTeam) {
      currentTeamIndex++;
    }
  }

  return usersAssigned;
}

async function removeDeclinedUsers(event: any, wiretapService: any, results: any) {
  const declinedUserIds = event.rsvps
    .filter((rsvp: any) => rsvp.status === 'DECLINED')
    .map((rsvp: any) => rsvp.userId);

  logger.info(`Removing declined users for event ${event.id}`, {
    declinedUsersCount: declinedUserIds.length,
    hasWiretapService: !!wiretapService
  });

  if (declinedUserIds.length === 0) {
    logger.info('No declined users to remove');
    return 0;
  }

  let usersRemoved = 0;

  for (const team of event.eventTeams) {
    const membersToRemove = team.members.filter((member: any) => 
      declinedUserIds.includes(member.userId)
    );

    for (const member of membersToRemove) {
      // Remove from database
      await prisma.eventTeamMember.delete({
        where: { id: member.id }
      });

      // Remove from wiretap workshop if available (using email-based removal)
      if (event.wiretapWorkshopId && wiretapService) {
        try {
          logger.info(`Removing user from Wiretap workshop`, { 
            email: member.email, 
            wiretapWorkshopId: event.wiretapWorkshopId 
          });
          await wiretapService.removeUsersFromProjectByEmail(event.wiretapWorkshopId, [member.email]);
          results.wiretapSyncs++;
          logger.info(`Successfully removed user from Wiretap workshop`, { email: member.email });
        } catch (error) {
          logger.warn('Failed to remove user from wiretap workshop', { email: member.email, error });
        }
      }

      usersRemoved++;
    }
  }

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
    const workshop = workshops.find(w => w.id === event.wiretapWorkshopId);
    
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


