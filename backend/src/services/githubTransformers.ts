import { GitHubTeam, GitHubRepository } from '@/types';
import { 
  GitHubApiTeam, 
  GitHubApiRepository, 
  GitHubApiTeamMember,
  CreateTeamRequest as ApiCreateTeamRequest,
  UpdateTeamRequest as ApiUpdateTeamRequest,
  CreateRepositoryRequest as ApiCreateRepositoryRequest,
  UpdateRepositoryRequest as ApiUpdateRepositoryRequest
} from './githubApiClient';

export class GitHubTransformers {
  /**
   * Transform GitHub API team response to internal GitHubTeam type
   */
  static transformTeamResponse(apiTeam: GitHubApiTeam): GitHubTeam {
    return {
      id: apiTeam.id.toString(),
      name: apiTeam.name,
      slug: apiTeam.slug,
      description: apiTeam.description || undefined,
      members: [] // Will be populated separately if needed
    };
  }

  /**
   * Transform GitHub API repository response to internal GitHubRepository type
   */
  static transformRepositoryResponse(apiRepo: GitHubApiRepository): GitHubRepository {
    return {
      name: apiRepo.name,
      description: apiRepo.description || undefined,
      private: apiRepo.private,
      teamId: '' // Will be populated separately if needed
    };
  }

  /**
   * Transform internal GitHubTeam to API create request
   */
  static transformToCreateTeamRequest(team: Partial<GitHubTeam>): ApiCreateTeamRequest {
    return {
      name: team.name!,
      description: team.description,
      privacy: 'secret', // Default to secret for security
      parent_team_id: undefined // Will be set by service if needed
    };
  }

  /**
   * Transform internal GitHubTeam to API update request
   */
  static transformToUpdateTeamRequest(team: Partial<GitHubTeam>): ApiUpdateTeamRequest {
    return {
      name: team.name,
      description: team.description,
      privacy: 'secret', // Default to secret for security
      parent_team_id: undefined // Will be set by service if needed
    };
  }

  /**
   * Transform internal GitHubRepository to API create request
   */
  static transformToCreateRepositoryRequest(repo: Partial<GitHubRepository>): ApiCreateRepositoryRequest {
    return {
      name: repo.name!,
      description: repo.description,
      private: repo.private !== undefined ? repo.private : true,
      auto_init: true, // Initialize with README
      gitignore_template: 'Node', // Default to Node.js gitignore
      license_template: 'mit' // Default to MIT license
    };
  }

  /**
   * Transform internal GitHubRepository to API update request
   */
  static transformToUpdateRepositoryRequest(repo: Partial<GitHubRepository>): ApiUpdateRepositoryRequest {
    return {
      name: repo.name,
      description: repo.description,
      private: repo.private,
      archived: false, // Default to not archived
      disabled: false // Default to not disabled
    };
  }

  /**
   * Extract usernames from team members
   */
  static extractUsernamesFromMembers(members: GitHubApiTeamMember[]): string[] {
    return members.map(member => member.login);
  }

  /**
   * Validate team data before API calls
   */
  static validateTeamData(team: Partial<GitHubTeam>): string[] {
    const errors: string[] = [];

    if (!team.name || team.name.trim().length === 0) {
      errors.push('Team name is required');
    }

    if (team.name && team.name.length > 100) {
      errors.push('Team name must be 100 characters or less');
    }

    if (team.description && team.description.length > 255) {
      errors.push('Team description must be 255 characters or less');
    }

    return errors;
  }

  /**
   * Validate repository data before API calls
   */
  static validateRepositoryData(repo: Partial<GitHubRepository>): string[] {
    const errors: string[] = [];

    if (!repo.name || repo.name.trim().length === 0) {
      errors.push('Repository name is required');
    }

    if (repo.name && !/^[a-zA-Z0-9._-]+$/.test(repo.name)) {
      errors.push('Repository name can only contain letters, numbers, dots, underscores, and hyphens');
    }

    if (repo.name && repo.name.length > 100) {
      errors.push('Repository name must be 100 characters or less');
    }

    if (repo.description && repo.description.length > 1000) {
      errors.push('Repository description must be 1000 characters or less');
    }

    return errors;
  }

  /**
   * Sanitize team name for slug generation
   */
  static sanitizeTeamName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Sanitize repository name
   */
  static sanitizeRepositoryName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '') // Remove special characters except allowed ones
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .replace(/\.{2,}/g, '.'); // Replace multiple consecutive dots with single dot
  }

  /**
   * Check if a team name is valid
   */
  static isValidTeamName(name: string): boolean {
    return name.length > 0 && 
           name.length <= 100 && 
           /^[a-zA-Z0-9\s-]+$/.test(name);
  }

  /**
   * Check if a repository name is valid
   */
  static isValidRepositoryName(name: string): boolean {
    return name.length > 0 && 
           name.length <= 100 && 
           /^[a-zA-Z0-9._-]+$/.test(name) &&
           !name.startsWith('.') &&
           !name.endsWith('.') &&
           !name.includes('..');
  }

  /**
   * Normalize permission string to GitHub API format
   */
  static normalizePermission(permission: string): 'pull' | 'triage' | 'push' | 'maintain' | 'admin' {
    const normalized = permission.toLowerCase();
    
    switch (normalized) {
      case 'read':
      case 'pull':
        return 'pull';
      case 'triage':
        return 'triage';
      case 'write':
      case 'push':
        return 'push';
      case 'maintain':
        return 'maintain';
      case 'admin':
        return 'admin';
      default:
        return 'push'; // Default to push permissions
    }
  }

  /**
   * Get human-readable permission description
   */
  static getPermissionDescription(permission: string): string {
    switch (permission) {
      case 'pull':
        return 'Read access to code and issues';
      case 'triage':
        return 'Read access and ability to manage issues and pull requests';
      case 'push':
        return 'Read and write access to code';
      case 'maintain':
        return 'Read, write, and administrative access to repository';
      case 'admin':
        return 'Full access to repository including settings';
      default:
        return 'Unknown permission level';
    }
  }
}
