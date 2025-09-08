import { Role } from '@prisma/client';
import { prisma } from '@/models/prismaClient';
import { logger } from './logger';

/**
 * Utility functions for handling user roles and class ranks
 */

// System roles that control permissions and access
export const SYSTEM_ROLES = ['ADMIN', 'EXEC_BOARD', 'MEMBER'] as const;
export type SystemRole = typeof SYSTEM_ROLES[number];

// Class rank roles that are used for Discord role assignment
export const CLASS_RANK_ROLES = ['FIRST_YEAR', 'SECOND_YEAR', 'THIRD_YEAR', 'FOURTH_YEAR', 'ALUMNI_OTHER'] as const;
export type ClassRankRole = typeof CLASS_RANK_ROLES[number];

/**
 * Check if a role is a system role (ADMIN, EXEC_BOARD, MEMBER)
 */
export function isSystemRole(role: string): role is SystemRole {
  return SYSTEM_ROLES.includes(role as SystemRole);
}

/**
 * Check if a role is a class rank role
 */
export function isClassRankRole(role: string): role is ClassRankRole {
  return CLASS_RANK_ROLES.includes(role as ClassRankRole);
}

/**
 * Get the effective system role, ensuring it's not a class rank role
 * If the role is a class rank role, default to MEMBER
 */
export function getEffectiveSystemRole(role: string): SystemRole {
  if (isSystemRole(role)) {
    return role as SystemRole;
  }
  
  // If it's a class rank role or unknown role, default to MEMBER
  return 'MEMBER';
}

/**
 * Check if a user has admin groups (tech-team or executive-board)
 * Only checks for exact matches with hyphens
 */
export function hasAdminGroups(authentikGroups: string[]): boolean {
  if (!authentikGroups || !Array.isArray(authentikGroups)) {
    return false;
  }

  return authentikGroups.some(group => 
    group === 'tech-team' || group === 'executive-board'
  );
}

/**
 * Determine the appropriate system role based on Authentik groups
 */
export function determineRoleFromGroups(authentikGroups: string[]): Role {
  // Check if user has admin groups (tech-team or executive-board)
  if (hasAdminGroups(authentikGroups)) {
    logger.info('User has admin groups, setting role to ADMIN', { authentikGroups });
    return Role.ADMIN;
  }
  
  // Default to MEMBER for all other cases
  return Role.MEMBER;
}

/**
 * Update all user roles based on their current Authentik groups
 * This is useful for fixing existing users in the database
 */
export async function updateAllUserRolesFromGroups(): Promise<{ updated: number; errors: number }> {
  let updated = 0;
  let errors = 0;

  try {
    // Get all users with their groups
    const users = await prisma.user.findMany({
      include: {
        userGroups: {
          include: { group: true }
        }
      }
    });

    logger.info(`Processing ${users.length} users for role updates`);

    for (const user of users) {
      try {
        const currentGroups = user.userGroups.map(ug => ug.group.name);
        const correctRole = determineRoleFromGroups(currentGroups);

        if (user.role !== correctRole) {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: correctRole }
          });

          logger.info('Updated user role', {
            userId: user.id,
            email: user.email,
            oldRole: user.role,
            newRole: correctRole,
            groups: currentGroups
          });

          updated++;
        }
      } catch (error) {
        logger.error('Failed to update user role', {
          userId: user.id,
          email: user.email,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        errors++;
      }
    }

    logger.info('Completed role update process', { updated, errors, total: users.length });
  } catch (error) {
    logger.error('Failed to update user roles', { error });
    throw error;
  }

  return { updated, errors };
}
