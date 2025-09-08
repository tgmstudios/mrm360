import { WiretapProject, WiretapUser, WiretapResource } from '@/types';
import { WiretapProjectResponse, WiretapUserResponse, WiretapResourceResponse } from './wiretapApiClient';

export class WiretapTransformers {
  /**
   * Transform Wiretap API project response to internal WiretapProject type
   */
  static transformProjectResponse(response: WiretapProjectResponse): WiretapProject {
    return {
      id: response.id,
      name: response.name,
      description: response.description,
      parentProjectId: response.parent,
      users: response.users || [],
      resources: response.resources || [],
      teams: response.teams || [],
      status: response.status,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at)
    };
  }

  /**
   * Transform Wiretap API user response to internal WiretapUser type
   */
  static transformUserResponse(response: WiretapUserResponse): WiretapUser {
    return {
      id: response.id,
      username: response.username,
      email: response.email,
      projects: response.projects || [],
      roles: response.roles || [],
      isActive: response.is_active,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at)
    };
  }

  /**
   * Transform Wiretap API resource response to internal WiretapResource type
   */
  static transformResourceResponse(response: WiretapResourceResponse): WiretapResource {
    return {
      id: response.id,
      name: response.name,
      type: response.type,
      projectId: response.project_id,
      status: response.status,
      config: response.config || {},
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at)
    };
  }

  /**
   * Transform internal WiretapProject to API request format
   */
  static transformProjectToRequest(project: Partial<WiretapProject>): {
    name?: string;
    description?: string;
    parent?: string;
  } {
    return {
      name: project.name,
      description: project.description,
      parent: project.parentProjectId
    };
  }

  /**
   * Transform multiple project responses to internal types
   */
  static transformProjectResponses(responses: WiretapProjectResponse[]): WiretapProject[] {
    return responses.map(response => this.transformProjectResponse(response));
  }

  /**
   * Transform multiple user responses to internal types
   */
  static transformUserResponses(responses: WiretapUserResponse[]): WiretapUser[] {
    return responses.map(response => this.transformUserResponse(response));
  }

  /**
   * Transform multiple resource responses to internal types
   */
  static transformResourceResponses(responses: WiretapResourceResponse[]): WiretapResource[] {
    return responses.map(response => this.transformResourceResponse(response));
  }

  /**
   * Extract user IDs from a list of users
   */
  static extractUserIds(users: WiretapUser[]): string[] {
    return users.map(user => user.id);
  }

  /**
   * Extract project IDs from a list of projects
   */
  static extractProjectIds(projects: WiretapProject[]): string[] {
    return projects.map(project => project.id);
  }

  /**
   * Extract resource IDs from a list of resources
   */
  static extractResourceIds(resources: WiretapResource[]): string[] {
    return resources.map(resource => resource.id);
  }

  /**
   * Filter projects by parent project ID
   */
  static filterProjectsByParent(projects: WiretapProject[], parentProjectId: string): WiretapProject[] {
    return projects.filter(project => project.parentProjectId === parentProjectId);
  }

  /**
   * Filter users by project membership
   */
  static filterUsersByProject(users: WiretapUser[], projectId: string): WiretapUser[] {
    return users.filter(user => user.projects.includes(projectId));
  }

  /**
   * Filter resources by project
   */
  static filterResourcesByProject(resources: WiretapResource[], projectId: string): WiretapResource[] {
    return resources.filter(resource => resource.projectId === projectId);
  }

  /**
   * Filter resources by type
   */
  static filterResourcesByType(resources: WiretapResource[], resourceType: string): WiretapResource[] {
    return resources.filter(resource => resource.type === resourceType);
  }

  /**
   * Check if a user is a member of a specific project
   */
  static isUserInProject(user: WiretapUser, projectId: string): boolean {
    return user.projects.includes(projectId);
  }

  /**
   * Check if a project has any users
   */
  static hasUsers(project: WiretapProject): boolean {
    return project.users.length > 0;
  }

  /**
   * Check if a project has any resources
   */
  static hasResources(project: WiretapProject): boolean {
    return project.resources.length > 0;
  }

  /**
   * Get the count of users in a project
   */
  static getUserCount(project: WiretapProject): number {
    return project.users.length;
  }

  /**
   * Get the count of resources in a project
   */
  static getResourceCount(project: WiretapProject): number {
    return project.resources.length;
  }

  /**
   * Validate project data before sending to API
   */
  static validateProjectData(project: Partial<WiretapProject>): string[] {
    const errors: string[] = [];

    if (!project.name || project.name.trim().length === 0) {
      errors.push('Project name is required');
    }

    if (project.name && project.name.length > 255) {
      errors.push('Project name must be less than 255 characters');
    }

    if (project.description && project.description.length > 1000) {
      errors.push('Project description must be less than 1000 characters');
    }

    return errors;
  }

  /**
   * Validate user data before sending to API
   */
  static validateUserData(user: Partial<WiretapUser>): string[] {
    const errors: string[] = [];

    if (!user.username || user.username.trim().length === 0) {
      errors.push('Username is required');
    }

    if (!user.email || user.email.trim().length === 0) {
      errors.push('Email is required');
    }

    if (user.email && !this.isValidEmail(user.email)) {
      errors.push('Invalid email format');
    }

    if (user.username && user.username.length > 150) {
      errors.push('Username must be less than 150 characters');
    }

    return errors;
  }

  /**
   * Validate resource data before sending to API
   */
  static validateResourceData(resource: Partial<WiretapResource>): string[] {
    const errors: string[] = [];

    if (!resource.name || resource.name.trim().length === 0) {
      errors.push('Resource name is required');
    }

    if (!resource.type || resource.type.trim().length === 0) {
      errors.push('Resource type is required');
    }

    if (!resource.projectId || resource.projectId.trim().length === 0) {
      errors.push('Project ID is required');
    }

    if (resource.name && resource.name.length > 255) {
      errors.push('Resource name must be less than 255 characters');
    }

    if (resource.type && resource.type.length > 100) {
      errors.push('Resource type must be less than 100 characters');
    }

    return errors;
  }

  /**
   * Simple email validation
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate resource name from type and timestamp
   */
  static generateResourceName(resourceType: string, prefix?: string): string {
    const timestamp = Date.now();
    const baseName = prefix ? `${prefix}-${resourceType}` : resourceType;
    return `${baseName}-${timestamp}`;
  }

  /**
   * Generate project name from event ID
   */
  static generateEventProjectName(eventId: string): string {
    return `event-${eventId}`;
  }

  /**
   * Generate project name from team ID
   */
  static generateTeamProjectName(teamId: string): string {
    return `team-${teamId}`;
  }

  /**
   * Check if a resource is in a terminal state
   */
  static isResourceTerminal(resource: WiretapResource): boolean {
    return ['active', 'error'].includes(resource.status);
  }

  /**
   * Check if a resource is being created
   */
  static isResourceCreating(resource: WiretapResource): boolean {
    return resource.status === 'creating';
  }

  /**
   * Check if a resource is being deleted
   */
  static isResourceDeleting(resource: WiretapResource): boolean {
    return resource.status === 'deleting';
  }

  /**
   * Get resources by status
   */
  static getResourcesByStatus(resources: WiretapResource[], status: string): WiretapResource[] {
    return resources.filter(resource => resource.status === status);
  }

  /**
   * Get active resources
   */
  static getActiveResources(resources: WiretapResource[]): WiretapResource[] {
    return this.getResourcesByStatus(resources, 'active');
  }

  /**
   * Get resources with errors
   */
  static getErrorResources(resources: WiretapResource[]): WiretapResource[] {
    return this.getResourcesByStatus(resources, 'error');
  }

  /**
   * Get resources being created
   */
  static getCreatingResources(resources: WiretapResource[]): WiretapResource[] {
    return this.getResourcesByStatus(resources, 'creating');
  }

  /**
   * Get resources being deleted
   */
  static getDeletingResources(resources: WiretapResource[]): WiretapResource[] {
    return this.getResourcesByStatus(resources, 'deleting');
  }
}


