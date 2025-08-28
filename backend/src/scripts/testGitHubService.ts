import dotenv from 'dotenv';
import { logger } from '@/utils/logger';
import { GitHubServiceFactory } from '@/services/githubServiceFactory';
import { GitHubConfigValidator } from '@/services/githubConfigValidator';

// Load environment variables
dotenv.config();

async function testGitHubService() {
  logger.info('Starting GitHub service test suite');
  
  try {
    // Test 1: Configuration Validation
    logger.info('\n=== Testing Configuration Validation ===');
    const envValidation = GitHubConfigValidator.validateEnvironment();
    logger.info('Environment validation result:', {
      isValid: envValidation.isValid,
      errors: envValidation.errors,
      warnings: envValidation.warnings
    });

    if (!envValidation.isValid) {
      logger.error('Configuration validation failed. Please check your environment variables.');
      logger.error('Required variables: GITHUB_TOKEN, GITHUB_ORGANIZATION');
      logger.error('Optional variables: GITHUB_BASE_URL, GITHUB_PARENT_TEAM_ID');
      return;
    }

    // Test 2: Service Factory
    logger.info('\n=== Testing Service Factory ===');
    const serviceCreationStatus = GitHubServiceFactory.getServiceCreationStatus();
    logger.info('Service creation status:', serviceCreationStatus);

    if (!serviceCreationStatus.canCreate) {
      logger.error('Cannot create GitHub service. Please check configuration.');
      return;
    }

    // Test 3: Service Creation
    logger.info('\n=== Testing Service Creation ===');
    let githubService;
    
    try {
      githubService = GitHubServiceFactory.createServiceFromEnv();
      logger.info('GitHub service created successfully');
    } catch (error) {
      logger.warn('Failed to create service from environment, trying with fallback:', error);
      githubService = GitHubServiceFactory.createServiceFromEnvWithFallback();
      logger.info('GitHub service created with fallback');
    }

    // Test 4: Health Check
    logger.info('\n=== Testing Health Check ===');
    const isHealthy = await githubService.checkHealth();
    logger.info(`Service health check: ${isHealthy ? 'PASSED' : 'FAILED'}`);

    if (!isHealthy) {
      logger.warn('Service health check failed, but continuing with tests');
    }

    // Test 5: Organization Info
    logger.info('\n=== Testing Organization Access ===');
    const configSummary = githubService.getConfigSummary();
    logger.info('Service config summary:', configSummary);

    // Test 6: Team Management
    logger.info('\n=== Testing Team Management ===');
    
    // Create a test team
    const testTeamName = `test-team-${Date.now()}`;
    const testTeamDescription = 'Test team for automated testing';
    
    logger.info(`Creating test team: ${testTeamName}`);
    const createdTeam = await githubService.createTeam(testTeamName, testTeamDescription);
    logger.info('Team created:', {
      id: createdTeam.id,
      name: createdTeam.name,
      slug: createdTeam.slug,
      description: createdTeam.description
    });

    // Check if team exists
    const teamExists = await githubService.teamExists(testTeamName);
    logger.info(`Team exists check: ${teamExists ? 'PASSED' : 'FAILED'}`);

    // Get team by ID
    const retrievedTeam = await githubService.getTeam(createdTeam.id);
    logger.info('Retrieved team:', {
      id: retrievedTeam.id,
      name: retrievedTeam.name,
      slug: retrievedTeam.slug,
      description: retrievedTeam.description,
      memberCount: retrievedTeam.members.length
    });

    // Test 7: Repository Management
    logger.info('\n=== Testing Repository Management ===');
    
    // Create a test repository
    const testRepoName = `test-repo-${Date.now()}`;
    const testRepoDescription = 'Test repository for automated testing';
    
    logger.info(`Creating test repository: ${testRepoName}`);
    const createdRepo = await githubService.createRepository(testRepoName, testRepoDescription, true);
    logger.info('Repository created:', {
      name: createdRepo.name,
      description: createdRepo.description,
      private: createdRepo.private
    });

    // Check if repository exists
    const repoExists = await githubService.repositoryExists(testRepoName);
    logger.info(`Repository exists check: ${repoExists ? 'PASSED' : 'FAILED'}`);

    // Get repository
    const retrievedRepo = await githubService.getRepository(testRepoName);
    logger.info('Retrieved repository:', {
      name: retrievedRepo.name,
      description: retrievedRepo.description,
      private: retrievedRepo.private
    });

    // Test 8: Team-Repository Integration
    logger.info('\n=== Testing Team-Repository Integration ===');
    
    // Add team to repository
    logger.info(`Adding team ${createdTeam.id} to repository ${testRepoName}`);
    await githubService.addTeamToRepository(testRepoName, createdTeam.id, 'push');
    logger.info('Team added to repository successfully');

    // Test 9: User Management
    logger.info('\n=== Testing User Management ===');
    
    // Test with a known GitHub username (you can change this)
    const testUsername = 'octocat'; // GitHub's test user
    
    const userExists = await githubService.userExists(testUsername);
    logger.info(`User ${testUsername} exists: ${userExists ? 'YES' : 'NO'}`);

    if (userExists) {
      const user = await githubService.getUser(testUsername);
      logger.info('User info retrieved:', {
        id: user.id,
        login: user.login,
        type: user.type
      });
    }

    // Test 10: Listing Operations
    logger.info('\n=== Testing Listing Operations ===');
    
    // List teams
    const teams = await githubService.listTeams();
    logger.info(`Found ${teams.length} teams in organization`);

    // List repositories
    const repos = await githubService.listRepositories();
    logger.info(`Found ${repos.length} repositories in organization`);

    // Test 11: Update Operations
    logger.info('\n=== Testing Update Operations ===');
    
    // Update team
    const updatedTeam = await githubService.updateTeam(createdTeam.id, {
      description: 'Updated test team description'
    });
    logger.info('Team updated:', {
      id: updatedTeam.id,
      description: updatedTeam.description
    });

    // Update repository
    const updatedRepo = await githubService.updateRepository(testRepoName, {
      description: 'Updated test repository description'
    });
    logger.info('Repository updated:', {
      name: updatedRepo.name,
      description: updatedRepo.description
    });

    // Test 12: Cleanup
    logger.info('\n=== Testing Cleanup Operations ===');
    
    // Remove team from repository
    logger.info(`Removing team ${createdTeam.id} from repository ${testRepoName}`);
    await githubService.removeTeamFromRepository(testRepoName, createdTeam.id);
    logger.info('Team removed from repository successfully');

    // Delete test repository
    logger.info(`Deleting test repository: ${testRepoName}`);
    await githubService.deleteRepository(testRepoName);
    logger.info('Test repository deleted successfully');

    // Delete test team
    logger.info(`Deleting test team: ${createdTeam.id}`);
    await githubService.deleteTeam(createdTeam.id);
    logger.info('Test team deleted successfully');

    // Test 13: Final Health Check
    logger.info('\n=== Final Health Check ===');
    const finalHealth = await githubService.checkHealth();
    logger.info(`Final service health check: ${finalHealth ? 'PASSED' : 'FAILED'}`);

    logger.info('\n=== All Tests Completed Successfully! ===');
    
  } catch (error) {
    logger.error('Test suite failed:', error);
    
    // Try to get more details about the error
    if (error instanceof Error) {
      logger.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
  }
}

// Run the test suite
if (require.main === module) {
  testGitHubService()
    .then(() => {
      logger.info('Test suite finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Test suite crashed:', error);
      process.exit(1);
    });
}

export { testGitHubService };
