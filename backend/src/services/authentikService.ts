import { AuthentikGroup, AuthentikUser, TeamMember } from '@/types';
import { logger } from '@/utils/logger';
import { AuthentikApiClient } from '@/utils/authentikApiClient';
import { AuthentikTransformers } from '@/utils/authentikTransformers';

export class AuthentikService {
  private apiClient: AuthentikApiClient;
  private parentGroupTemplate: string;

  constructor(config: {
    baseUrl: string;
    token: string;
    parentGroupTemplate: string;
  }) {
    this.apiClient = new AuthentikApiClient({
      baseUrl: config.baseUrl,
      token: config.token
    });
    this.parentGroupTemplate = config.parentGroupTemplate;
  }

  async createGroup(groupName: string, description?: string, parentGroupId?: string): Promise<AuthentikGroup> {
    try {
      logger.info(`Creating Authentik group: ${groupName}`);
      
      const groupData = {
        name: groupName,
        description,
        parent: parentGroupId
      };

      // Validate group data
      const validationErrors = AuthentikTransformers.validateGroupData(groupData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const response = await this.apiClient.createGroup(groupData);
      const group = AuthentikTransformers.transformGroupResponse(response);
      
      logger.info(`Successfully created Authentik group: ${groupName} with ID: ${group.id}`);
      return group;
    } catch (error) {
      logger.error(`Error creating Authentik group ${groupName}:`, error);
      throw new Error(`Failed to create Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateGroup(groupId: string, updates: Partial<AuthentikGroup>): Promise<AuthentikGroup> {
    try {
      logger.info(`Updating Authentik group: ${groupId}`);
      
      // First get the current group to ensure we have the name
      const currentGroup = await this.getGroup(groupId);
      
      // Build update data, always including the name (required by Authentik)
      const updateData: any = {
        name: currentGroup.name // Always include current name
      };
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.parentGroupId !== undefined) updateData.parent = updates.parentGroupId;
      
      const response = await this.apiClient.updateGroup(groupId, updateData);
      const group = AuthentikTransformers.transformGroupResponse(response);
      
      logger.info(`Successfully updated Authentik group: ${groupId}`);
      return group;
    } catch (error) {
      logger.error(`Error updating Authentik group ${groupId}:`, error);
      throw new Error(`Failed to update Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      logger.info(`Deleting Authentik group: ${groupId}`);
      
      await this.apiClient.deleteGroup(groupId);
      
      logger.info(`Successfully deleted Authentik group: ${groupId}`);
    } catch (error) {
      logger.error(`Error deleting Authentik group ${groupId}:`, error);
      throw new Error(`Failed to delete Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      logger.info(`Adding ${userIds.length} users to Authentik group: ${groupId}`);
      
      if (userIds.length === 0) {
        logger.warn('No user IDs provided for group assignment');
        return;
      }

      await this.apiClient.addUsersToGroup(groupId, userIds);
      
      logger.info(`Successfully added users to Authentik group: ${groupId}`);
    } catch (error) {
      logger.error(`Error adding users to Authentik group ${groupId}:`, error);
      throw new Error(`Failed to add users to Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeUsersFromGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      logger.info(`Removing ${userIds.length} users from Authentik group: ${groupId}`);
      
      if (userIds.length === 0) {
        logger.warn('No user IDs provided for group removal');
        return;
      }

      await this.apiClient.removeUsersFromGroup(groupId, userIds);
      
      logger.info(`Successfully removed users from Authentik group: ${groupId}`);
    } catch (error) {
      logger.error(`Error removing users from Authentik group ${groupId}:`, error);
      throw new Error(`Failed to remove users from Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getGroup(groupId: string): Promise<AuthentikGroup> {
    try {
      logger.info(`Getting Authentik group: ${groupId}`);
      
      const response = await this.apiClient.getGroup(groupId);
      const group = AuthentikTransformers.transformGroupResponse(response);
      
      logger.info(`Successfully retrieved Authentik group: ${groupId}`);
      return group;
    } catch (error) {
      logger.error(`Error getting Authentik group ${groupId}:`, error);
      throw new Error(`Failed to get Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(userId: string): Promise<AuthentikUser> {
    try {
      logger.info(`Getting Authentik user: ${userId}`);
      
      const response = await this.apiClient.getUser(userId);
      const user = AuthentikTransformers.transformUserResponse(response);
      
      logger.info(`Successfully retrieved Authentik user: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Error getting Authentik user ${userId}:`, error);
      throw new Error(`Failed to get Authentik user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByEmail(email: string): Promise<AuthentikUser> {
    try {
      logger.info(`Getting Authentik user by email: ${email}`);
      
      const response = await this.apiClient.getUserByEmail(email);
      const user = AuthentikTransformers.transformUserResponse(response);
      
      logger.info(`Successfully retrieved Authentik user by email: ${email}`);
      return user;
    } catch (error) {
      logger.error(`Error getting Authentik user by email ${email}:`, error);
      throw new Error(`Failed to get Authentik user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByUsername(username: string): Promise<AuthentikUser> {
    try {
      logger.info(`Getting Authentik user by username: ${username}`);
      
      const response = await this.apiClient.getUserByUsername(username);
      const user = AuthentikTransformers.transformUserResponse(response);
      
      logger.info(`Successfully retrieved Authentik user by username: ${username}`);
      return user;
    } catch (error) {
      logger.error(`Error getting Authentik user by username ${username}:`, error);
      throw new Error(`Failed to get Authentik user by username: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listGroups(params?: { name?: string; parent?: string }): Promise<AuthentikGroup[]> {
    try {
      logger.info('Listing Authentik groups', { params });
      
      const responses = await this.apiClient.listGroups(params);
      const groups = AuthentikTransformers.transformGroupResponses(responses);
      
      logger.info(`Successfully retrieved ${groups.length} Authentik groups`);
      return groups;
    } catch (error) {
      logger.error('Error listing Authentik groups:', error);
      throw new Error(`Failed to list Authentik groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listUsers(params?: { username?: string; email?: string; group?: string }): Promise<AuthentikUser[]> {
    try {
      logger.info('Listing Authentik users', { params });
      
      const responses = await this.apiClient.listUsers(params);
      const users = AuthentikTransformers.transformUserResponses(responses);
      
      logger.info(`Successfully retrieved ${users.length} Authentik users`);
      return users;
    } catch (error) {
      logger.error('Error listing Authentik users:', error);
      throw new Error(`Failed to list Authentik users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getParentGroup(teamType: string): Promise<AuthentikGroup> {
    try {
      const parentGroupName = this.parentGroupTemplate.replace('{parent_team_type}', teamType);
      logger.info(`Getting parent Authentik group: ${parentGroupName}`);
      
      const parentGroup = await this.apiClient.findParentGroup(teamType, this.parentGroupTemplate);
      
      if (!parentGroup) {
        throw new Error(`Parent group not found for team type: ${teamType}`);
      }

      const group = AuthentikTransformers.transformGroupResponse(parentGroup);
      logger.info(`Successfully retrieved parent Authentik group: ${parentGroupName}`);
      
      return group;
    } catch (error) {
      logger.error(`Error getting parent Authentik group for ${teamType}:`, error);
      throw new Error(`Failed to get parent Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findGroupByName(name: string): Promise<AuthentikGroup | null> {
    try {
      logger.info(`Finding Authentik group by name: ${name}`);
      
      const response = await this.apiClient.findGroupByName(name);
      
      if (!response) {
        logger.info(`Group not found with name: ${name}`);
        return null;
      }

      const group = AuthentikTransformers.transformGroupResponse(response);
      logger.info(`Successfully found Authentik group by name: ${name}`);
      
      return group;
    } catch (error) {
      logger.error(`Error finding Authentik group by name ${name}:`, error);
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      logger.info('Performing Authentik health check');
      
      const isHealthy = await this.apiClient.healthCheck();
      
      if (isHealthy) {
        logger.info('Authentik health check passed');
      } else {
        logger.warn('Authentik health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('Authentik health check error:', error);
      return false;
    }
  }

  // Utility methods for working with team members
  async addTeamMembersToGroup(groupId: string, teamMembers: TeamMember[]): Promise<void> {
    try {
      logger.info(`Adding ${teamMembers.length} team members to Authentik group: ${groupId}`);
      
      // Extract user IDs from team members (assuming they have Authentik user IDs)
      const userIds = teamMembers
        .map(member => member.userId)
        .filter(id => id); // Filter out undefined/null IDs
      
      if (userIds.length === 0) {
        logger.warn('No valid user IDs found in team members');
        return;
      }

      await this.addUsersToGroup(groupId, userIds);
      
      logger.info(`Successfully added team members to Authentik group: ${groupId}`);
    } catch (error) {
      logger.error(`Error adding team members to Authentik group ${groupId}:`, error);
      throw new Error(`Failed to add team members to Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeTeamMembersFromGroup(groupId: string, teamMembers: TeamMember[]): Promise<void> {
    try {
      logger.info(`Removing ${teamMembers.length} team members from Authentik group: ${groupId}`);
      
      // Extract user IDs from team members
      const userIds = teamMembers
        .map(member => member.userId)
        .filter(id => id);
      
      if (userIds.length === 0) {
        logger.warn('No valid user IDs found in team members');
        return;
      }

      await this.removeUsersFromGroup(groupId, userIds);
      
      logger.info(`Successfully removed team members from Authentik group: ${groupId}`);
    } catch (error) {
      logger.error(`Error removing team members from Authentik group ${groupId}:`, error);
      throw new Error(`Failed to remove team members from Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
