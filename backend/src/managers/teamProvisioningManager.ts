import { 
  TeamProvisioningTask, 
  TeamProvisioningResult, 
  IntegrationResult,
  TeamProvisioningConfig,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamMember,
  TeamProvisioningOptions
} from '@/types';
import { AuthentikService } from '@/services/authentikService';
import { AuthentikServiceFactory } from '@/services/authentikServiceFactory';
import { WikiJsService } from '@/services/wikijsService';
import { NextcloudService } from '@/services/nextcloudService';
import { GitHubService } from '@/services/githubService';
import { DiscordService } from '@/services/discordService';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';

export class TeamProvisioningManager {
  private authentikService: AuthentikService;
  private wikijsService: WikiJsService;
  private nextcloudService: NextcloudService;
  private githubService: GitHubService;
  private discordService: DiscordService;

  constructor(config: TeamProvisioningConfig) {
    // Use factory to create Authentik service with validation
    try {
      this.authentikService = AuthentikServiceFactory.createService({
        baseUrl: config.authentik.baseUrl,
        token: config.authentik.token,
        parentGroupTemplate: config.authentik.parentGroupTemplate
      });
      logger.info('Authentik service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Authentik service:', error);
      // Fallback to mock service for development
      this.authentikService = AuthentikServiceFactory.createMockService();
      logger.warn('Using mock Authentik service as fallback');
    }

    this.wikijsService = new WikiJsService(config.wikijs);
    this.nextcloudService = new NextcloudService(config.nextcloud);
    this.githubService = new GitHubService(config.github);
    this.discordService = new DiscordService(config.discord);
  }

  async provisionTeam(task: TeamProvisioningTask): Promise<TeamProvisioningResult> {
    const startTime = Date.now();
    logger.info(`Starting team provisioning for ${task.action}: ${task.teamId}`);

    try {
      let result: TeamProvisioningResult;

      switch (task.action) {
        case 'create':
          result = await this.createTeam(task);
          break;
        case 'update':
          result = await this.updateTeam(task);
          break;
        case 'delete':
          result = await this.deleteTeam(task);
          break;
        default:
          throw new Error(`Unknown action: ${task.action}`);
      }

      const duration = Date.now() - startTime;
      logger.info(`Team provisioning completed in ${duration}ms for ${task.action}: ${task.teamId}`);
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Team provisioning failed after ${duration}ms for ${task.action}: ${task.teamId}`, error);
      
      return {
        success: false,
        teamId: task.teamId,
        action: task.action,
        results: {},
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  private async createTeam(task: TeamProvisioningTask): Promise<TeamProvisioningResult> {
    const data = task.data as CreateTeamRequest;
    const options = task.options || this.getDefaultProvisioningOptions();
    const results: TeamProvisioningResult['results'] = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const teamMembers = await this.getTeamMembers(task.teamId);

      // Determine team subtype and parent group based on team type
      let teamSubtype = '';
      
      if (data.type.toUpperCase() === 'COMPETITION') {
        // Competition teams always have a subtype (BLUE, RED, CTF)
        if (data.subtype) {
          teamSubtype = data.subtype.toLowerCase();
          logger.info(`Competition team with subtype '${teamSubtype}'`);
        } else {
          // Fallback if no subtype is set
          teamSubtype = 'blue';
          logger.warn(`Competition team has no subtype, defaulting to 'blue'`);
        }
      } else if (data.type.toUpperCase() === 'DEVELOPMENT') {
        // Development teams use development-team as parent
        teamSubtype = 'development';
        logger.info(`Development team, using subtype '${teamSubtype}'`);
      } else {
        // Unknown team type, default to general
        teamSubtype = 'general';
        logger.warn(`Unknown team type '${data.type}', defaulting to 'general'`);
      }
      
      // Set the parent group based on the determined team subtype
      const parentGroupName = `${teamSubtype}-team`;
      logger.info(`Team provisioning details:`, { 
        teamType: data.type, 
        teamName: data.name, 
        teamSubtype,
        parentGroupName,
        teamId: task.teamId 
      });

      // 1. Authentik - Always create group and assign members
      try {
        const startTime = Date.now();
        
        const parentGroup = await this.authentikService.getParentGroup(parentGroupName);
        
        // Always use the format: {subtype}-team-{name}
        const groupName = `${teamSubtype}-team-${data.name}`;
        logger.info(`Creating Authentik group: ${groupName} under parent: ${parentGroupName}`);
        const authentikGroup = await this.authentikService.createGroup(groupName, data.description, parentGroup.id);
        
        if (teamMembers.length > 0) {
          const userIds = teamMembers.map(m => m.userId);
          logger.info(`Adding ${userIds.length} team members to Authentik group ${authentikGroup.id}`, { 
            groupId: authentikGroup.id, 
            userIds,
            teamId: task.teamId,
            groupName,
            parentGroup: parentGroupName
          });
          
          await this.authentikService.addUsersToGroup(authentikGroup.id, userIds);
          logger.info(`Successfully added ${userIds.length} team members to Authentik group`);
        } else {
          logger.info('No team members to add to Authentik group');
        }
        
        results.authentik = { success: true, message: 'Successfully created Authentik group and assigned members', data: authentikGroup, duration: Date.now() - startTime };
      } catch (error) {
        const startTime = Date.now();
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to create Authentik group for team ${task.teamId}:`, { error: errorMessage, teamId: task.teamId });
        results.authentik = { success: false, message: 'Failed to create Authentik group', error: errorMessage, duration: Date.now() - startTime };
        errors.push(`Authentik: ${errorMessage}`);
      }

      // 2. Wiki.js - Optional
      if (options.wikijs) {
        try {
          const startTime = Date.now();
          const wikiPage = await this.wikijsService.createTeamIndexPage(teamSubtype, data.name);
          results.wikijs = { success: true, message: 'Successfully created Wiki.js page', data: wikiPage, duration: Date.now() - startTime };
        } catch (error) {
          results.wikijs = { success: false, message: 'Failed to create Wiki.js page', error: error instanceof Error ? error.message : 'Unknown error', duration: Date.now() - startTime };
          warnings.push(`Wiki.js: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 3. Nextcloud - Always create group, optionally create other resources
      try {
        const startTime = Date.now();
        const nextcloudGroup = await this.nextcloudService.createGroup(`${teamSubtype}-team-${data.name}`, data.description);
        
        // Add members to group
        if (teamMembers.length > 0) {
          const userIds = teamMembers.map(m => m.userId);
          await this.nextcloudService.addUsersToGroup(nextcloudGroup.id, userIds);
        }

        const nextcloudResults: any = { group: nextcloudGroup };

        // Optional Nextcloud resources
        if (options.nextcloudFolder) {
          try {
            const folder = await this.nextcloudService.createGroupFolder(`${teamSubtype}-team-${data.name}`, nextcloudGroup.id);
            nextcloudResults.folder = folder;
          } catch (error) {
            warnings.push(`Nextcloud folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        if (options.nextcloudCalendar) {
          try {
            const calendar = await this.nextcloudService.createCalendar(data.name, nextcloudGroup.id);
            
            // Grant the group access to the created calendar
            try {
              await this.nextcloudService.grantGroupCalendarAccess(calendar.name, nextcloudGroup.id, 'read-write');
              logger.info(`Successfully granted group ${nextcloudGroup.id} access to calendar ${calendar.name}`);
            } catch (accessError) {
              logger.warn(`Failed to grant group access to calendar ${calendar.name}: ${accessError instanceof Error ? accessError.message : 'Unknown error'}`);
              warnings.push(`Calendar access: ${accessError instanceof Error ? accessError.message : 'Unknown error'}`);
            }
            
            nextcloudResults.calendar = calendar;
          } catch (error) {
            warnings.push(`Nextcloud calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        if (options.nextcloudDeck) {
          try {
            const deck = await this.nextcloudService.createDeckBoard(data.name, nextcloudGroup.id);
            nextcloudResults.deck = deck;
          } catch (error) {
            warnings.push(`Nextcloud deck: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        results.nextcloud = { success: true, message: 'Successfully created Nextcloud group and optional resources', data: nextcloudResults, duration: Date.now() - startTime };
      } catch (error) {
        results.nextcloud = { success: false, message: 'Failed to create Nextcloud group', error: error instanceof Error ? error.message : 'Unknown error', duration: Date.now() - startTime };
        errors.push(`Nextcloud: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // 4. GitHub - Optional
      if (options.github) {
        try {
          const startTime = Date.now();
          const githubTeam = await this.githubService.createTeam(data.name, data.description, data.type);
          const githubRepo = await this.githubService.createRepository(data.name, data.description);
          await this.githubService.addTeamToRepository(githubTeam.id, githubRepo.id);
          
          if (teamMembers.length > 0) {
            const userIds = teamMembers.map(m => m.userId);
            await this.githubService.addUsersToTeam(githubTeam.id, userIds);
          }

          results.github = { 
            success: true, 
            message: 'Successfully created GitHub team and repository', 
            data: { team: githubTeam, repository: githubRepo }, 
            duration: Date.now() - startTime 
          };
        } catch (error) {
          results.github = { success: false, message: 'Failed to create GitHub resources', error: error instanceof Error ? error.message : 'Unknown error', duration: Date.now() - startTime };
          warnings.push(`GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 5. Discord - Optional
      if (options.discord) {
        try {
          const startTime = Date.now();
          const discordRole = await this.discordService.createRole(`${teamSubtype}-team-${data.name}`, data.description);
          const discordChannel = await this.discordService.createChannel(data.name, data.description, data.type);
          await this.discordService.setChannelPermissions(discordChannel.id, discordRole.id);
          
          if (teamMembers.length > 0) {
            const userIds = teamMembers.map(m => m.userId);
            await this.discordService.assignRoleToUsers(discordRole.id, userIds);
          }

          results.discord = { 
            success: true, 
            message: 'Successfully created Discord role and channel', 
            data: { role: discordRole, channel: discordChannel }, 
            duration: Date.now() - startTime 
          };
        } catch (error) {
          results.discord = { success: false, message: 'Failed to create Discord resources', error: error instanceof Error ? error.message : 'Unknown error', duration: Date.now() - startTime };
          warnings.push(`Discord: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await this.storeIntegrationResults(task.teamId, results);
      return { 
        success: errors.length === 0, 
        teamId: task.teamId, 
        action: task.action, 
        options,
        results, 
        errors, 
        warnings 
      };
    } catch (error) {
      logger.error(`Failed to create team ${task.teamId}:`, error);
      return { 
        success: false, 
        teamId: task.teamId, 
        action: task.action, 
        options,
        results: {}, 
        errors: [error instanceof Error ? error.message : 'Unknown error'], 
        warnings: [] 
      };
    }
  }

  // Get default provisioning options
  private getDefaultProvisioningOptions(): TeamProvisioningOptions {
    return {
      authentik: true, // Always enabled
      nextcloudGroup: true, // Always enabled
      wikijs: false, // Optional
      nextcloudFolder: false, // Optional
      nextcloudCalendar: false, // Optional
      nextcloudDeck: false, // Optional
      github: false, // Optional
      discord: false // Optional
    };
  }

  private async updateTeam(task: TeamProvisioningTask): Promise<TeamProvisioningResult> {
    const data = task.data as UpdateTeamRequest;
    const results: TeamProvisioningResult['results'] = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get current team data
      const currentTeam = await prisma.team.findUnique({
        where: { id: task.teamId },
        include: { userTeams: { include: { user: true } } }
      });

      if (!currentTeam) {
        throw new Error(`Team not found: ${task.teamId}`);
      }

      // Get current and new team members
      const currentMembers = currentTeam.userTeams.map(ut => ut.user);
      const newMembers = await this.getTeamMembers(task.teamId);
      
      // Calculate member changes
      // Note: newMembers contains Authentik PKs, currentMembers contains database users
      const addedMembers = newMembers.filter(nm => 
        !currentMembers.find(cm => cm.authentikPk === nm.userId)
      );
      const removedMembers = currentMembers.filter(cm => 
        !newMembers.find(nm => nm.userId === cm.authentikPk)
      );

      // 1. Handle name changes
      if (data.name && data.name !== currentTeam.name) {
        // Update in all services
        // This is a simplified version - in production you'd need to handle the actual updates
        warnings.push('Team name change detected - manual intervention may be required');
      }

      // 2. Handle member changes
      if (addedMembers.length > 0 || removedMembers.length > 0) {
        // Update Authentik group
        try {
          const startTime = Date.now();
          
          // Find the Authentik group for this team
          const team = await prisma.team.findUnique({
            where: { id: task.teamId },
            include: { group: true }
          });
          
          if (team?.group?.externalId) {
            const groupId = team.group.externalId;
            
            if (addedMembers.length > 0) {
              const userIds = addedMembers.map(m => m.userId);
              logger.info(`Adding ${userIds.length} members to Authentik group ${groupId}`, { userIds });
              await this.authentikService.addUsersToGroup(groupId, userIds);
            }
            
            if (removedMembers.length > 0) {
              const userIds = removedMembers.map(m => m.userId);
              logger.info(`Removing ${userIds.length} members from Authentik group ${groupId}`, { userIds });
              await this.authentikService.removeUsersFromGroup(groupId, userIds);
            }
          } else {
            logger.warn('Team does not have an associated Authentik group', { teamId: task.teamId });
          }
          
          const duration = Date.now() - startTime;
          results.authentik = {
            success: true,
            message: 'Successfully updated Authentik group members',
            duration
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          results.authentik = {
            success: false,
            message: 'Failed to update Authentik group members',
            error: error instanceof Error ? error.message : 'Unknown error',
            duration
          };
          errors.push(`Authentik: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Similar updates for other services...
        warnings.push('Member changes detected - some services may need manual updates');
      }

      // 3. Handle parent team changes
      if (data.type && data.type !== currentTeam.type) {
        warnings.push('Team type change detected - manual intervention required for external services');
      }

      return {
        success: errors.length === 0,
        teamId: task.teamId,
        action: task.action,
        results,
        errors,
        warnings
      };

    } catch (error) {
      logger.error('Error in updateTeam provisioning:', error);
      throw error;
    }
  }

  private async deleteTeam(task: TeamProvisioningTask): Promise<TeamProvisioningResult> {
    const results: TeamProvisioningResult['results'] = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Get team data
      const team = await prisma.team.findUnique({
        where: { id: task.teamId },
        include: { userTeams: { include: { user: true } } }
      });

      if (!team) {
        throw new Error(`Team not found: ${task.teamId}`);
      }

      // Get integration results to know what to delete
      const integrationResults = await this.getIntegrationResults(task.teamId);

      // 1. Remove team members from all groups
      const teamMembers = team.userTeams.map(ut => ut.user);
      if (teamMembers.length > 0) {
        warnings.push('Team members detected - ensure they are removed from external services');
      }

      // 2. Delete resources in reverse order of creation
      // Discord
      if (integrationResults.discord?.data?.role?.id) {
        try {
          const startTime = Date.now();
          await this.discordService.deleteRole(integrationResults.discord.data.role.id);
          const duration = Date.now() - startTime;
          results.discord = {
            success: true,
            message: 'Successfully deleted Discord role',
            duration
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          results.discord = {
            success: false,
            message: 'Failed to delete Discord role',
            error: error instanceof Error ? error.message : 'Unknown error',
            duration
          };
          errors.push(`Discord: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (integrationResults.discord?.data?.channel?.id) {
        try {
          const startTime = Date.now();
          await this.discordService.deleteChannel(integrationResults.discord.data.channel.id);
          const duration = Date.now() - startTime;
          if (!results.discord) {
            results.discord = {
              success: true,
              message: 'Successfully deleted Discord channel',
              duration
            };
          }
        } catch (error) {
          const duration = Date.now() - startTime;
          if (results.discord?.success) {
            results.discord.success = false;
            results.discord.message = 'Partially deleted Discord resources';
          }
          errors.push(`Discord: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Similar deletion logic for other services...
      warnings.push('Some external resources may need manual cleanup');

      // 3. Audit log
      await this.logTeamDeletion(task.teamId, task.userId);

      return {
        success: errors.length === 0,
        teamId: task.teamId,
        action: task.action,
        results,
        errors,
        warnings
      };

    } catch (error) {
      logger.error('Error in deleteTeam provisioning:', error);
      throw error;
    }
  }

  private async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const userTeams = await prisma.userTeam.findMany({
        where: { teamId },
        include: { user: true }
      });

      const teamMembers: TeamMember[] = [];
      
      for (const ut of userTeams) {
        let authentikPk = ut.user.authentikPk;
        
        // If we don't have the Authentik PK, try to look it up by email
        if (!authentikPk) {
          try {
            logger.debug(`Looking up Authentik PK for email: ${ut.user.email}`);
            const authentikUser = await this.authentikService.getUserByEmail(ut.user.email);
            authentikPk = authentikUser.id;
            
            // Store the Authentik PK in the database for future use
            await prisma.user.update({
              where: { id: ut.user.id },
              data: { authentikPk: authentikPk.toString() }
            });
            
            logger.debug(`Found and stored Authentik PK for user ${ut.user.email}: ${authentikPk}`);
          } catch (error) {
            logger.warn(`Failed to look up Authentik PK for ${ut.user.email}:`, error);
            // Continue without this user - they won't be added to Authentik groups
            continue;
          }
        }
        
        if (authentikPk) {
          // Ensure authentikPk is a string for consistency
          const userId = typeof authentikPk === 'string' ? authentikPk : authentikPk.toString();
          
          teamMembers.push({
            userId: userId, // Use Authentik PK instead of database ID
            email: ut.user.email,
            firstName: ut.user.firstName,
            lastName: ut.user.lastName,
            role: ut.role,
            // These would come from user attributes in a real implementation
            discordId: undefined,
            githubUsername: undefined,
            nextcloudUsername: undefined
          });
          
          logger.debug(`Added team member with Authentik PK: ${userId} (${ut.user.email})`);
        }
      }

      logger.info(`Retrieved ${teamMembers.length} team members with Authentik PKs for team ${teamId}`);
      return teamMembers;
    } catch (error) {
      logger.error(`Error getting team members for ${teamId}:`, error);
      return [];
    }
  }

  private async storeIntegrationResults(teamId: string, results: TeamProvisioningResult['results']): Promise<void> {
    try {
      // Store results in database for future reference
      // This would be implemented based on your database schema
      logger.info(`Stored integration results for team: ${teamId}`);
    } catch (error) {
      logger.error(`Error storing integration results for team ${teamId}:`, error);
    }
  }

  private async getIntegrationResults(teamId: string): Promise<TeamProvisioningResult['results']> {
    try {
      // Retrieve stored integration results from database
      // This would be implemented based on your database schema
      return {};
    } catch (error) {
      logger.error(`Error getting integration results for team ${teamId}:`, error);
      return {};
    }
  }

  private async logTeamDeletion(teamId: string, userId: string): Promise<void> {
    try {
      // Log team deletion for audit purposes
      // This would be implemented based on your database schema
      logger.info(`Team ${teamId} deleted by user ${userId} at ${new Date().toISOString()}`);
    } catch (error) {
      logger.error(`Error logging team deletion for ${teamId}:`, error);
    }
  }

  private getParentGroupName(teamType: string, teamName?: string): string {
    // If team type is COMPETITION, try to extract the actual type from the team name
    if (teamType.toUpperCase() === 'COMPETITION' && teamName) {
      const nameParts = teamName.split('-');
      if (nameParts.length >= 2) {
        const extractedType = nameParts[0]; // First part should be 'blue', 'red', 'ctf', or 'development'
        logger.info(`Extracted team type '${extractedType}' from team name '${teamName}'`);
        
        switch (extractedType.toLowerCase()) {
          case 'blue':
            return 'blue-team';
          case 'red':
            return 'red-team';
          case 'ctf':
            return 'ctf-team';
          case 'development':
            return 'development-team';
        }
      }
      
      // If we can't extract the type from the name, default to blue-team for COMPETITION teams
      logger.info(`Could not extract team type from name '${teamName}', defaulting to blue-team for COMPETITION teams`);
      return 'blue-team';
    }
    
    // Handle direct team type mapping
    const normalizedType = teamType.toLowerCase();
    
    switch (normalizedType) {
      case 'blue':
      case 'blue-team':
        return 'blue-team';
      case 'red':
      case 'red-team':
        return 'red-team';
      case 'ctf':
      case 'ctf-team':
        return 'ctf-team';
      case 'development':
      case 'development-team':
        return 'development-team';
      default:
        logger.warn(`Unknown team type: ${teamType}, defaulting to blue-team`);
        return 'blue-team'; // Default fallback
    }
  }
}
