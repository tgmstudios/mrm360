import { Job } from 'bullmq';
import { TeamProvisioningTask, TeamProvisioningResult, TeamProvisioningConfig } from '@/types';
import { TeamProvisioningManager } from '@/managers/teamProvisioningManager';
import { logger } from '@/utils/logger';

export class TeamProvisioningWorker {
  private manager: TeamProvisioningManager;

  constructor(config: TeamProvisioningConfig) {
    this.manager = new TeamProvisioningManager(config);
  }

  async processJob(job: Job<TeamProvisioningTask>): Promise<TeamProvisioningResult> {
    const startTime = Date.now();
    const task = job.data;

    logger.info(`Processing team provisioning job ${job.id} for team ${task.teamId}`, {
      action: task.action,
      teamId: task.teamId,
      userId: task.userId
    });

    try {
      // Process the team provisioning task
      const result = await this.manager.provisionTeam(task);

      const duration = Date.now() - startTime;
      logger.info(`Team provisioning job ${job.id} completed in ${duration}ms`, {
        success: result.success,
        errors: result.errors.length,
        warnings: result.warnings.length
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Team provisioning job ${job.id} failed after ${duration}ms`, error);

      // Return error result
      return {
        success: false,
        teamId: task.teamId,
        action: task.action,
        results: {},
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  async processCreateTeam(job: Job<TeamProvisioningTask>): Promise<TeamProvisioningResult> {
    logger.info(`Processing create team job ${job.id}`);
    return this.processJob(job);
  }

  async processUpdateTeam(job: Job<TeamProvisioningTask>): Promise<TeamProvisioningResult> {
    logger.info(`Processing update team job ${job.id}`);
    return this.processJob(job);
  }

  async processDeleteTeam(job: Job<TeamProvisioningTask>): Promise<TeamProvisioningResult> {
    logger.info(`Processing delete team job ${job.id}`);
    return this.processJob(job);
  }
}

// Factory function to create worker with configuration
export function createTeamProvisioningWorker(config: TeamProvisioningConfig): TeamProvisioningWorker {
  return new TeamProvisioningWorker(config);
}
