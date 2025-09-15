import { WiretapResource, WiretapProject, WiretapUser } from '@/types';
import { logger } from '@/utils/logger';
import { WiretapApiClient } from '@/utils/wiretapApiClient';
import { WiretapTransformers } from '@/utils/wiretapTransformers';

export class WiretapService {
  private apiClient: WiretapApiClient;
  private projectTemplate: string;

  constructor(config: {
    baseUrl: string;
    token: string;
    projectTemplate: string;
  }) {
    this.apiClient = new WiretapApiClient({
      baseUrl: config.baseUrl,
      token: config.token
    });
    this.projectTemplate = config.projectTemplate;
  }

  async createProject(projectName: string, description?: string, parentProjectId?: string): Promise<WiretapProject> {
    try {
      logger.info(`Creating Wiretap project: ${projectName}`);
      
      const projectData = {
        name: projectName,
        description,
        parent: parentProjectId
      };

      // Validate project data
      const validationErrors = WiretapTransformers.validateProjectData(projectData);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const response = await this.apiClient.createProject(projectData);
      const project = WiretapTransformers.transformProjectResponse(response);
      
      logger.info(`Successfully created Wiretap project: ${projectName} with ID: ${project.id}`);
      return project;
    } catch (error) {
      logger.error(`Error creating Wiretap project ${projectName}:`, error);
      throw new Error(`Failed to create Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateProject(projectId: string, updates: Partial<WiretapProject>): Promise<WiretapProject> {
    try {
      logger.info(`Updating Wiretap project: ${projectId}`);
      
      // First get the current project to ensure we have the name
      const currentProject = await this.getProject(projectId);
      
      // Build update data, always including the name (required by Wiretap)
      const updateData: any = {
        name: currentProject.name // Always include current name
      };
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.parentProjectId !== undefined) updateData.parent = updates.parentProjectId;
      
      const response = await this.apiClient.updateProject(projectId, updateData);
      const project = WiretapTransformers.transformProjectResponse(response);
      
      logger.info(`Successfully updated Wiretap project: ${projectId}`);
      return project;
    } catch (error) {
      logger.error(`Error updating Wiretap project ${projectId}:`, error);
      throw new Error(`Failed to update Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      logger.info(`Deleting Wiretap project: ${projectId}`);
      
      await this.apiClient.deleteProject(projectId);
      
      logger.info(`Successfully deleted Wiretap project: ${projectId}`);
    } catch (error) {
      logger.error(`Error deleting Wiretap project ${projectId}:`, error);
      throw new Error(`Failed to delete Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addUsersToProject(projectId: string, userIds: string[]): Promise<void> {
    try {
      logger.info(`Adding ${userIds.length} users to Wiretap project: ${projectId}`);
      
      if (userIds.length === 0) {
        logger.warn('No user IDs provided for project assignment');
        return;
      }

      await this.apiClient.addUsersToProject(projectId, userIds);
      
      logger.info(`Successfully added users to Wiretap project: ${projectId}`);
    } catch (error) {
      logger.error(`Error adding users to Wiretap project ${projectId}:`, error);
      throw new Error(`Failed to add users to Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addUsersToProjectByEmail(projectId: string, emails: string[]): Promise<void> {
    try {
      logger.info(`Adding ${emails.length} users by email to Wiretap project: ${projectId}`);
      
      if (emails.length === 0) {
        logger.warn('No email addresses provided for project assignment');
        return;
      }

      await this.apiClient.addUsersToProjectByEmail(projectId, emails);
      
      logger.info(`Successfully added users by email to Wiretap project: ${projectId}`);
    } catch (error) {
      logger.error(`Error adding users by email to Wiretap project ${projectId}:`, error);
      throw new Error(`Failed to add users by email to Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeUsersFromProject(projectId: string, userIds: string[]): Promise<void> {
    try {
      logger.info(`Removing ${userIds.length} users from Wiretap project: ${projectId}`);
      
      if (userIds.length === 0) {
        logger.warn('No user IDs provided for project removal');
        return;
      }

      await this.apiClient.removeUsersFromProject(projectId, userIds);
      
      logger.info(`Successfully removed users from Wiretap project: ${projectId}`);
    } catch (error) {
      logger.error(`Error removing users from Wiretap project ${projectId}:`, error);
      throw new Error(`Failed to remove users from Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeUsersFromProjectByEmail(projectId: string, emails: string[]): Promise<void> {
    try {
      logger.info(`Removing ${emails.length} users by email from Wiretap project: ${projectId}`);
      
      if (emails.length === 0) {
        logger.warn('No email addresses provided for project removal');
        return;
      }

      await this.apiClient.removeUsersFromProjectByEmail(projectId, emails);
      
      logger.info(`Successfully removed users by email from Wiretap project: ${projectId}`);
    } catch (error) {
      logger.error(`Error removing users by email from Wiretap project ${projectId}:`, error);
      throw new Error(`Failed to remove users by email from Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getProject(projectId: string): Promise<WiretapProject> {
    try {
      logger.info(`Getting Wiretap project: ${projectId}`);
      
      const response = await this.apiClient.getProject(projectId);
      const project = WiretapTransformers.transformProjectResponse(response);
      
      logger.info(`Successfully retrieved Wiretap project: ${projectId}`);
      return project;
    } catch (error) {
      logger.error(`Error getting Wiretap project ${projectId}:`, error);
      throw new Error(`Failed to get Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUser(userId: string): Promise<WiretapUser> {
    try {
      logger.info(`Getting Wiretap user: ${userId}`);
      
      const response = await this.apiClient.getUser(userId);
      const user = WiretapTransformers.transformUserResponse(response);
      
      logger.info(`Successfully retrieved Wiretap user: ${userId}`);
      return user;
    } catch (error) {
      logger.error(`Error getting Wiretap user ${userId}:`, error);
      throw new Error(`Failed to get Wiretap user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByEmail(email: string): Promise<WiretapUser> {
    try {
      logger.info(`Getting Wiretap user by email: ${email}`);
      
      const response = await this.apiClient.getUserByEmail(email);
      const user = WiretapTransformers.transformUserResponse(response);
      
      logger.info(`Successfully retrieved Wiretap user by email: ${email}`);
      return user;
    } catch (error) {
      logger.error(`Error getting Wiretap user by email ${email}:`, error);
      throw new Error(`Failed to get Wiretap user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByUsername(username: string): Promise<WiretapUser> {
    try {
      logger.info(`Getting Wiretap user by username: ${username}`);
      
      const response = await this.apiClient.getUserByUsername(username);
      const user = WiretapTransformers.transformUserResponse(response);
      
      logger.info(`Successfully retrieved Wiretap user by username: ${username}`);
      return user;
    } catch (error) {
      logger.error(`Error getting Wiretap user by username ${username}:`, error);
      throw new Error(`Failed to get Wiretap user by username: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listWorkshops(): Promise<WiretapProject[]> {
    try {
      logger.info('Listing Wiretap workshops');
      
      const responses = await this.apiClient.listWorkshops();
      const workshops = WiretapTransformers.transformProjectResponses(responses);
      
      logger.info(`Successfully retrieved ${workshops.length} Wiretap workshops`);
      return workshops;
    } catch (error) {
      logger.error('Error listing Wiretap workshops:', error);
      throw new Error(`Failed to list Wiretap workshops: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listProjects(params?: { name?: string; parent?: string }): Promise<WiretapProject[]> {
    try {
      logger.info('Listing Wiretap projects', { params });
      
      // Use workshops endpoint since that's what Wiretap calls them
      const responses = await this.apiClient.listWorkshops();
      const projects = WiretapTransformers.transformProjectResponses(responses);
      
      logger.info(`Successfully retrieved ${projects.length} Wiretap projects`);
      return projects;
    } catch (error) {
      logger.error('Error listing Wiretap projects:', error);
      throw new Error(`Failed to list Wiretap projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listUsers(params?: { username?: string; email?: string; project?: string }): Promise<WiretapUser[]> {
    try {
      logger.info('Listing Wiretap users', { params });
      
      const responses = await this.apiClient.listUsers(params);
      const users = WiretapTransformers.transformUserResponses(responses);
      
      logger.info(`Successfully retrieved ${users.length} Wiretap users`);
      return users;
    } catch (error) {
      logger.error('Error listing Wiretap users:', error);
      throw new Error(`Failed to list Wiretap users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getParentProject(eventType: string): Promise<WiretapProject> {
    try {
      const parentProjectName = this.projectTemplate.replace('{event_type}', eventType);
      logger.info(`Getting parent Wiretap project: ${parentProjectName}`);
      
      const parentProject = await this.apiClient.findParentProject(eventType, this.projectTemplate);
      
      if (!parentProject) {
        throw new Error(`Parent project not found for event type: ${eventType}`);
      }

      const project = WiretapTransformers.transformProjectResponse(parentProject);
      logger.info(`Successfully retrieved parent Wiretap project: ${parentProjectName}`);
      
      return project;
    } catch (error) {
      logger.error(`Error getting parent Wiretap project for ${eventType}:`, error);
      throw new Error(`Failed to get parent Wiretap project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findProjectByName(name: string): Promise<WiretapProject | null> {
    try {
      logger.info(`Finding Wiretap project by name: ${name}`);
      
      const response = await this.apiClient.findProjectByName(name);
      
      if (!response) {
        logger.info(`Project not found with name: ${name}`);
        return null;
      }

      const project = WiretapTransformers.transformProjectResponse(response);
      logger.info(`Successfully found Wiretap project by name: ${name}`);
      
      return project;
    } catch (error) {
      logger.error(`Error finding Wiretap project by name ${name}:`, error);
      return null;
    }
  }

  async createResource(projectId: string, resourceType: string, resourceData: any): Promise<WiretapResource> {
    try {
      logger.info(`Creating Wiretap resource: ${resourceType} in project ${projectId}`);
      
      const response = await this.apiClient.createResource(projectId, resourceType, resourceData);
      const resource = WiretapTransformers.transformResourceResponse(response);
      
      logger.info(`Successfully created Wiretap resource: ${resourceType} with ID: ${resource.id}`);
      return resource;
    } catch (error) {
      logger.error(`Error creating Wiretap resource ${resourceType}:`, error);
      throw new Error(`Failed to create Wiretap resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteResource(resourceId: string): Promise<void> {
    try {
      logger.info(`Deleting Wiretap resource: ${resourceId}`);
      
      await this.apiClient.deleteResource(resourceId);
      
      logger.info(`Successfully deleted Wiretap resource: ${resourceId}`);
    } catch (error) {
      logger.error(`Error deleting Wiretap resource ${resourceId}:`, error);
      throw new Error(`Failed to delete Wiretap resource: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listResources(projectId: string, resourceType?: string): Promise<WiretapResource[]> {
    try {
      logger.info(`Listing Wiretap resources for project: ${projectId}`, { resourceType });
      
      const responses = await this.apiClient.listResources(projectId, resourceType);
      const resources = WiretapTransformers.transformResourceResponses(responses);
      
      logger.info(`Successfully retrieved ${resources.length} Wiretap resources`);
      return resources;
    } catch (error) {
      logger.error('Error listing Wiretap resources:', error);
      throw new Error(`Failed to list Wiretap resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      logger.info('Performing Wiretap health check');
      
      const isHealthy = await this.apiClient.healthCheck();
      
      if (isHealthy) {
        logger.info('Wiretap health check passed');
      } else {
        logger.warn('Wiretap health check failed');
      }
      
      return isHealthy;
    } catch (error) {
      logger.error('Wiretap health check error:', error);
      return false;
    }
  }

  // Utility methods for working with event resources
  async provisionEventResources(eventId: string, eventType: string, resourceSpecs: any[]): Promise<WiretapResource[]> {
    try {
      logger.info(`Provisioning ${resourceSpecs.length} resources for event ${eventId}`);
      
      // Create or get project for the event
      const projectName = `event-${eventId}`;
      let project = await this.findProjectByName(projectName);
      
      if (!project) {
        const parentProject = await this.getParentProject(eventType);
        project = await this.createProject(projectName, `Resources for event ${eventId}`, parentProject.id);
      }
      
      // Create resources
      const resources: WiretapResource[] = [];
      for (const spec of resourceSpecs) {
        const resource = await this.createResource(project.id, spec.type, spec.data);
        resources.push(resource);
      }
      
      logger.info(`Successfully provisioned ${resources.length} resources for event ${eventId}`);
      return resources;
    } catch (error) {
      logger.error(`Error provisioning resources for event ${eventId}:`, error);
      throw new Error(`Failed to provision event resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async cleanupEventResources(eventId: string): Promise<void> {
    try {
      logger.info(`Cleaning up resources for event ${eventId}`);
      
      const projectName = `event-${eventId}`;
      const project = await this.findProjectByName(projectName);
      
      if (project) {
        // List all resources in the project
        const resources = await this.listResources(project.id);
        
        // Delete all resources
        for (const resource of resources) {
          await this.deleteResource(resource.id);
        }
        
        // Delete the project
        await this.deleteProject(project.id);
      }
      
      logger.info(`Successfully cleaned up resources for event ${eventId}`);
    } catch (error) {
      logger.error(`Error cleaning up resources for event ${eventId}:`, error);
      throw new Error(`Failed to cleanup event resources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Add a team member by email to a Wiretap team
   */
  async addTeamMemberByEmail(teamId: string, email: string): Promise<void> {
    try {
      logger.info(`Adding team member by email: ${email} to team ${teamId}`);
      
      await this.apiClient.addTeamMemberByEmail(teamId, email);
      
      logger.info(`Successfully added team member ${email} to Wiretap team ${teamId}`);
    } catch (error) {
      logger.error(`Error adding team member ${email} to Wiretap team ${teamId}:`, error);
      throw new Error(`Failed to add team member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listTeamUsers(teamId: string): Promise<Array<{ id: string; username: string; email: string }>> {
    try {
      logger.info(`Listing Wiretap team users for team ${teamId}`);
      const users = await this.apiClient.listTeamUsers(teamId);
      logger.info(`Retrieved ${users.length} users for Wiretap team ${teamId}`);
      return users;
    } catch (error) {
      logger.error(`Error listing users for Wiretap team ${teamId}:`, error);
      throw new Error(`Failed to list team users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeTeamUser(teamId: string, userId: string): Promise<void> {
    try {
      logger.info(`Removing user ${userId} from Wiretap team ${teamId}`);
      await this.apiClient.removeTeamUser(teamId, userId);
      logger.info(`Successfully removed user ${userId} from Wiretap team ${teamId}`);
    } catch (error) {
      logger.error(`Error removing user ${userId} from Wiretap team ${teamId}:`, error);
      throw new Error(`Failed to remove team user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async listTeamPendingAssignments(teamId: string): Promise<Array<{ id: string; email: string; team_id: string; created_at: string }>> {
    try {
      logger.info(`Listing pending assignments for Wiretap team ${teamId}`);
      const pending = await this.apiClient.listTeamPendingAssignments(teamId);
      logger.info(`Retrieved ${pending.length} pending assignment(s) for Wiretap team ${teamId}`);
      return pending;
    } catch (error) {
      logger.error(`Error listing pending assignments for Wiretap team ${teamId}:`, error);
      throw new Error(`Failed to list pending assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removePendingTeamAssignment(email: string, teamId: string): Promise<void> {
    try {
      logger.info(`Removing pending assignment for ${email} from Wiretap team ${teamId}`);
      await this.apiClient.removePendingTeamAssignment(email, teamId);
      logger.info(`Successfully removed pending assignment for ${email} from Wiretap team ${teamId}`);
    } catch (error) {
      logger.error(`Error removing pending assignment for ${email} from Wiretap team ${teamId}:`, error);
      throw new Error(`Failed to remove pending assignment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
