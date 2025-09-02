import { Role } from '@prisma/client';

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
 * Check if a role is a class rank role (FIRST_YEAR, SECOND_YEAR, etc.)
 */
export function isClassRankRole(role: string): role is ClassRankRole {
  return CLASS_RANK_ROLES.includes(role as ClassRankRole);
}

/**
 * Get the default system role for new users
 */
export function getDefaultSystemRole(): SystemRole {
  return 'MEMBER';
}

/**
 * Validate that a role is a valid system role
 * Throws an error if the role is a class rank role
 */
export function validateSystemRole(role: string): SystemRole {
  if (isClassRankRole(role)) {
    throw new Error(`Invalid system role: ${role} is a class rank role, not a system role`);
  }
  
  if (!isSystemRole(role)) {
    throw new Error(`Invalid system role: ${role}`);
  }
  
  return role;
}

/**
 * Validate that a class rank is a valid class rank role
 * Throws an error if the role is a system role
 */
export function validateClassRankRole(role: string): ClassRankRole {
  if (isSystemRole(role)) {
    throw new Error(`Invalid class rank: ${role} is a system role, not a class rank role`);
  }
  
  if (!isClassRankRole(role)) {
    throw new Error(`Invalid class rank: ${role}`);
  }
  
  return role;
}

/**
 * Get a user's effective system role, ensuring it's not a class rank role
 * If the user has a class rank role, default to MEMBER
 */
export function getEffectiveSystemRole(userRole: string): SystemRole {
  if (isSystemRole(userRole)) {
    return userRole;
  }
  
  // If the user has a class rank role, they should have MEMBER as their system role
  if (isClassRankRole(userRole)) {
    return 'MEMBER';
  }
  
  // Default fallback
  return 'MEMBER';
}
