import { prisma } from '@/models/prismaClient';
import { logger } from '@/utils/logger';
import { addJobToQueue } from '@/tasks/queue';

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

      // Create a single batch job for efficient role updates
      await addJobToQueue('DISCORD', {
        action: 'batchUpdateRoles',
        userId: discordAccount.discordId,
        targetRoles: Array.from(targetRoles),
        rolesToRemove: Array.from(allPossibleRoles).filter(roleId => roleId && !targetRoles.has(roleId))
      });

      logger.info('Discord batch role update job queued', { 
        userId, 
        discordId: discordAccount.discordId,
        classRank, 
        interests,
        targetRoles: Array.from(targetRoles),
        removedRoles: Array.from(allPossibleRoles).filter(roleId => roleId && !targetRoles.has(roleId))
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

      // First, remove ALL possible roles to ensure a clean slate
      await this.removeAllRoles(discordAccount.discordId);

      // Then assign the new roles
      // Assign class rank role
      const classRankRoleId = this.classRankRoleMap[classRank];
      if (classRankRoleId) {
        await addJobToQueue('DISCORD', {
          action: 'assignRole',
          userId: discordAccount.discordId,
          roleId: classRankRoleId
        });
      }

      // Assign member role
      const memberRoleId = process.env.DISCORD_MEMBER_ROLE_ID;
      if (memberRoleId) {
        await addJobToQueue('DISCORD', {
          action: 'assignRole',
          userId: discordAccount.discordId,
          roleId: memberRoleId
        });
      }

      // Assign interest roles
      for (const interest of interests) {
        const roleId = this.interestRoleMap[interest];
        if (roleId) {
          await addJobToQueue('DISCORD', {
            action: 'assignRole',
            userId: discordAccount.discordId,
            roleId: roleId
          });
        }
      }

      logger.info('Discord role assignment jobs queued successfully', { 
        userId, 
        discordId: discordAccount.discordId,
        classRank, 
        interests 
      });
      
    } catch (error) {
      logger.error('Failed to assign Discord roles', { error, userId });
      // Don't fail the process if Discord role assignment fails
    }
  }

  /**
   * Remove all possible Discord roles from a user
   * This is used internally by assignRoles to ensure a clean slate
   */
  private static async removeAllRoles(discordId: string): Promise<void> {
    try {
      // Remove member role
      const memberRoleId = process.env.DISCORD_MEMBER_ROLE_ID;
      if (memberRoleId) {
        await addJobToQueue('DISCORD', {
          action: 'removeRole',
          userId: discordId,
          roleId: memberRoleId
        });
      }

      // Remove ALL class rank roles
      const allClassRankRoleIds = [
        process.env.DISCORD_FIRST_YEAR_ROLE_ID!,
        process.env.DISCORD_SECOND_YEAR_ROLE_ID!,
        process.env.DISCORD_THIRD_YEAR_ROLE_ID!,
        process.env.DISCORD_FOURTH_YEAR_ROLE_ID!,
        process.env.DISCORD_ALUMNI_OTHER_ROLE_ID!
      ];

      for (const roleId of allClassRankRoleIds) {
        if (roleId) {
          await addJobToQueue('DISCORD', {
            action: 'removeRole',
            userId: discordId,
            roleId: roleId
          });
        }
      }

      // Remove ALL interest roles
      const allInterestRoleIds = [
        process.env.DISCORD_OFFENSE_ROLE_ID!,
        process.env.DISCORD_DEFENSE_ROLE_ID!,
        process.env.DISCORD_CTF_ROLE_ID!,
        process.env.DISCORD_GAMING_ROLE_ID!
      ];

      for (const roleId of allInterestRoleIds) {
        if (roleId) {
          await addJobToQueue('DISCORD', {
            action: 'removeRole',
            userId: discordId,
            roleId: roleId
          });
        }
      }

      logger.info('All Discord roles removed for clean slate', { discordId });
      
    } catch (error) {
      logger.error('Failed to remove all Discord roles', { error, discordId });
      // Don't fail the process if role removal fails
    }
  }

  /**
   * Remove Discord roles from a user when unlinking their Discord account
   */
  static async removeRoles(userId: string, discordId: string): Promise<void> {
    try {
      // Remove ALL possible roles that the user might have had assigned
      // This includes member role, all class rank roles, and all interest roles
      
      // Remove member role
      const memberRoleId = await this.getRoleIdFromDatabase('DISCORD_MEMBER_ROLE_ID');
      if (memberRoleId) {
        await addJobToQueue('DISCORD', {
          action: 'removeRole',
          userId: discordId,
          roleId: memberRoleId
        });
      }

      // Remove ALL class rank roles (in case they had a different role before)
      const allClassRankRoleIds: string[] = [];
      for (const configKey of Object.values(this.classRankRoleMap)) {
        const roleId = await this.getRoleIdFromDatabase(configKey);
        if (roleId) {
          allClassRankRoleIds.push(roleId);
          await addJobToQueue('DISCORD', {
            action: 'removeRole',
            userId: discordId,
            roleId: roleId
          });
        }
      }

      // Remove ALL interest roles (in case they had different interests before)
      const allInterestRoleIds: string[] = [];
      for (const configKey of Object.values(this.interestRoleMap)) {
        const roleId = await this.getRoleIdFromDatabase(configKey);
        if (roleId) {
          allInterestRoleIds.push(roleId);
          await addJobToQueue('DISCORD', {
            action: 'removeRole',
            userId: discordId,
            roleId: roleId
          });
        }
      }

      logger.info('All Discord role removal jobs queued successfully', { 
        userId, 
        discordId,
        removedRoles: {
          member: memberRoleId,
          classRanks: allClassRankRoleIds,
          interests: allInterestRoleIds
        }
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

      // Assign class rank role if user has one
      if (user.userClassRank) {
        const classRankConfigKey = this.classRankRoleMap[user.userClassRank.classRank];
        if (classRankConfigKey) {
          const classRankRoleId = await this.getRoleIdFromDatabase(classRankConfigKey);
          if (classRankRoleId) {
            await addJobToQueue('DISCORD', {
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
        await addJobToQueue('DISCORD', {
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
            await addJobToQueue('DISCORD', {
              action: 'assignRole',
              userId: discordId,
              roleId: roleId
            });
          }
        }
      }

      logger.info('Discord role assignment jobs queued successfully on link', { 
        userId, 
        discordId, 
        classRank: user.userClassRank?.classRank,
        interests: user.userInterests.map(i => i.interest)
      });
      
    } catch (error) {
      logger.error('Failed to assign Discord roles on link', { error, userId });
      // Don't fail the link process if Discord role assignment fails
    }
  }
}
