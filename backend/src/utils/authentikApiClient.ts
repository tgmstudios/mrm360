import { HttpClient, HttpClientConfig } from './httpClient';
import { logger } from './logger';

export interface AuthentikApiConfig {
  baseUrl: string;
  token: string;
  timeout?: number;
}

export interface AuthentikGroupResponse {
  pk: string;
  name: string;
  description?: string;
  parent?: string;
  users: string[];
  is_superuser: boolean;
  attributes: Record<string, any>;
}

export interface AuthentikUserResponse {
  pk: string;
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
  users: string[];
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
      logger.info('Adding users to Authentik group', { groupId, userIdCount: userIds.length });
      
      // First get the current group to see existing users
      const currentGroup = await this.getGroup(groupId);
      const existingUsers = currentGroup.users || [];
      
      // Combine existing users with new users, avoiding duplicates
      const allUsers = [...new Set([...existingUsers, ...userIds])];
      
      // Update the group with the new user list
      const updateData = {
        name: currentGroup.name,
        description: currentGroup.description,
        parent: currentGroup.parent,
        users: allUsers
      };
      
      await this.httpClient.put(`/api/v3/core/groups/${groupId}/`, updateData);
      
      logger.info('Successfully added users to Authentik group', { groupId, userIdCount: userIds.length });
    } catch (error) {
      logger.error('Failed to add users to Authentik group', { groupId, error });
      throw new Error(`Failed to add users to Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeUsersFromGroup(groupId: string, userIds: string[]): Promise<void> {
    try {
      logger.info('Removing users from Authentik group', { groupId, userIdCount: userIds.length });
      
      // First get the current group to see existing users
      const currentGroup = await this.getGroup(groupId);
      const existingUsers = currentGroup.users || [];
      
      // Remove the specified users
      const remainingUsers = existingUsers.filter(userId => !userIds.includes(userId));
      
      // Update the group with the remaining users
      const updateData = {
        name: currentGroup.name,
        description: currentGroup.description,
        parent: currentGroup.parent,
        users: remainingUsers
      };
      
      await this.httpClient.put(`/api/v3/core/groups/${groupId}/`, updateData);
      
      logger.info('Successfully removed users from Authentik group', { groupId, userIdCount: userIds.length });
    } catch (error) {
      logger.error('Failed to remove users from Authentik group', { groupId, error });
      throw new Error(`Failed to remove users from Authentik group: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
