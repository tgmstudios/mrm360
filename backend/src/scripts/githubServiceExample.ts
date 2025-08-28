import dotenv from 'dotenv';
import { logger } from '@/utils/logger';
import { GitHubServiceFactory } from '@/services/githubServiceFactory';

// Load environment variables
dotenv.config();

async function githubServiceExample() {
  logger.info('GitHub Service Example - Common Operations');
  
  try {
    // Create GitHub service
    const githubService = GitHubServiceFactory.createServiceFromEnvWithFallback();
    logger.info('GitHub service created successfully');
    
    // Check service health
    const isHealthy = await githubService.checkHealth();
    logger.info(`Service health: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
    
    if (!isHealthy) {
      logger.warn('Service is unhealthy, but continuing with example');
    }
    
    // Example 1: Create a team
    logger.info('\n--- Example 1: Creating a Team ---');
    const teamName = `example-team-${Date.now()}`;
    const teamDescription = 'Example team created by the service';
    
    const team = await githubService.createTeam(teamName, teamDescription);
    logger.info(`Team created: ${team.name} (ID: ${team.id})`);
    
    // Example 2: Create a repository
    logger.info('\n--- Example 2: Creating a Repository ---');
    const repoName = `example-repo-${Date.now()}`;
    const repoDescription = 'Example repository created by the service';
    
    const repo = await githubService.createRepository(repoName, repoDescription, true);
    logger.info(`Repository created: ${repo.name}`);
    
    // Example 3: Add team to repository
    logger.info('\n--- Example 3: Adding Team to Repository ---');
    await githubService.addTeamToRepository(repoName, team.id, 'push');
    logger.info(`Team ${team.name} added to repository ${repo.name} with push permissions`);
    
    // Example 4: Check if resources exist
    logger.info('\n--- Example 4: Checking Resource Existence ---');
    const teamExists = await githubService.teamExists(teamName);
    const repoExists = await githubService.repositoryExists(repoName);
    
    logger.info(`Team exists: ${teamExists}`);
    logger.info(`Repository exists: ${repoExists}`);
    
    // Example 5: List resources
    logger.info('\n--- Example 5: Listing Resources ---');
    const teams = await githubService.listTeams();
    const repos = await githubService.listRepositories();
    
    logger.info(`Total teams in organization: ${teams.length}`);
    logger.info(`Total repositories in organization: ${repos.length}`);
    
    // Example 6: Update resources
    logger.info('\n--- Example 6: Updating Resources ---');
    const updatedTeam = await githubService.updateTeam(team.id, {
      description: 'Updated example team description'
    });
    
    const updatedRepo = await githubService.updateRepository(repoName, {
      description: 'Updated example repository description'
    });
    
    logger.info(`Team updated: ${updatedTeam.description}`);
    logger.info(`Repository updated: ${updatedRepo.description}`);
    
    // Example 7: Get resource details
    logger.info('\n--- Example 7: Getting Resource Details ---');
    const retrievedTeam = await githubService.getTeam(team.id);
    const retrievedRepo = await githubService.getRepository(repoName);
    
    logger.info('Team details:', {
      id: retrievedTeam.id,
      name: retrievedTeam.name,
      slug: retrievedTeam.slug,
      description: retrievedTeam.description,
      memberCount: retrievedTeam.members.length
    });
    
    logger.info('Repository details:', {
      name: retrievedRepo.name,
      description: retrievedRepo.description,
      private: retrievedRepo.private
    });
    
    // Example 8: Cleanup (remove team from repository)
    logger.info('\n--- Example 8: Cleanup - Remove Team from Repository ---');
    await githubService.removeTeamFromRepository(repoName, team.id);
    logger.info(`Team ${team.name} removed from repository ${repo.name}`);
    
    // Example 9: Delete resources
    logger.info('\n--- Example 9: Cleanup - Delete Resources ---');
    await githubService.deleteRepository(repoName);
    logger.info(`Repository ${repoName} deleted`);
    
    await githubService.deleteTeam(team.id);
    logger.info(`Team ${teamName} deleted`);
    
    logger.info('\n--- All Examples Completed Successfully! ---');
    
  } catch (error) {
    logger.error('Example failed:', error);
    
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  }
}

// Run the example
if (require.main === module) {
  githubServiceExample()
    .then(() => {
      logger.info('Example finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Example crashed:', error);
      process.exit(1);
    });
}

export { githubServiceExample };
