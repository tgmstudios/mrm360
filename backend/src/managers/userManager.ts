import { prisma } from '@/models/prismaClient';
import { 
  UserProfile, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserQueryParams,
  PaginatedResponse 
} from '@/types';
import { logger } from '@/utils/logger';
import { Errors } from '@/middleware/errorHandler';

export class UserManager {
  async createUser(data: CreateUserRequest): Promise<UserProfile> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw Errors.CONFLICT('User with this email already exists');
      }

      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: data.displayName,
          paidStatus: data.paidStatus ?? false,
          role: data.role ?? 'MEMBER'
        }
      });

      logger.info(`Created user: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserProfile> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          userGroups: {
            include: {
              group: true
            }
          }
        }
      });

      if (!user) {
        throw Errors.NOT_FOUND('User');
      }

      return user;
    } catch (error) {
      logger.error(`Error getting user ${id}:`, error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          userGroups: {
            include: {
              group: true
            }
          }
        }
      });

      return user;
    } catch (error) {
      logger.error(`Error getting user by email ${email}:`, error);
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: data.displayName,
          paidStatus: data.paidStatus,
          role: data.role
        }
      });

      logger.info(`Updated user: ${user.email}`);
      return user;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id }
      });

      logger.info(`Deleted user: ${id}`);
    } catch (error) {
      logger.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  async getUsers(params: UserQueryParams): Promise<PaginatedResponse<UserProfile>> {
    try {
      const { page = 1, limit = 20, search, role, paidStatus, groupId } = params;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (paidStatus !== undefined) {
        where.paidStatus = paidStatus;
      }

      if (groupId) {
        where.userGroups = {
          some: {
            groupId
          }
        };
      }

      // Get total count
      const total = await prisma.user.count({ where });

      // Get users
      const users = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ],
        include: {
          userGroups: {
            include: {
              group: true
            }
          }
        }
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  async assignUserToGroup(userId: string, groupId: string): Promise<void> {
    try {
      // Check if user and group exist
      const [user, group] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }),
        prisma.group.findUnique({ where: { id: groupId } })
      ]);

      if (!user) {
        throw Errors.NOT_FOUND('User');
      }

      if (!group) {
        throw Errors.NOT_FOUND('Group');
      }

      // Check if already assigned
      const existingAssignment = await prisma.userGroup.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId
          }
        }
      });

      if (existingAssignment) {
        throw Errors.CONFLICT('User is already assigned to this group');
      }

      // Assign user to group
      await prisma.userGroup.create({
        data: {
          userId,
          groupId
        }
      });

      logger.info(`Assigned user ${userId} to group ${groupId}`);
    } catch (error) {
      logger.error(`Error assigning user ${userId} to group ${groupId}:`, error);
      throw error;
    }
  }

  async removeUserFromGroup(userId: string, groupId: string): Promise<void> {
    try {
      await prisma.userGroup.delete({
        where: {
          userId_groupId: {
            userId,
            groupId
          }
        }
      });

      logger.info(`Removed user ${userId} from group ${groupId}`);
    } catch (error) {
      logger.error(`Error removing user ${userId} from group ${groupId}:`, error);
      throw error;
    }
  }

  async generateQRCode(userId: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw Errors.NOT_FOUND('User');
      }

      // Generate unique QR code
      const qrCode = `MRM360-${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Update user with QR code
      await prisma.user.update({
        where: { id: userId },
        data: { qrCode }
      });

      logger.info(`Generated QR code for user ${userId}`);
      return qrCode;
    } catch (error) {
      logger.error(`Error generating QR code for user ${userId}:`, error);
      throw error;
    }
  }
}
