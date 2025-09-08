import { prisma } from '@/models/prismaClient';
import { logger } from '@/utils/logger';
import { addJobToQueue } from '@/tasks/queue';
import { DiscordBatchTaskManager, DiscordRoleOperation } from '@/managers/discordBatchTaskManager';

export class DiscordRoleManager {
  private static classRankRoleMap: Record<string, string> = {
    'FIRST_YEAR': 'DISCORD_FIRST_YEAR_ROLE_ID',
    'SECOND_YEAR': 'DISCORD_SECOND_YEAR_ROLE_ID',
    'THIRD_YEAR': 'DISCORD_THIRD_YEAR_ROLE_ID',
    'FOURTH_YEAR': 'DISCORD_FOURTH_YEAR_ROLE_ID',
    'ALUMNI_OTHER': 'DISCORD_ALUMNI_OTHER_ROLE_ID'
  };

  private static interestRoleMap: Record<string, string> = {
    'OFFENSE': 'DISCORD_OFFENSE_ROLE_ID',
    'DEFENSE': 'DISCORD_DEFENSE_ROLE_ID',
    'CTF': 'DISCORD_CTF_ROLE_ID',
    'GAMING': 'DISCORD_GAMING_ROLE_ID'
  };

  /**
   * Get role ID from database by config key
   */
  private static async getRoleIdFromDatabase(configKey: string): Promise<string | null> {
    try {
      const config = await prisma.discordConfig.findUnique({
        where: { key: configKey }
      });

      if (!config) {
        logger.warn(`Discord config not found for key: ${configKey}`);
        return null;
      }

      return config.value;
    } catch (error) {
      logger.error(`Error getting role ID from database for key: ${configKey}`, error);
      return null;
    }
  }

  /**
   * Get all possible Discord role IDs from database
   */
  private static async getAllPossibleRoles(): Promise<string[]> {
    const allRoles: string[] = [];
    
    // Add member role
    const memberRoleId = await this.getRoleIdFromDatabase('DISCORD_MEMBER_ROLE_ID');
    if (memberRoleId) {
      allRoles.push(memberRoleId);
    }
    
    // Add all class rank roles
    for (const configKey of Object.values(this.classRankRoleMap)) {
      const roleId = await this.getRoleIdFromDatabase(configKey);
      if (roleId) {
        allRoles.push(roleId);
      }
    }
    
    // Add all interest roles
    for (const configKey of Object.values(this.interestRoleMap)) {
      const roleId = await this.getRoleIdFromDatabase(configKey);
      if (roleId) {
        allRoles.push(roleId);
      }
    }

    return allRoles;
  }

  /**
   * Assign Discord roles to a user based on their class rank and interests
   * This function efficiently manages role changes by only removing roles that need to be changed
   */
  static async updateRolesEfficiently(userId: string, classRank: string, interests: string[]): Promise<void> {
    try {
      // Get user's Discord account
      const discordAccount = await prisma.discordAccount.findUnique({
        where: { userId }
      });

      if (!discordAccount) {
        logger.info('No Discord account linked for user', { userId });
        return;
      }

      // Determine which roles the user should have
      const targetRoles = new Set<string>();
      
      // Add member role
      const memberRoleId = await this.getRoleIdFromDatabase('DISCORD_MEMBER_ROLE_ID');
      if (memberRoleId) {
        targetRoles.add(memberRoleId);
      }

      // Add class rank role
      const classRankConfigKey = this.classRankRoleMap[classRank];
      if (classRankConfigKey) {
        const classRankRoleId = await this.getRoleIdFromDatabase(classRankConfigKey);
        if (classRankRoleId) {
          targetRoles.add(classRankRoleId);
        }
      }

      // Add interest roles
      for (const interest of interests) {
        const interestConfigKey = this.interestRoleMap[interest];
        if (interestConfigKey) {
          const roleId = await this.getRoleIdFromDatabase(interestConfigKey);
          if (roleId) {
            targetRoles.add(roleId);
          }
        }
      }

      // Get all possible roles from database
      const allPossibleRoles = new Set<string>();
      
      // Add member role
      if (memberRoleId) {
        allPossibleRoles.add(memberRoleId);
      }
      
      // Add all class rank roles
      for (const configKey of Object.values(this.classRankRoleMap)) {
        const roleId = await this.getRoleIdFromDatabase(configKey);
        if (roleId) {
          allPossibleRoles.add(roleId);
        }
      }
      
      // Add all interest roles
      for (const configKey of Object.values(this.interestRoleMap)) {
        const roleId = await this.getRoleIdFromDatabase(configKey);
        if (roleId) {
          allPossibleRoles.add(roleId);
        }
      }

      // Create batch operations for role updates
      const operations: DiscordRoleOperation[] = [];
      
      // Add remove operations for roles that need to be removed
      const rolesToRemove = Array.from(allPossibleRoles).filter(roleId => roleId && !targetRoles.has(roleId));
      for (const roleId of rolesToRemove) {
        operations.push({
          action: 'removeRole',
          userId: discordAccount.discordId,
          roleId
        });
      }
      
      // Add assign operations for roles that need to be assigned
      for (const roleId of targetRoles) {
        operations.push({
          action: 'assignRole',
          userId: discordAccount.discordId,
          roleId
        });
      }

      // Create batch task and queue the job
      const batchTaskManager = new DiscordBatchTaskManager(prisma);
      const batchTask = await batchTaskManager.createUserRoleBatchTask({
        userId: discordAccount.discordId,
        operations,
        description: `Update Discord roles for user based on class rank: ${classRank}, interests: ${interests.join(', ')}`
      });

      // Queue the batch job with the background task ID
      await addJobToQueue('DISCORD', {
        action: 'batchUpdateRoles',
        userId: discordAccount.discordId,
        targetRoles: Array.from(targetRoles),
        rolesToRemove: rolesToRemove,
        backgroundTaskId: batchTask.id
      });

      logger.info('Discord batch role update job queued with batch task', { 
        userId, 
        discordId: discordAccount.discordId,
        classRank, 
        interests,
        targetRoles: Array.from(targetRoles),
        removedRoles: rolesToRemove,
        batchTaskId: batchTask.id
      });
      
    } catch (error) {
      logger.error('Failed to queue batch Discord role update', { error, userId });
      // Don't fail the process if Discord role assignment fails
    }
  }

  /**
   * Assign Discord roles to a user based on their class rank and interests
   * This function first removes all possible roles, then assigns the new ones
   */
  static async assignRoles(userId: string, classRank: string, interests: string[]): Promise<void> {
    try {
      // Get user's Discord account
      const discordAccount = await prisma.discordAccount.findUnique({
        where: { userId }
      });

      if (!discordAccount) {
        logger.info('No Discord account linked for user', { userId });
        return;
      }

      // Create batch operations for role assignments
      const operations: DiscordRoleOperation[] = [];

      // First, remove ALL possible roles to ensure a clean slate
      const allPossibleRoles = await this.getAllPossibleRoles();
      for (const roleId of allPossibleRoles) {
        operations.push({
          action: 'removeRole',
          userId: discordAccount.discordId,
          roleId
        });
      }

      // Then assign the new roles
      // Assign class rank role
      const classRankConfigKey = this.classRankRoleMap[classRank];
      if (classRankConfigKey) {
        const classRankRoleId = await this.getRoleIdFromDatabase(classRankConfigKey);
        if (classRankRoleId) {
          operations.push({
            action: 'assignRole',
            userId: discordAccount.discordId,
            roleId: classRankRoleId
          });
        }
      }

      // Assign member role
      const memberRoleId = await this.getRoleIdFromDatabase('DISCORD_MEMBER_ROLE_ID');
      if (memberRoleId) {
        operations.push({
          action: 'assignRole',
          userId: discordAccount.discordId,
          roleId: memberRoleId
        });
      }

      // Assign interest roles
      for (const interest of interests) {
        const interestConfigKey = this.interestRoleMap[interest];
        if (interestConfigKey) {
          const roleId = await this.getRoleIdFromDatabase(interestConfigKey);
          if (roleId) {
            operations.push({
              action: 'assignRole',
              userId: discordAccount.discordId,
              roleId: roleId
            });
          }
        }
      }

      // Create batch task and queue the job
      const batchTaskManager = new DiscordBatchTaskManager(prisma);
      const batchTask = await batchTaskManager.createUserRoleBatchTask({
        userId: discordAccount.discordId,
        operations,
        description: `Assign Discord roles for user based on class rank: ${classRank}, interests: ${interests.join(', ')}`
      });

      // Queue the batch job with the background task ID
      await addJobToQueue('DISCORD', {
        action: 'batchUpdateRoles',
        userId: discordAccount.discordId,
        targetRoles: operations.filter(op => op.action === 'assignRole').map(op => op.roleId),
        rolesToRemove: operations.filter(op => op.action === 'removeRole').map(op => op.roleId),
        backgroundTaskId: batchTask.id
      });

      logger.info('Discord role assignment jobs queued successfully with batch task', { 
        userId, 
        discordId: discordAccount.discordId,
        classRank, 
        interests,
        batchTaskId: batchTask.id
      });
      
    } catch (error) {
      logger.error('Failed to assign Discord roles', { error, userId });
      // Don't fail the process if Discord role assignment fails
    }
  }


  /**
   * Remove Discord roles from a user when unlinking their Discord account
   */
  static async removeRoles(userId: string, discordId: string): Promise<void> {
    try {
      // Get all possible roles to remove
      const allPossibleRoles = await this.getAllPossibleRoles();
      
      // Create batch operations for role removal
      const operations: DiscordRoleOperation[] = allPossibleRoles.map(roleId => ({
        action: 'removeRole',
        userId: discordId,
        roleId
      }));

      // Create batch task and queue the job
      const batchTaskManager = new DiscordBatchTaskManager(prisma);
      const batchTask = await batchTaskManager.createUserRoleBatchTask({
        userId: discordId,
        operations,
        description: `Remove all Discord roles for user ${userId} (unlinking account)`
      });

      // Queue the batch job with the background task ID
      await addJobToQueue('DISCORD', {
        action: 'batchUpdateRoles',
        userId: discordId,
        targetRoles: [],
        rolesToRemove: allPossibleRoles,
        backgroundTaskId: batchTask.id
      });

      logger.info('All Discord role removal jobs queued successfully with batch task', { 
        userId, 
        discordId,
        removedRoles: allPossibleRoles,
        batchTaskId: batchTask.id
      });
      
    } catch (error) {
      logger.error('Failed to remove Discord roles', { error, userId });
      // Don't fail the unlink process if Discord role removal fails
    }
  }

  /**
   * Assign Discord roles to a user when they link their Discord account
   */
  static async assignRolesOnLink(userId: string, discordId: string): Promise<void> {
    try {
      // Get user's current role, interests, and class rank from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userInterests: true,
          userClassRank: true
        }
      });

      if (!user) {
        logger.warn('User not found for Discord role assignment on link', { userId });
        return;
      }

      // Create batch operations for role assignments
      const operations: DiscordRoleOperation[] = [];

      // Assign class rank role if user has one
      if (user.userClassRank) {
        const classRankConfigKey = this.classRankRoleMap[user.userClassRank.classRank];
        if (classRankConfigKey) {
          const classRankRoleId = await this.getRoleIdFromDatabase(classRankConfigKey);
          if (classRankRoleId) {
            operations.push({
              action: 'assignRole',
              userId: discordId,
              roleId: classRankRoleId
            });
          }
        }
      }

      // Assign member role
      const memberRoleId = await this.getRoleIdFromDatabase('DISCORD_MEMBER_ROLE_ID');
      if (memberRoleId) {
        operations.push({
          action: 'assignRole',
          userId: discordId,
          roleId: memberRoleId
        });
      }

      // Assign interest roles
      for (const interest of user.userInterests) {
        const interestConfigKey = this.interestRoleMap[interest.interest];
        if (interestConfigKey) {
          const roleId = await this.getRoleIdFromDatabase(interestConfigKey);
          if (roleId) {
            operations.push({
              action: 'assignRole',
              userId: discordId,
              roleId: roleId
            });
          }
        }
      }

      // Create batch task and queue the job
      const batchTaskManager = new DiscordBatchTaskManager(prisma);
      const batchTask = await batchTaskManager.createUserRoleBatchTask({
        userId: discordId,
        operations,
        description: `Assign Discord roles for user ${userId} on account link`
      });

      // Queue the batch job with the background task ID
      await addJobToQueue('DISCORD', {
        action: 'batchUpdateRoles',
        userId: discordId,
        targetRoles: operations.map(op => op.roleId),
        rolesToRemove: [],
        backgroundTaskId: batchTask.id
      });

      logger.info('Discord role assignment jobs queued successfully on link with batch task', { 
        userId, 
        discordId, 
        classRank: user.userClassRank?.classRank,
        interests: user.userInterests.map(i => i.interest),
        batchTaskId: batchTask.id
      });
      
    } catch (error) {
      logger.error('Failed to assign Discord roles on link', { error, userId });
      // Don't fail the link process if Discord role assignment fails
    }
  }
}
