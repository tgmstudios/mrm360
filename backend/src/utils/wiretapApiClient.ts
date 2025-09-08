import { HttpClient, HttpClientConfig } from './httpClient';
import { logger } from './logger';

export interface WiretapApiConfig {
  baseUrl: string;
  token: string;
  timeout?: number;
}

export interface WiretapProjectResponse {
  id: string;
  name: string;
  description?: string;
  parent?: string;
  users: string[];
  resources: string[];
  teams?: Array<{
    id: string;
    name: string;
    description?: string;
    workshop_id: string;
    team_number: number;
    enabled: number;
    created_at: string;
    updated_at: string;
  }>;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface WiretapUserResponse {
  id: string;
  username: string;
  email: string;
  projects: string[];
  roles: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WiretapResourceResponse {
  id: string;
  name: string;
  type: string;
  project_id: string;
  status: 'creating' | 'active' | 'deleting' | 'error';
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  parent?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  parent?: string;
}

export interface AddUsersToProjectRequest {
  users: string[];
}

export interface CreateResourceRequest {
  name: string;
  type: string;
  config: Record<string, any>;
}

export class WiretapApiClient {
  private httpClient: HttpClient;

  constructor(config: WiretapApiConfig) {
    const httpConfig: HttpClientConfig = {
      baseUrl: config.baseUrl,
      token: config.token,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Wiretap API expects token directly, not Bearer format
        'Authorization': config.token
      }
    };

    this.httpClient = new HttpClient(httpConfig);
  }

  // Project Management
  async createProject(data: CreateProjectRequest): Promise<WiretapProjectResponse> {
    try {
      logger.info('Creating Wiretap project', { name: data.name });
      
      const response = await this.httpClient.post('/api/workshops', {
        name: data.name,
        description: data.description || '',
        provider_id: data.parent || null
      });
      logger.info('Successfully created Wiretap project', { name: data.name, id: response.data.id });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create Wiretap project', { name: data.name, error });
      throw new Error(`Failed to create Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateProject(projectId: string, data: UpdateProjectRequest): Promise<WiretapProjectResponse> {
    try {
      logger.info('Updating Wiretap project', { id: projectId, updates: data });
      
      const response = await this.httpClient.put(`/api/workshops/${projectId}`, data);
      logger.info('Successfully updated Wiretap project', { id: projectId });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to update Wiretap project', { id: projectId, error });
      throw new Error(`Failed to update Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      logger.info('Deleting Wiretap project', { id: projectId });
      
      await this.httpClient.delete(`/api/workshops/${projectId}`);
      logger.info('Successfully deleted Wiretap project', { id: projectId });
    } catch (error) {
      logger.error('Failed to delete Wiretap project', { id: projectId, error });
      throw new Error(`Failed to delete Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProject(projectId: string): Promise<WiretapProjectResponse> {
    try {
      logger.info('Getting Wiretap project', { id: projectId });
      
      const response = await this.httpClient.get(`/api/workshops/${projectId}`);
      logger.info('Successfully retrieved Wiretap project', { id: projectId });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get Wiretap project', { id: projectId, error });
      throw new Error(`Failed to get Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listWorkshops(): Promise<WiretapProjectResponse[]> {
    try {
      logger.info('Listing Wiretap workshops');
      
      const response = await this.httpClient.get('/api/workshops');
      logger.info('Successfully retrieved Wiretap workshops', { count: response.data?.length || 0 });
      
      return response.data || [];
    } catch (error) {
      logger.error('Failed to list Wiretap workshops', { error });
      throw new Error(`Failed to list Wiretap workshops: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listProjects(params?: { name?: string; parent?: string }): Promise<WiretapProjectResponse[]> {
    try {
      logger.info('Listing Wiretap projects', { params });
      
      // Use the workshops endpoint since that's what Wiretap calls them
      const response = await this.httpClient.get('/api/workshops');
      logger.info('Successfully retrieved Wiretap projects', { count: response.data?.length || 0 });
      
      return response.data || [];
    } catch (error) {
      logger.error('Failed to list Wiretap projects', { error });
      throw new Error(`Failed to list Wiretap projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addUsersToProject(projectId: string, userIds: string[]): Promise<void> {
    try {
      logger.info('Adding users to Wiretap project', { projectId, userIdCount: userIds.length, userIds });
      
      // Validate user IDs
      if (!userIds || userIds.length === 0) {
        logger.warn('No user IDs provided for project', { projectId });
        return;
      }
      
      // Filter out invalid user IDs
      const validUserIds = userIds
        .filter(id => id && typeof id === 'string' && id.trim().length > 0);
        
      if (validUserIds.length === 0) {
        logger.warn('No valid user IDs found', { projectId, originalUserIds: userIds });
        return;
      }
      
      if (validUserIds.length !== userIds.length) {
        logger.warn('Some user IDs were invalid', { projectId, validCount: validUserIds.length, totalCount: userIds.length });
      }
      
      // First get the current project to see existing users
      const currentProject = await this.getProject(projectId);
      const existingUsers = currentProject.users || [];
      
      logger.debug('Current project users', { projectId, existingUsers, newUsers: validUserIds });
      
      // Combine existing users with new users, avoiding duplicates
      const allUsers = [...new Set([...existingUsers, ...validUserIds])];
      
      logger.debug('Combined user list', { projectId, allUsers, addedCount: allUsers.length - existingUsers.length });
      
      // Update the project with the new user list
      const updateData = {
        name: currentProject.name,
        description: currentProject.description,
        parent: currentProject.parent,
        users: allUsers
      };
      
      logger.debug('Sending project update', { projectId, updateData });
      
      await this.httpClient.put(`/api/workshops/${projectId}`, updateData);
      
      logger.info('Successfully added users to Wiretap project', { projectId, userIdCount: validUserIds.length, addedUsers: validUserIds });
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
      
      logger.error('Failed to add users to Wiretap project', { 
        projectId, 
        userIdCount: userIds.length,
        userIds,
        error: errorDetails,
        statusCode,
        responseBody,
        fullError: error
      });
      
      throw new Error(`Failed to add users to Wiretap project ${projectId}: ${errorDetails}`);
    }
  }

  async addUsersToProjectByEmail(projectId: string, emails: string[]): Promise<void> {
    try {
      logger.info('Adding users by email to Wiretap project', { projectId, emailCount: emails.length, emails });
      
      // Validate email addresses
      if (!emails || emails.length === 0) {
        logger.warn('No email addresses provided for project', { projectId });
        return;
      }
      
      // Filter out invalid email addresses
      const validEmails = emails
        .filter(email => email && typeof email === 'string' && email.trim().length > 0 && email.includes('@'));
        
      if (validEmails.length === 0) {
        logger.warn('No valid email addresses found', { projectId, originalEmails: emails });
        return;
      }
      
      if (validEmails.length !== emails.length) {
        logger.warn('Some email addresses were invalid', { projectId, validCount: validEmails.length, totalCount: emails.length });
      }
      
      // First get the current project to see existing users
      const currentProject = await this.getProject(projectId);
      const existingUsers = currentProject.users || [];
      
      logger.debug('Current project users', { projectId, existingUsers, newEmails: validEmails });
      
      // Combine existing users with new emails, avoiding duplicates
      const allUsers = [...new Set([...existingUsers, ...validEmails])];
      
      logger.debug('Combined user list', { projectId, allUsers, addedCount: allUsers.length - existingUsers.length });
      
      // Update the project with the new user list (Wiretap supports optimistic users)
      const updateData = {
        name: currentProject.name,
        description: currentProject.description,
        parent: currentProject.parent,
        users: allUsers
      };
      
      logger.debug('Sending project update with email addresses', { projectId, updateData });
      
      await this.httpClient.put(`/api/workshops/${projectId}`, updateData);
      
      logger.info('Successfully added users by email to Wiretap project', { projectId, emailCount: validEmails.length, addedEmails: validEmails });
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
      
      logger.error('Failed to add users by email to Wiretap project', { 
        projectId, 
        emailCount: emails.length,
        emails,
        error: errorDetails,
        statusCode,
        responseBody,
        fullError: error
      });
      
      throw new Error(`Failed to add users by email to Wiretap project ${projectId}: ${errorDetails}`);
    }
  }

  async removeUsersFromProject(projectId: string, userIds: string[]): Promise<void> {
    try {
      logger.info('Removing users from Wiretap project', { projectId, userIdCount: userIds.length, userIds });
      
      // Validate user IDs
      if (!userIds || userIds.length === 0) {
        logger.warn('No user IDs provided for project removal', { projectId });
        return;
      }
      
      // Filter out invalid user IDs
      const validUserIds = userIds
        .filter(id => id && typeof id === 'string' && id.trim().length > 0);
        
      if (validUserIds.length === 0) {
        logger.warn('No valid user IDs found', { projectId, originalUserIds: userIds });
        return;
      }
      
      if (validUserIds.length !== userIds.length) {
        logger.warn('Some user IDs were invalid', { projectId, validCount: validUserIds.length, totalCount: userIds.length });
      }
      
      // First get the current project to see existing users
      const currentProject = await this.getProject(projectId);
      const existingUsers = currentProject.users || [];
      
      logger.debug('Current project users', { projectId, existingUsers, usersToRemove: validUserIds });
      
      // Remove the specified users
      const remainingUsers = existingUsers.filter(userId => !validUserIds.includes(userId));
      
      logger.debug('Remaining users after removal', { projectId, remainingUsers, removedCount: existingUsers.length - remainingUsers.length });
      
      // Update the project with the remaining users
      const updateData = {
        name: currentProject.name,
        description: currentProject.description,
        parent: currentProject.parent,
        users: remainingUsers
      };
      
      logger.debug('Sending project update', { projectId, updateData });
      
      await this.httpClient.put(`/api/workshops/${projectId}`, updateData);
      
      logger.info('Successfully removed users from Wiretap project', { projectId, userIdCount: validUserIds.length, removedUsers: validUserIds });
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
      
      logger.error('Failed to remove users from Wiretap project', { 
        projectId, 
        userIdCount: userIds.length,
        userIds,
        error: errorDetails,
        statusCode,
        responseBody,
        fullError: error
      });
      
      throw new Error(`Failed to remove users from Wiretap project ${projectId}: ${errorDetails}`);
    }
  }

  async removeUsersFromProjectByEmail(projectId: string, emails: string[]): Promise<void> {
    try {
      logger.info('Removing users by email from Wiretap project', { projectId, emailCount: emails.length, emails });
      
      // Validate email addresses
      if (!emails || emails.length === 0) {
        logger.warn('No email addresses provided for project removal', { projectId });
        return;
      }
      
      // Filter out invalid email addresses
      const validEmails = emails
        .filter(email => email && typeof email === 'string' && email.trim().length > 0 && email.includes('@'));
        
      if (validEmails.length === 0) {
        logger.warn('No valid email addresses found for removal', { projectId, originalEmails: emails });
        return;
      }
      
      // First get the current project to see existing users
      const currentProject = await this.getProject(projectId);
      const existingUsers = currentProject.users || [];
      
      logger.debug('Current project users before removal', { projectId, existingUsers, emailsToRemove: validEmails });
      
      // Remove the specified emails from the project
      const remainingUsers = existingUsers.filter(user => !validEmails.includes(user));
      
      logger.debug('Users after removal', { projectId, remainingUsers, removedCount: existingUsers.length - remainingUsers.length });
      
      // Update the project with the remaining users
      const updateData = {
        name: currentProject.name,
        description: currentProject.description,
        parent: currentProject.parent,
        users: remainingUsers
      };
      
      logger.debug('Sending project update for email-based user removal', { projectId, updateData });
      
      await this.httpClient.put(`/api/workshops/${projectId}`, updateData);
      
      logger.info('Successfully removed users by email from Wiretap project', { projectId, emailCount: validEmails.length, removedEmails: validEmails });
    } catch (error) {
      logger.error('Failed to remove users by email from Wiretap project', { 
        projectId, 
        emailCount: emails.length,
        emails,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw new Error(`Failed to remove users by email from Wiretap project ${projectId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // User Management
  async getUser(userId: string): Promise<WiretapUserResponse> {
    try {
      logger.info('Getting Wiretap user', { id: userId });
      
      const response = await this.httpClient.get(`/api/users/${userId}`);
      logger.info('Successfully retrieved Wiretap user', { id: userId });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get Wiretap user', { id: userId, error });
      throw new Error(`Failed to get Wiretap user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByUsername(username: string): Promise<WiretapUserResponse> {
    try {
      logger.info('Getting Wiretap user by username', { username });
      
      const response = await this.httpClient.get('/api/users', { username });
      const users = response.data.results || response.data;
      
      if (!users || users.length === 0) {
        throw new Error(`User not found: ${username}`);
      }
      
      logger.info('Successfully retrieved Wiretap user by username', { username, id: users[0].id });
      return users[0];
    } catch (error) {
      logger.error('Failed to get Wiretap user by username', { username, error });
      throw new Error(`Failed to get Wiretap user by username: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByEmail(email: string): Promise<WiretapUserResponse> {
    try {
      logger.info('Getting Wiretap user by email', { email });
      
      const response = await this.httpClient.get('/api/users', { email });
      const users = response.data.results || response.data;
      
      if (!users || users.length === 0) {
        throw new Error(`User not found: ${email}`);
      }
      
      logger.info('Successfully retrieved Wiretap user by email', { email, id: users[0].id });
      return users[0];
    } catch (error) {
      logger.error('Failed to get Wiretap user by email', { email, error });
      throw new Error(`Failed to get Wiretap user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listUsers(params?: { username?: string; email?: string; project?: string }): Promise<WiretapUserResponse[]> {
    try {
      logger.info('Listing Wiretap users', { params });
      
      const response = await this.httpClient.get('/api/users', params);
      logger.info('Successfully retrieved Wiretap users', { count: response.data.results?.length || 0 });
      
      return response.data.results || response.data;
    } catch (error) {
      logger.error('Failed to list Wiretap users', { error });
      throw new Error(`Failed to list Wiretap users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Resource Management
  async createResource(projectId: string, resourceType: string, resourceData: any): Promise<WiretapResourceResponse> {
    try {
      logger.info('Creating Wiretap resource', { projectId, resourceType });
      
      const response = await this.httpClient.post('/api/instances', {
        name: resourceData.name || `${resourceType}-${Date.now()}`,
        workshop_id: projectId,
        openstack_id: resourceData.openstack_id || `${resourceType}-${Date.now()}`
      });
      logger.info('Successfully created Wiretap resource', { projectId, resourceType, id: response.data.id });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to create Wiretap resource', { projectId, resourceType, error });
      throw new Error(`Failed to create Wiretap resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteResource(resourceId: string): Promise<void> {
    try {
      logger.info('Deleting Wiretap resource', { id: resourceId });
      
      await this.httpClient.delete(`/api/instances/${resourceId}`);
      logger.info('Successfully deleted Wiretap resource', { id: resourceId });
    } catch (error) {
      logger.error('Failed to delete Wiretap resource', { id: resourceId, error });
      throw new Error(`Failed to delete Wiretap resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listResources(projectId: string, resourceType?: string): Promise<WiretapResourceResponse[]> {
    try {
      logger.info('Listing Wiretap resources', { projectId, resourceType });
      
      const params = resourceType ? { type: resourceType } : {};
      const response = await this.httpClient.get('/api/instances', params);
      logger.info('Successfully retrieved Wiretap resources', { projectId, count: response.data.results?.length || 0 });
      
      return response.data.results || response.data;
    } catch (error) {
      logger.error('Failed to list Wiretap resources', { projectId, error });
      throw new Error(`Failed to list Wiretap resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility Methods
  async findProjectByName(name: string): Promise<WiretapProjectResponse | null> {
    try {
      const projects = await this.listProjects({ name });
      return projects.find(project => project.name === name) || null;
    } catch (error) {
      logger.error('Failed to find project by name', { name, error });
      return null;
    }
  }

  async findParentProject(eventType: string, parentProjectTemplate: string): Promise<WiretapProjectResponse | null> {
    try {
      const parentProjectName = parentProjectTemplate.replace('{event_type}', eventType);
      return await this.findProjectByName(parentProjectName);
    } catch (error) {
      logger.error('Failed to find parent project', { eventType, parentProjectTemplate, error });
      return null;
    }
  }

  // Team Management
  async addTeamMemberByEmail(teamId: string, email: string): Promise<void> {
    try {
      logger.info(`Adding user ${email} to Wiretap team ${teamId}`);
      
      const response = await this.httpClient.post(`/api/teams/${teamId}/users/email`, {
        email
      });
      
      logger.info(`Successfully added user ${email} to Wiretap team ${teamId}`);
    } catch (error) {
      logger.error(`Failed to add user ${email} to Wiretap team ${teamId}`, { error });
      throw new Error(`Failed to add user to Wiretap team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      // Try the workshops endpoint for health check
      await this.httpClient.get('/api/workshops');
      return true;
    } catch (error) {
      logger.error('Wiretap health check failed:', error);
      return false;
    }
  }
}
