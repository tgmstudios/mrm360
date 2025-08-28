import { GitHubTeam, GitHubRepository } from '@/types';
import { logger } from '@/utils/logger';
import { GitHubApiClient } from './githubApiClient';
import { GitHubTransformers } from './githubTransformers';
import { GitHubConfig } from './githubConfigValidator';

export class GitHubService {
  private apiClient: GitHubApiClient;
  private organization: string;
  private parentTeamId?: string;

  constructor(config: GitHubConfig) {
    this.apiClient = new GitHubApiClient(config);
    this.organization = config.organization;
    this.parentTeamId = config.parentTeamId;
  }

  async createTeam(name: string, description?: string): Promise<GitHubTeam> {
    try {
      logger.info(`Creating GitHub team: ${name}`);
      
      // Validate input data
      const teamData = { name, description };
      const validationErrors = GitHubTransformers.validateTeamData(teamData);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid team data: ${validationErrors.join(', ')}`);
      }

      // Create team via API
      const apiTeam = await this.apiClient.createTeam({
        name,
        description,
        privacy: 'secret',
        parent_team_id: this.parentTeamId ? parseInt(this.parentTeamId) : undefined
      });

      // Transform API response to internal type
      const team = GitHubTransformers.transformTeamResponse(apiTeam);
      
      logger.info(`Successfully created GitHub team: ${name} with ID: ${team.id}`);
      return team;
    } catch (error) {
      logger.error(`Error creating GitHub team ${name}:`, error);
      throw new Error(`Failed to create GitHub team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateTeam(teamId: string, updates: Partial<GitHubTeam>): Promise<GitHubTeam> {
    try {
      logger.info(`Updating GitHub team: ${teamId}`);
      
      // Validate input data
      const validationErrors = GitHubTransformers.validateTeamData(updates);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid team data: ${validationErrors.join(', ')}`);
      }

      // Update team via API
      const apiTeam = await this.apiClient.updateTeam(parseInt(teamId), {
        name: updates.name,
        description: updates.description,
        privacy: 'secret',
        parent_team_id: this.parentTeamId ? parseInt(this.parentTeamId) : undefined
      });

      // Transform API response to internal type
      const team = GitHubTransformers.transformTeamResponse(apiTeam);
      
      logger.info(`Successfully updated GitHub team: ${teamId}`);
      return team;
    } catch (error) {
      logger.error(`Error updating GitHub team ${teamId}:`, error);
      throw new Error(`Failed to update GitHub team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteTeam(teamId: string): Promise<void> {
    try {
      logger.info(`Deleting GitHub team: ${teamId}`);
      
      // Delete team via API
      await this.apiClient.deleteTeam(parseInt(teamId));
      
      logger.info(`Successfully deleted GitHub team: ${teamId}`);
    } catch (error) {
      logger.error(`Error deleting GitHub team ${teamId}:`, error);
      throw new Error(`Failed to delete GitHub team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createRepository(name: string, description?: string, isPrivate: boolean = true): Promise<GitHubRepository> {
    try {
      logger.info(`Creating GitHub repository: ${name}`);
      
      // Validate input data
      const repoData = { name, description, private: isPrivate };
      const validationErrors = GitHubTransformers.validateRepositoryData(repoData);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid repository data: ${validationErrors.join(', ')}`);
      }

      // Create repository via API
      const apiRepo = await this.apiClient.createRepository({
        name,
        description,
        private: isPrivate,
        auto_init: true,
        gitignore_template: 'Node',
        license_template: 'mit'
      });

      // Transform API response to internal type
      const repo = GitHubTransformers.transformRepositoryResponse(apiRepo);
      
      logger.info(`Successfully created GitHub repository: ${name}`);
      return repo;
    } catch (error) {
      logger.error(`Error creating GitHub repository ${name}:`, error);
      throw new Error(`Failed to create GitHub repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateRepository(name: string, updates: Partial<GitHubRepository>): Promise<GitHubRepository> {
    try {
      logger.info(`Updating GitHub repository: ${name}`);
      
      // Validate input data
      const validationErrors = GitHubTransformers.validateRepositoryData(updates);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid repository data: ${validationErrors.join(', ')}`);
      }

      // Update repository via API
      const apiRepo = await this.apiClient.updateRepository(name, {
        name: updates.name,
        description: updates.description,
        private: updates.private,
        archived: false,
        disabled: false
      });

      // Transform API response to internal type
      const repo = GitHubTransformers.transformRepositoryResponse(apiRepo);
      
      logger.info(`Successfully updated GitHub repository: ${name}`);
      return repo;
    } catch (error) {
      logger.error(`Error updating GitHub repository ${name}:`, error);
      throw new Error(`Failed to update GitHub repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteRepository(name: string): Promise<void> {
    try {
      logger.info(`Deleting GitHub repository: ${name}`);
      
      // Delete repository via API
      await this.apiClient.deleteRepository(name);
      
      logger.info(`Successfully deleted GitHub repository: ${name}`);
    } catch (error) {
      logger.error(`Error deleting GitHub repository ${name}:`, error);
      throw new Error(`Failed to delete GitHub repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addTeamToRepository(repositoryName: string, teamId: string, permissions: string = 'push'): Promise<void> {
    try {
      logger.info(`Adding team ${teamId} to repository ${repositoryName} with ${permissions} permissions`);
      
      // Normalize permissions
      const normalizedPermissions = GitHubTransformers.normalizePermission(permissions);
      
      // Add team to repository via API
      await this.apiClient.addTeamToRepository(repositoryName, parseInt(teamId), normalizedPermissions);
      
      logger.info(`Successfully added team ${teamId} to repository ${repositoryName} with ${normalizedPermissions} permissions`);
    } catch (error) {
      logger.error(`Error adding team ${teamId} to repository ${repositoryName}:`, error);
      throw new Error(`Failed to add team to repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async addUsersToTeam(teamId: string, usernames: string[]): Promise<void> {
    try {
      logger.info(`Adding ${usernames.length} users to GitHub team: ${teamId}`);
      
      // Validate usernames
      if (!usernames || usernames.length === 0) {
        throw new Error('No usernames provided');
      }

      // Add users to team via API
      await this.apiClient.addUsersToTeam(parseInt(teamId), usernames);
      
      logger.info(`Successfully added ${usernames.length} users to GitHub team: ${teamId}`);
    } catch (error) {
      logger.error(`Error adding users to GitHub team ${teamId}:`, error);
      throw new Error(`Failed to add users to GitHub team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async removeUsersFromTeam(teamId: string, usernames: string[]): Promise<void> {
    try {
      logger.info(`Removing ${usernames.length} users from GitHub team: ${teamId}`);
      
      // Validate usernames
      if (!usernames || usernames.length === 0) {
        throw new Error('No usernames provided');
      }

      // Remove users from team via API
      await this.apiClient.removeUsersFromTeam(parseInt(teamId), usernames);
      
      logger.info(`Successfully removed ${usernames.length} users from GitHub team: ${teamId}`);
    } catch (error) {
      logger.error(`Error removing users from GitHub team ${teamId}:`, error);
      throw new Error(`Failed to remove users from GitHub team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTeam(teamId: string): Promise<GitHubTeam> {
    try {
      logger.info(`Getting GitHub team: ${teamId}`);
      
      // Get team via API
      const apiTeam = await this.apiClient.getTeam(parseInt(teamId));
      
      // Transform API response to internal type
      const team = GitHubTransformers.transformTeamResponse(apiTeam);
      
      // Get team members if needed
      try {
        const members = await this.apiClient.getTeamMembers(parseInt(teamId));
        team.members = GitHubTransformers.extractUsernamesFromMembers(members);
      } catch (memberError) {
        logger.warn(`Could not fetch team members for team ${teamId}:`, memberError);
        team.members = [];
      }

      return team;
    } catch (error) {
      logger.error(`Error getting GitHub team ${teamId}:`, error);
      throw new Error(`Failed to get GitHub team: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRepository(name: string): Promise<GitHubRepository> {
    try {
      logger.info(`Getting GitHub repository: ${name}`);
      
      // Get repository via API
      const apiRepo = await this.apiClient.getRepository(name);
      
      // Transform API response to internal type
      const repo = GitHubTransformers.transformRepositoryResponse(apiRepo);
      
      // Get repository teams to find teamId
      try {
        const teams = await this.apiClient.getRepositoryTeams(name);
        if (teams.length > 0) {
          // Use the first team's ID (you might want to implement logic to find the right team)
          repo.teamId = teams[0].name; // Using name as identifier for now
        }
      } catch (teamError) {
        logger.warn(`Could not fetch repository teams for ${name}:`, teamError);
        repo.teamId = '';
      }

      return repo;
    } catch (error) {
      logger.error(`Error getting GitHub repository ${name}:`, error);
      throw new Error(`Failed to get GitHub repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async repositoryExists(name: string): Promise<boolean> {
    try {
      logger.info(`Checking if GitHub repository exists: ${name}`);
      
      // Check repository existence via API
      return await this.apiClient.repositoryExists(name);
    } catch (error) {
      logger.error(`Error checking if GitHub repository exists ${name}:`, error);
      throw new Error(`Failed to check GitHub repository existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async teamExists(name: string): Promise<boolean> {
    try {
      logger.info(`Checking if GitHub team exists: ${name}`);
      
      // Check team existence via API using slug
      const slug = GitHubTransformers.sanitizeTeamName(name);
      return await this.apiClient.teamExists(slug);
    } catch (error) {
      logger.error(`Error checking if GitHub team exists ${name}:`, error);
      throw new Error(`Failed to check GitHub team existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check service health by testing API connectivity
   */
  async checkHealth(): Promise<boolean> {
    try {
      logger.info('Checking GitHub service health');
      return await this.apiClient.checkHealth();
    } catch (error) {
      logger.error('GitHub service health check failed:', error);
      return false;
    }
  }

  /**
   * Get team by slug instead of ID
   */
  async getTeamBySlug(slug: string): Promise<GitHubTeam> {
    try {
      logger.info(`Getting GitHub team by slug: ${slug}`);
      
      // Get team via API
      const apiTeam = await this.apiClient.getTeamBySlug(slug);
      
      // Transform API response to internal type
      const team = GitHubTransformers.transformTeamResponse(apiTeam);
      
      // Get team members if needed
      try {
        const members = await this.apiClient.getTeamMembers(apiTeam.id);
        team.members = GitHubTransformers.extractUsernamesFromMembers(members);
      } catch (memberError) {
        logger.warn(`Could not fetch team members for team ${slug}:`, memberError);
        team.members = [];
      }

      return team;
    } catch (error) {
      logger.error(`Error getting GitHub team by slug ${slug}:`, error);
      throw new Error(`Failed to get GitHub team by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all teams in the organization
   */
  async listTeams(): Promise<GitHubTeam[]> {
    try {
      logger.info('Listing GitHub teams');
      
      // Get teams via API
      const apiTeams = await this.apiClient.listTeams();
      
      // Transform API responses to internal types
      const teams = apiTeams.map(apiTeam => GitHubTransformers.transformTeamResponse(apiTeam));
      
      logger.info(`Successfully listed ${teams.length} GitHub teams`);
      return teams;
    } catch (error) {
      logger.error('Error listing GitHub teams:', error);
      throw new Error(`Failed to list GitHub teams: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all repositories in the organization
   */
  async listRepositories(): Promise<GitHubRepository[]> {
    try {
      logger.info('Listing GitHub repositories');
      
      // Get repositories via API
      const apiRepos = await this.apiClient.listRepositories();
      
      // Transform API responses to internal types
      const repos = apiRepos.map(apiRepo => GitHubTransformers.transformRepositoryResponse(apiRepo));
      
      logger.info(`Successfully listed ${repos.length} GitHub repositories`);
      return repos;
    } catch (error) {
      logger.error('Error listing GitHub repositories:', error);
      throw new Error(`Failed to list GitHub repositories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove team from repository
   */
  async removeTeamFromRepository(repositoryName: string, teamId: string): Promise<void> {
    try {
      logger.info(`Removing team ${teamId} from repository ${repositoryName}`);
      
      // Remove team from repository via API
      await this.apiClient.removeTeamFromRepository(repositoryName, parseInt(teamId));
      
      logger.info(`Successfully removed team ${teamId} from repository ${repositoryName}`);
    } catch (error) {
      logger.error(`Error removing team ${teamId} from repository ${repositoryName}:`, error);
      throw new Error(`Failed to remove team from repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user information
   */
  async getUser(username: string): Promise<any> {
    try {
      logger.info(`Getting GitHub user: ${username}`);
      
      // Get user via API
      const user = await this.apiClient.getUser(username);
      
      logger.info(`Successfully got GitHub user: ${username}`);
      return user;
    } catch (error) {
      logger.error(`Error getting GitHub user ${username}:`, error);
      throw new Error(`Failed to get GitHub user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user exists
   */
  async userExists(username: string): Promise<boolean> {
    try {
      logger.info(`Checking if GitHub user exists: ${username}`);
      
      // Check user existence via API
      return await this.apiClient.userExists(username);
    } catch (error) {
      logger.error(`Error checking if GitHub user exists ${username}:`, error);
      throw new Error(`Failed to check GitHub user existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get service configuration summary (without sensitive data)
   */
  getConfigSummary(): string {
    return `GitHub Service: ${this.organization} organization`;
  }
}
