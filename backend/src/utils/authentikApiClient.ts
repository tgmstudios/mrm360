import { HttpClient, HttpClientConfig } from './httpClient';
import { logger } from './logger';

export interface AuthentikApiConfig {
  baseUrl: string;
  token: string;
  timeout?: number;
}

export interface AuthentikGroupResponse {
  pk: number;
  name: string;
  description?: string;
  parent?: string;
  users: number[];
  is_superuser: boolean;
  attributes: Record<string, any>;
}

export interface AuthentikUserResponse {
  pk: number;
  username: string;
  email: string;
  name: string;
  groups: string[];
  is_active: boolean;
  is_superuser: boolean;
  attributes: Record<string, any>;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  parent?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
  parent?: string;
}

export interface AddUsersToGroupRequest {
  users: number[];
}

export class AuthentikApiClient {
  private httpClient: HttpClient;

  constructor(config: AuthentikApiConfig) {
    const httpConfig: HttpClientConfig = {
      baseUrl: config.baseUrl,
      token: config.token,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };

    this.httpClient = new HttpClient(httpConfig);
  }

  // Group Management
  async createGroup(data: CreateGroupRequest): Promise<AuthentikGroupResponse> {
    try {
      logger.info('Creating Authentik group', { name: data.name });
      
      const response = await this.httpClient.post('/api/v3/core/groups/', {
        name: data.name,
        description: data.description || '',
        parent: data.parent || null
      });
      logger.info('Successfully created Authentik group', { name: data.name, id: response.data.pk });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create Authentik group', { name: data.name, error });
      throw new Error(`Failed to create Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateGroup(groupId: string, data: UpdateGroupRequest): Promise<AuthentikGroupResponse> {
    try {
      logger.info('Updating Authentik group', { id: groupId, updates: data });
      
      const response = await this.httpClient.put(`/api/v3/core/groups/${groupId}/`, data);
      logger.info('Successfully updated Authentik group', { id: groupId });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to update Authentik group', { id: groupId, error });
      throw new Error(`Failed to update Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteGroup(groupId: string): Promise<void> {
    try {
      logger.info('Deleting Authentik group', { id: groupId });
      
      await this.httpClient.delete(`/api/v3/core/groups/${groupId}/`);
      logger.info('Successfully deleted Authentik group', { id: groupId });
    } catch (error) {
      logger.error('Failed to delete Authentik group', { id: groupId, error });
      throw new Error(`Failed to delete Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getGroup(groupId: string): Promise<AuthentikGroupResponse> {
    try {
      logger.info('Getting Authentik group', { id: groupId });
      
      const response = await this.httpClient.get(`/api/v3/core/groups/${groupId}/`);
      logger.info('Successfully retrieved Authentik group', { id: groupId });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get Authentik group', { id: groupId, error });
      throw new Error(`Failed to get Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listGroups(params?: { name?: string; parent?: string }): Promise<AuthentikGroupResponse[]> {
    try {
      logger.info('Listing Authentik groups', { params });
      
      const response = await this.httpClient.get('/api/v3/core/groups/', params);
      logger.info('Successfully retrieved Authentik groups', { count: response.data.results?.length || 0 });
      
      return response.data.results || response.data;
    } catch (error) {
      logger.error('Failed to list Authentik groups', { error });
      throw new Error(`Failed to list Authentik groups: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      logger.info('Adding users to Authentik group', { groupId, userIdCount: userIds.length, userIds });
      
      // Validate user IDs
      if (!userIds || userIds.length === 0) {
        logger.warn('No user IDs provided for group', { groupId });
        return;
      }
      
      // Filter out invalid user IDs and convert to integers
      const validUserIds = userIds
        .filter(id => id && typeof id === 'string' && id.trim().length > 0)
        .map(id => {
          // Try to convert to integer, if it fails, try to extract numeric part
          const numericId = parseInt(id, 10);
          if (!isNaN(numericId)) {
            return numericId;
          }
          
          // If it's a hash-like string, try to find a numeric ID in our database
          // For now, we'll skip these and log a warning
          logger.warn('Non-numeric user ID found, skipping', { userId: id, groupId });
          return null;
        })
        .filter(id => id !== null) as number[];
        
      if (validUserIds.length === 0) {
        logger.warn('No valid numeric user IDs found', { groupId, originalUserIds: userIds });
        return;
      }
      
      if (validUserIds.length !== userIds.length) {
        logger.warn('Some user IDs were invalid or non-numeric', { groupId, validCount: validUserIds.length, totalCount: userIds.length, invalidIds: userIds.filter(id => !validUserIds.includes(parseInt(id, 10))) });
      }
      
      // First get the current group to see existing users
      const currentGroup = await this.getGroup(groupId);
      const existingUsers = currentGroup.users || [];
      
      logger.debug('Current group users', { groupId, existingUsers, newUsers: validUserIds });
      
      // Combine existing users with new users, avoiding duplicates
      const allUsers = [...new Set([...existingUsers, ...validUserIds])];
      
      logger.debug('Combined user list', { groupId, allUsers, addedCount: allUsers.length - existingUsers.length });
      
      // Update the group with the new user list
      const updateData = {
        name: currentGroup.name,
        description: currentGroup.description,
        parent: currentGroup.parent,
        users: allUsers
      };
      
      logger.debug('Sending group update', { groupId, updateData });
      
      await this.httpClient.put(`/api/v3/core/groups/${groupId}/`, updateData);
      
      logger.info('Successfully added users to Authentik group', { groupId, userIdCount: validUserIds.length, addedUsers: validUserIds });
    } catch (error) {
      // Enhanced error logging
      let errorDetails = 'Unknown error';
      let statusCode: number | undefined;
      let responseBody: string | undefined;
      
      if (error instanceof Error) {
        errorDetails = error.message;
        
        // Try to extract HTTP status and response body from error message
        const httpMatch = error.message.match(/HTTP (\d+): (.+)/);
        if (httpMatch) {
          statusCode = parseInt(httpMatch[1]);
          responseBody = httpMatch[2];
        }
      }
      
      logger.error('Failed to add users to Authentik group', { 
        groupId, 
        userIdCount: userIds.length,
        userIds,
        error: errorDetails,
        statusCode,
        responseBody,
        fullError: error
      });
      
      throw new Error(`Failed to add users to Authentik group ${groupId}: ${errorDetails}`);
    }
  }

  async removeUsersFromGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      logger.info('Removing users from Authentik group', { groupId, userIdCount: userIds.length, userIds });
      
      // Validate user IDs
      if (!userIds || userIds.length === 0) {
        logger.warn('No user IDs provided for group removal', { groupId });
        return;
      }
      
      // Filter out invalid user IDs and convert to integers
      const validUserIds = userIds
        .filter(id => id && typeof id === 'string' && id.trim().length > 0)
        .map(id => {
          // Try to convert to integer, if it fails, try to extract numeric part
          const numericId = parseInt(id, 10);
          if (!isNaN(numericId)) {
            return numericId;
          }
          
          // If it's a hash-like string, try to find a numeric ID in our database
          // For now, we'll skip these and log a warning
          logger.warn('Non-numeric user ID found, skipping', { userId: id, groupId });
          return null;
        })
        .filter(id => id !== null) as number[];
        
      if (validUserIds.length === 0) {
        logger.warn('No valid numeric user IDs found', { groupId, originalUserIds: userIds });
        return;
      }
      
      if (validUserIds.length !== userIds.length) {
        logger.warn('Some user IDs were invalid or non-numeric', { groupId, validCount: validUserIds.length, totalCount: userIds.length, invalidIds: userIds.filter(id => !validUserIds.includes(parseInt(id, 10))) });
      }
      
      // First get the current group to see existing users
      const currentGroup = await this.getGroup(groupId);
      const existingUsers = currentGroup.users || [];
      
      logger.debug('Current group users', { groupId, existingUsers, usersToRemove: validUserIds });
      
      // Remove the specified users (compare numbers with numbers)
      const remainingUsers = existingUsers.filter(userId => !validUserIds.includes(userId));
      
      logger.debug('Remaining users after removal', { groupId, remainingUsers, removedCount: existingUsers.length - remainingUsers.length });
      
      // Update the group with the remaining users
      const updateData = {
        name: currentGroup.name,
        description: currentGroup.description,
        parent: currentGroup.parent,
        users: remainingUsers
      };
      
      logger.debug('Sending group update', { groupId, updateData });
      
      await this.httpClient.put(`/api/v3/core/groups/${groupId}/`, updateData);
      
      logger.info('Successfully removed users from Authentik group', { groupId, userIdCount: validUserIds.length, removedUsers: validUserIds });
    } catch (error) {
      // Enhanced error logging
      let errorDetails = 'Unknown error';
      let statusCode: number | undefined;
      let responseBody: string | undefined;
      
      if (error instanceof Error) {
        errorDetails = error.message;
        
        // Try to extract HTTP status and response body from error message
        const httpMatch = error.message.match(/HTTP (\d+): (.+)/);
        if (httpMatch) {
          statusCode = parseInt(httpMatch[1]);
          responseBody = httpMatch[2];
        }
      }
      
      logger.error('Failed to remove users from Authentik group', { 
        groupId, 
        userIdCount: userIds.length,
        userIds,
        error: errorDetails,
        statusCode,
        responseBody,
        fullError: error
      });
      
      throw new Error(`Failed to remove users from Authentik group ${groupId}: ${errorDetails}`);
    }
  }

  // User Management
  async getUser(userId: string): Promise<AuthentikUserResponse> {
    try {
      logger.info('Getting Authentik user', { id: userId });
      
      const response = await this.httpClient.get(`/api/v3/core/users/${userId}/`);
      logger.info('Successfully retrieved Authentik user', { id: userId });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get Authentik user', { id: userId, error });
      throw new Error(`Failed to get Authentik user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByUsername(username: string): Promise<AuthentikUserResponse> {
    try {
      logger.info('Getting Authentik user by username', { username });
      
      const response = await this.httpClient.get('/api/v3/core/users/', { username });
      const users = response.data.results || response.data;
      
      if (!users || users.length === 0) {
        throw new Error(`User not found: ${username}`);
      }
      
      logger.info('Successfully retrieved Authentik user by username', { username, id: users[0].pk });
      return users[0];
    } catch (error) {
      logger.error('Failed to get Authentik user by username', { username, error });
      throw new Error(`Failed to get Authentik user by username: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByEmail(email: string): Promise<AuthentikUserResponse> {
    try {
      logger.info('Getting Authentik user by email', { email });
      
      const response = await this.httpClient.get('/api/v3/core/users/', { email });
      const users = response.data.results || response.data;
      
      if (!users || users.length === 0) {
        throw new Error(`User not found: ${email}`);
      }
      
      logger.info('Successfully retrieved Authentik user by email', { email, id: users[0].pk });
      return users[0];
    } catch (error) {
      logger.error('Failed to get Authentik user by email', { email, error });
      throw new Error(`Failed to get Authentik user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listUsers(params?: { username?: string; email?: string; group?: string }): Promise<AuthentikUserResponse[]> {
    try {
      logger.info('Listing Authentik users', { params });
      
      const response = await this.httpClient.get('/api/v3/core/users/', params);
      logger.info('Successfully retrieved Authentik users', { count: response.data.results?.length || 0 });
      
      return response.data.results || response.data;
    } catch (error) {
      logger.error('Failed to list Authentik users', { error });
      throw new Error(`Failed to list Authentik users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility Methods
  async findGroupByName(name: string): Promise<AuthentikGroupResponse | null> {
    try {
      const groups = await this.listGroups({ name });
      return groups.find(group => group.name === name) || null;
    } catch (error) {
      logger.error('Failed to find group by name', { name, error });
      return null;
    }
  }

  async findParentGroup(teamType: string, parentGroupTemplate: string): Promise<AuthentikGroupResponse | null> {
    try {
      const parentGroupName = parentGroupTemplate.replace('{parent_team_type}', teamType);
      return await this.findGroupByName(parentGroupName);
    } catch (error) {
      logger.error('Failed to find parent group', { teamType, parentGroupTemplate, error });
      return null;
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      // Try the groups endpoint instead of version endpoint for health check
      await this.httpClient.get('/api/v3/core/groups/', { limit: '1' });
      return true;
    } catch (error) {
      logger.error('Authentik health check failed:', error);
      return false;
    }
  }
}
