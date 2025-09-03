import { PrismaClient, User, Role } from '@prisma/client';
import { logger } from '../utils/logger';
import { MemberPaidStatusService } from '../services/memberPaidStatusService';
import { hasAdminGroups, determineRoleFromGroups } from '../utils/roleUtils';

export interface AuthentikUserInfo {
  sub: string;
  email: string;
  name: string;
  groups: string[];
  email_verified?: boolean;
  preferred_username?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  groups: string[];
  paidStatus: boolean;
  qrCode?: string;
}

export class AuthManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Determine the appropriate system role based on Authentik groups
   */
  public determineRoleFromGroups(authentikGroups: string[]): Role {
    return determineRoleFromGroups(authentikGroups);
  }

  async authenticateUser(authikUserInfo: AuthentikUserInfo): Promise<SessionUser> {
    try {
      logger.info('Authenticating user', { email: authikUserInfo.email, sub: authikUserInfo.sub });
      
      // Get Authentik PK for group management
      let authentikPk: string | null = null;
      try {
        const { AuthentikServiceFactory } = await import('../services/authentikServiceFactory');
        const authentikService = AuthentikServiceFactory.createServiceFromEnv();
        const authentikUser = await authentikService.getUserByEmail(authikUserInfo.email);
        authentikPk = authentikUser.id;
        logger.info('Retrieved Authentik PK for user', { email: authikUserInfo.email, authentikPk });
      } catch (error) {
        logger.warn('Failed to retrieve Authentik PK for user', { email: authikUserInfo.email, error });
        // Continue without PK - user can still authenticate
      }
      
      // Check if user exists in our database
      let user = await this.prisma.user.findUnique({
        where: { email: authikUserInfo.email },
        include: {
          userGroups: {
            include: {
              group: true,
            },
          },
        },
      });

      if (!user) {
        // Create new user
        logger.info('Creating new user from Authentik', { email: authikUserInfo.email });
        
        // Determine initial role based on Authentik groups
        const initialRole = this.determineRoleFromGroups(authikUserInfo.groups);
        
        const createdUser = await this.prisma.user.create({
          data: {
            email: authikUserInfo.email,
            firstName: authikUserInfo.name.split(' ')[0] || authikUserInfo.name,
            lastName: authikUserInfo.name.split(' ').slice(1).join(' ') || '',
            role: initialRole,
            paidStatus: false, // Default to unpaid
            qrCode: this.generateQRCode(authikUserInfo.email),
            authentikId: authikUserInfo.sub, // OIDC sub for authentication
            ...(authentikPk && { authentikPk }), // Authentik PK for group management
          },
          include: {
            userGroups: {
              include: {
                group: true,
              },
            },
          },
        });

        // Sync groups from Authentik
        await this.syncUserGroups(createdUser.id, authikUserInfo.groups);
        
        // Refresh user data to include updated groups
        const refreshedUser = await this.prisma.user.findUnique({
          where: { id: createdUser.id },
          include: {
            userGroups: {
              include: {
                group: true,
              },
            },
          },
        });
        
        if (!refreshedUser) {
          throw new Error('Failed to refresh user data after group sync');
        }
        
        user = refreshedUser;
      } else {
        // Update existing user info
        logger.info('Updating existing user from Authentik', { userId: user.id });
        
        // Sync groups from Authentik first
        await this.syncUserGroups(user.id, authikUserInfo.groups);
        
        // Determine updated role based on current Authentik groups
        const updatedRole = this.determineRoleFromGroups(authikUserInfo.groups);
        
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            firstName: authikUserInfo.name.split(' ')[0] || authikUserInfo.name,
            lastName: authikUserInfo.name.split(' ').slice(1).join(' ') || '',
            role: updatedRole, // Update role based on current Authentik groups
            authentikId: authikUserInfo.sub, // OIDC sub for authentication
            authentikPk: authentikPk, // Authentik PK for group management
          },
          include: {
            userGroups: {
              include: {
                group: true,
              },
            },
          },
        });
      }

      // Build session user object
      const sessionUser: SessionUser = {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        groups: user.userGroups.map(ug => ug.group.name),
        paidStatus: user.paidStatus,
        qrCode: user.qrCode || undefined,
      };

      logger.info('User authenticated successfully', { userId: user.id, role: user.role });
      return sessionUser;
    } catch (error) {
      logger.error('Failed to authenticate user', { error, authikUserInfo });
      throw error;
    }
  }

  async syncUserGroups(userId: string, authentikGroups: string[]): Promise<void> {
    try {
      logger.info('Syncing user groups from Authentik', { userId, groupCount: authentikGroups.length });
      
      // Get current user groups
      const currentUserGroups = await this.prisma.userGroup.findMany({
        where: { userId },
        include: { group: true },
      });

      const currentGroupNames = currentUserGroups.map(ug => ug.group.name);
      
      // Groups to add (in Authentik but not in our DB)
      const groupsToAdd = authentikGroups.filter(groupName => !currentGroupNames.includes(groupName));
      
      // Groups to remove (in our DB but not in Authentik)
      const groupsToRemove = currentUserGroups.filter(ug => !authentikGroups.includes(ug.group.name));

      // Add new groups
      for (const groupName of groupsToAdd) {
        // Check if group exists, create if not
        let group = await this.prisma.group.findUnique({
          where: { name: groupName },
        });

        if (!group) {
          group = await this.prisma.group.create({
            data: {
              name: groupName,
              description: `Group synced from Authentik: ${groupName}`,
              externalId: groupName,
            },
          });
        }

        // Link user to group
        await this.prisma.userGroup.create({
          data: {
            userId,
            groupId: group.id,
          },
        });
      }

      // Remove old groups
      for (const userGroup of groupsToRemove) {
        await this.prisma.userGroup.delete({
          where: { id: userGroup.id },
        });
      }

      logger.info('User groups synced successfully', { 
        userId, 
        added: groupsToAdd.length, 
        removed: groupsToRemove.length 
      });
    } catch (error) {
      logger.error('Failed to sync user groups', { error, userId, authentikGroups });
      throw error;
    }
  }

  async queueUserGroupSync(userId: string, authentikGroups: string[]): Promise<void> {
    try {
      logger.info('Queuing user group sync from Authentik', { userId, groupCount: authentikGroups.length });
      
      // Import here to avoid circular dependencies
      const { backgroundTaskService } = await import('../services/backgroundTaskService');
      
      await backgroundTaskService.addTask('authentik_user_sync', {
        action: 'sync_user_groups',
        userId,
        authentikGroups
      });
      
      logger.info('Background task queued for user group sync', { userId, groupCount: authentikGroups.length });
    } catch (error) {
      logger.error('Failed to queue background task for user group sync', { error, userId, authentikGroups });
      throw error;
    }
  }

  async getUserById(userId: string): Promise<SessionUser | null> {
    try {
      logger.info('Fetching user by ID', { userId });
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userGroups: {
            include: {
              group: true,
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      const sessionUser: SessionUser = {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        groups: user.userGroups.map(ug => ug.group.name),
        paidStatus: user.paidStatus,
        qrCode: user.qrCode || undefined,
      };

      return sessionUser;
    } catch (error) {
      logger.error('Failed to fetch user by ID', { error, userId });
      throw error;
    }
  }

  async updateUserRole(userId: string, newRole: Role): Promise<void> {
    try {
      logger.info('Updating user role', { userId, newRole });
      
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      logger.info('User role updated successfully', { userId, newRole });
    } catch (error) {
      logger.error('Failed to update user role', { error, userId, newRole });
      throw error;
    }
  }

  async updateUserRoleFromGroups(userId: string): Promise<void> {
    try {
      logger.info('Updating user role from groups', { userId });
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          userGroups: {
            include: { group: true }
          }
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const currentGroups = user.userGroups.map(ug => ug.group.name);
      const correctRole = this.determineRoleFromGroups(currentGroups);

      if (user.role !== correctRole) {
        await this.prisma.user.update({
          where: { id: userId },
          data: { role: correctRole }
        });

        logger.info('Updated user role from groups', {
          userId,
          oldRole: user.role,
          newRole: correctRole,
          groups: currentGroups
        });
      } else {
        logger.info('User role is already correct', {
          userId,
          role: user.role,
          groups: currentGroups
        });
      }
    } catch (error) {
      logger.error('Failed to update user role from groups', { error, userId });
      throw error;
    }
  }

  async updateUserPaidStatus(userId: string, paidStatus: boolean): Promise<void> {
    try {
      logger.info('Updating user paid status', { userId, paidStatus });
      
      // Use the MemberPaidStatusService to handle both database update and Authentik group management
      const memberPaidStatusService = new MemberPaidStatusService(this.prisma);
      await memberPaidStatusService.updateMemberPaidStatus(userId, paidStatus);

      logger.info('User paid status updated successfully', { userId, paidStatus });
    } catch (error) {
      logger.error('Failed to update user paid status', { error, userId, paidStatus });
      throw error;
    }
  }

  async refreshUserQRCode(userId: string): Promise<string> {
    try {
      logger.info('Refreshing user QR code', { userId });
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newQRCode = this.generateQRCode(user.email);
      
      await this.prisma.user.update({
        where: { id: userId },
        data: { qrCode: newQRCode },
      });

      logger.info('User QR code refreshed successfully', { userId });
      return newQRCode;
    } catch (error) {
      logger.error('Failed to refresh user QR code', { error, userId });
      throw error;
    }
  }

  private generateQRCode(email: string): string {
    // Generate a unique QR code based on email and timestamp
    const timestamp = Date.now();
    const hash = this.simpleHash(email + timestamp.toString());
    return `MRM360_${hash}_${timestamp}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  async validateSession(sessionToken: string): Promise<SessionUser | null> {
    try {
      // Import session manager dynamically to avoid circular dependencies
      const { sessionManager } = await import('../utils/sessionManager');
      
      logger.info('Validating session', { sessionToken: sessionToken.substring(0, 8) + '...' });
      
      // Use session manager to validate session
      const sessionUser = await sessionManager.getSession(sessionToken);
      
      if (sessionUser) {
        logger.info('Session validated successfully', { userId: sessionUser.id });
        return sessionUser;
      } else {
        logger.info('Session validation failed - invalid session');
        return null;
      }
    } catch (error) {
      logger.error('Failed to validate session', { error });
      return null;
    }
  }

  async logoutUser(userId: string): Promise<void> {
    try {
      logger.info('Logging out user', { userId });
      
      // This is a placeholder for logout logic
      // In a real implementation, you would invalidate the session
      // and perform any necessary cleanup
      
      logger.info('User logged out successfully', { userId });
    } catch (error) {
      logger.error('Failed to logout user', { error, userId });
      throw error;
    }
  }
}
