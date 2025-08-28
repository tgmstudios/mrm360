import { HttpClient, HttpResponse } from '@/utils/httpClient';
import { logger } from '@/utils/logger';

// GitHub API Response Types
export interface GitHubApiTeam {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  privacy: 'secret' | 'closed';
  members_count: number;
  repos_count: number;
  organization: {
    login: string;
    id: number;
  };
  parent?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface GitHubApiUser {
  id: number;
  login: string;
  type: 'User' | 'Organization';
  site_admin: boolean;
}

export interface GitHubApiRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  fork: boolean;
  archived: boolean;
  disabled: boolean;
  default_branch: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  organization: {
    login: string;
    id: number;
  };
}

export interface GitHubApiTeamMember {
  id: number;
  login: string;
  type: 'User' | 'Bot';
  site_admin: boolean;
}

export interface GitHubApiTeamPermission {
  name: string;
  permission: 'pull' | 'triage' | 'push' | 'maintain' | 'admin';
}

// GitHub API Request Types
export interface CreateTeamRequest {
  name: string;
  description?: string;
  privacy?: 'secret' | 'closed';
  parent_team_id?: number;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  privacy?: 'secret' | 'closed';
  parent_team_id?: number;
}

export interface CreateRepositoryRequest {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
}

export interface UpdateRepositoryRequest {
  name?: string;
  description?: string;
  private?: boolean;
  archived?: boolean;
  disabled?: boolean;
}

export interface AddTeamToRepositoryRequest {
  permission: 'pull' | 'triage' | 'push' | 'maintain' | 'admin';
}

export class GitHubApiClient {
  private httpClient: HttpClient;
  private organization: string;

  constructor(config: { baseUrl: string; token: string; organization: string }) {
    this.httpClient = new HttpClient({
      baseUrl: config.baseUrl,
      token: config.token,
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CCSO-GitHub-Service'
      }
    });
    this.organization = config.organization;
  }

  // Team Management
  async createTeam(data: CreateTeamRequest): Promise<GitHubApiTeam> {
    try {
      const response = await this.httpClient.post<GitHubApiTeam>(
        `/orgs/${this.organization}/teams`,
        data
      );
      logger.debug(`Created GitHub team: ${data.name}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create GitHub team ${data.name}:`, error);
      throw error;
    }
  }

  async updateTeam(teamId: number, data: UpdateTeamRequest): Promise<GitHubApiTeam> {
    try {
      const response = await this.httpClient.patch<GitHubApiTeam>(
        `/teams/${teamId}`,
        data
      );
      logger.debug(`Updated GitHub team: ${teamId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update GitHub team ${teamId}:`, error);
      throw error;
    }
  }

  async deleteTeam(teamId: number): Promise<void> {
    try {
      await this.httpClient.delete(`/teams/${teamId}`);
      logger.debug(`Deleted GitHub team: ${teamId}`);
    } catch (error) {
      logger.error(`Failed to delete GitHub team ${teamId}:`, error);
      throw error;
    }
  }

  async getTeam(teamId: number): Promise<GitHubApiTeam> {
    try {
      const response = await this.httpClient.get<GitHubApiTeam>(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get GitHub team ${teamId}:`, error);
      throw error;
    }
  }

  async getTeamBySlug(slug: string): Promise<GitHubApiTeam> {
    try {
      const response = await this.httpClient.get<GitHubApiTeam>(`/orgs/${this.organization}/teams/${slug}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get GitHub team by slug ${slug}:`, error);
      throw error;
    }
  }

  async listTeams(): Promise<GitHubApiTeam[]> {
    try {
      const response = await this.httpClient.get<GitHubApiTeam[]>(`/orgs/${this.organization}/teams`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to list GitHub teams:`, error);
      throw error;
    }
  }

  async teamExists(slug: string): Promise<boolean> {
    try {
      await this.getTeamBySlug(slug);
      return true;
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  // Team Member Management
  async addUsersToTeam(teamId: number, usernames: string[]): Promise<void> {
    try {
      const promises = usernames.map(username =>
        this.httpClient.put(`/teams/${teamId}/memberships/${username}`)
      );
      await Promise.all(promises);
      logger.debug(`Added ${usernames.length} users to GitHub team: ${teamId}`);
    } catch (error) {
      logger.error(`Failed to add users to GitHub team ${teamId}:`, error);
      throw error;
    }
  }

  async removeUsersFromTeam(teamId: number, usernames: string[]): Promise<void> {
    try {
      const promises = usernames.map(username =>
        this.httpClient.delete(`/teams/${teamId}/memberships/${username}`)
      );
      await Promise.all(promises);
      logger.debug(`Removed ${usernames.length} users from GitHub team: ${teamId}`);
    } catch (error) {
      logger.error(`Failed to remove users from GitHub team ${teamId}:`, error);
      throw error;
    }
  }

  async getTeamMembers(teamId: number): Promise<GitHubApiTeamMember[]> {
    try {
      const response = await this.httpClient.get<GitHubApiTeamMember[]>(`/teams/${teamId}/members`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get GitHub team members ${teamId}:`, error);
      throw error;
    }
  }

  // Repository Management
  async createRepository(data: CreateRepositoryRequest): Promise<GitHubApiRepository> {
    try {
      const response = await this.httpClient.post<GitHubApiRepository>(
        `/orgs/${this.organization}/repos`,
        data
      );
      logger.debug(`Created GitHub repository: ${data.name}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to create GitHub repository ${data.name}:`, error);
      throw error;
    }
  }

  async updateRepository(repositoryName: string, data: UpdateRepositoryRequest): Promise<GitHubApiRepository> {
    try {
      const response = await this.httpClient.patch<GitHubApiRepository>(
        `/repos/${this.organization}/${repositoryName}`,
        data
      );
      logger.debug(`Updated GitHub repository: ${repositoryName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to update GitHub repository ${repositoryName}:`, error);
      throw error;
    }
  }

  async deleteRepository(repositoryName: string): Promise<void> {
    try {
      await this.httpClient.delete(`/repos/${this.organization}/${repositoryName}`);
      logger.debug(`Deleted GitHub repository: ${repositoryName}`);
    } catch (error) {
      logger.error(`Failed to delete GitHub repository ${repositoryName}:`, error);
      throw error;
    }
  }

  async getRepository(repositoryName: string): Promise<GitHubApiRepository> {
    try {
      const response = await this.httpClient.get<GitHubApiRepository>(`/repos/${this.organization}/${repositoryName}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get GitHub repository ${repositoryName}:`, error);
      throw error;
    }
  }

  async repositoryExists(repositoryName: string): Promise<boolean> {
    try {
      await this.getRepository(repositoryName);
      return true;
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  async listRepositories(): Promise<GitHubApiRepository[]> {
    try {
      const response = await this.httpClient.get<GitHubApiRepository[]>(`/orgs/${this.organization}/repos`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to list GitHub repositories:`, error);
      throw error;
    }
  }

  // Team-Repository Management
  async addTeamToRepository(repositoryName: string, teamId: number, permissions: string = 'push'): Promise<void> {
    try {
      const data: AddTeamToRepositoryRequest = {
        permission: permissions as any
      };
      
      await this.httpClient.put(
        `/repos/${this.organization}/${repositoryName}/teams/${teamId}`,
        data
      );
      logger.debug(`Added team ${teamId} to repository ${repositoryName} with ${permissions} permissions`);
    } catch (error) {
      logger.error(`Failed to add team ${teamId} to repository ${repositoryName}:`, error);
      throw error;
    }
  }

  async removeTeamFromRepository(repositoryName: string, teamId: number): Promise<void> {
    try {
      await this.httpClient.delete(`/repos/${this.organization}/${repositoryName}/teams/${teamId}`);
      logger.debug(`Removed team ${teamId} from repository ${repositoryName}`);
    } catch (error) {
      logger.error(`Failed to remove team ${teamId} from repository ${repositoryName}:`, error);
      throw error;
    }
  }

  async getRepositoryTeams(repositoryName: string): Promise<GitHubApiTeamPermission[]> {
    try {
      const response = await this.httpClient.get<GitHubApiTeamPermission[]>(`/repos/${this.organization}/${repositoryName}/teams`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get repository teams for ${repositoryName}:`, error);
      throw error;
    }
  }

  // User Management
  async getUser(username: string): Promise<GitHubApiUser> {
    try {
      const response = await this.httpClient.get<GitHubApiUser>(`/users/${username}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to get GitHub user ${username}:`, error);
      throw error;
    }
  }

  async userExists(username: string): Promise<boolean> {
    try {
      await this.getUser(username);
      return true;
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  // Health Check
  async checkHealth(): Promise<boolean> {
    try {
      await this.httpClient.get('/rate_limit');
      return true;
    } catch (error) {
      logger.error('GitHub API health check failed:', error);
      return false;
    }
  }
}
