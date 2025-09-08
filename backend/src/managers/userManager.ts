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
import { MemberPaidStatusService } from '@/services/memberPaidStatusService';

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
      
      // Return user with isActive field (false for newly created users)
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName || undefined,
        paidStatus: user.paidStatus,
        qrCode: user.qrCode || undefined,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        authentikId: user.authentikId || undefined,
        isActive: false // New users are inactive until they login
      };
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
          },
          userTeams: {
            include: {
              team: true
            }
          },
          rsvps: {
            include: {
              event: true
            }
          },
          checkIns: {
            include: {
              event: true
            }
          }
        }
      });

      if (!user) {
        throw Errors.NOT_FOUND('User');
      }

      // Add isActive field based on whether user has authentikId
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName || undefined,
        paidStatus: user.paidStatus,
        qrCode: user.qrCode || undefined,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        authentikId: user.authentikId || undefined,
        isActive: !!user.authentikId, // User is active if they have an authentikId
        userGroups: user.userGroups.map(ug => ({
          id: ug.id,
          userId: ug.userId,
          groupId: ug.groupId,
          group: {
            id: ug.group.id,
            name: ug.group.name,
            description: ug.group.description,
            externalId: ug.group.externalId,
            createdAt: ug.group.createdAt,
            updatedAt: ug.group.updatedAt
          }
        })),
        userTeams: user.userTeams.map(ut => ({
          id: ut.id,
          userId: ut.userId,
          teamId: ut.teamId,
          role: ut.role,
          team: {
            id: ut.team.id,
            name: ut.team.name,
            description: ut.team.description,
            type: ut.team.type,
            subtype: ut.team.subtype,
            parentTeamId: ut.team.parentTeamId,
            groupId: ut.team.groupId,
            createdAt: ut.team.createdAt,
            updatedAt: ut.team.updatedAt
          }
        })),
        events: [
          // Events the user has RSVP'd to
          ...user.rsvps.map(rsvp => ({
            id: rsvp.event.id,
            title: rsvp.event.title,
            description: rsvp.event.description,
            startTime: rsvp.event.startTime,
            endTime: rsvp.event.endTime,
            category: rsvp.event.category,
            linkedTeamId: rsvp.event.linkedTeamId,
            attendanceType: rsvp.event.attendanceType,
            createdAt: rsvp.event.createdAt,
            updatedAt: rsvp.event.updatedAt,
            rsvpStatus: rsvp.status
          })),
          // Events the user has checked into
          ...user.checkIns.map(checkIn => ({
            id: checkIn.event.id,
            title: checkIn.event.title,
            description: checkIn.event.description,
            startTime: checkIn.event.startTime,
            endTime: checkIn.event.endTime,
            category: checkIn.event.category,
            linkedTeamId: checkIn.event.linkedTeamId,
            attendanceType: checkIn.event.attendanceType,
            createdAt: checkIn.event.createdAt,
            updatedAt: checkIn.event.updatedAt,
            checkedInAt: checkIn.checkedInAt
          }))
        ].filter((event, index, array) => 
          // Remove duplicates based on event ID
          array.findIndex(e => e.id === event.id) === index
        )
      };
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

      if (!user) {
        return null;
      }

      // Add isActive field based on whether user has authentikId
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName || undefined,
        paidStatus: user.paidStatus,
        qrCode: user.qrCode || undefined,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        authentikId: user.authentikId || undefined,
        isActive: !!user.authentikId // User is active if they have an authentikId
      };
    } catch (error) {
      logger.error(`Error getting user by email ${email}:`, error);
      throw error;
    }
  }

  async updateUser(id: string, data: UpdateUserRequest): Promise<UserProfile> {
    try {
      // Build update data object with only provided fields
      const updateData: any = {};
      
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.displayName !== undefined) updateData.displayName = data.displayName;
      
      // Map isPaid to paidStatus (existing database field)
      if (data.isPaid !== undefined) updateData.paidStatus = data.isPaid;
      
      // Note: isActive and paidUntil fields don't exist in the database schema
      // These would need to be added to the schema if they're required

      const user = await prisma.user.update({
        where: { id },
        data: updateData
      });

      // Handle paid status changes with Authentik group management (synchronous)
      if (data.isPaid !== undefined) {
        try {
          // Import here to avoid circular dependencies
          const { MemberPaidStatusService } = await import('../services/memberPaidStatusService');
          
          const memberPaidStatusService = new MemberPaidStatusService(prisma);
          await memberPaidStatusService.updateMemberPaidStatus(id, data.isPaid);
          
          logger.info('Authentik group membership updated for paid status change', { 
            userId: id, 
            paidStatus: data.isPaid,
            userEmail: user.email
          });
        } catch (error) {
          logger.error('Failed to update Authentik group membership for paid status change', { 
            error, 
            userId: id, 
            paidStatus: data.isPaid 
          });
          // Don't throw here - we want the user update to succeed even if background task fails
        }
      }

      // Handle authentik groups if provided
      if (data.authentikGroups !== undefined) {
        // This would need to be implemented if authentik groups are managed separately
        logger.info('Authentik groups update requested but not implemented', { 
          userId: id, 
          groups: data.authentikGroups 
        });
      }

      // Return the updated user profile
      return await this.getUserById(id);
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
      const { page = 1, limit = 20, search, role, paidStatus, isActive, groupId, teamId, sortBy, sortOrder } = params;
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

      if (isActive !== undefined) {
        if (isActive) {
          where.authentikId = { not: null };
        } else {
          where.authentikId = null;
        }
      }

      if (groupId) {
        where.userGroups = {
          some: {
            groupId
          }
        };
      }

      if (teamId) {
        where.userTeams = {
          some: {
            teamId
          }
        };
      }

      // Get total count
      const total = await prisma.user.count({ where });

      // Build orderBy clause
      let orderBy: any[] = [];
      
      if (sortBy && sortOrder) {
        if (sortBy === 'displayName') {
          orderBy = [
            { lastName: sortOrder },
            { firstName: sortOrder }
          ];
        } else if (sortBy === 'email') {
          orderBy = [{ email: sortOrder }];
        } else if (sortBy === 'createdAt') {
          orderBy = [{ createdAt: sortOrder }];
        } else {
          // Default ordering
          orderBy = [
            { lastName: 'asc' },
            { firstName: 'asc' }
          ];
        }
      } else {
        // Default ordering
        orderBy = [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ];
      }

      // Get users
      const users = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          userGroups: {
            include: {
              group: true
            }
          },
          userTeams: {
            include: {
              team: true
            }
          },
          rsvps: {
            include: {
              event: true
            }
          },
          checkIns: {
            include: {
              event: true
            }
          }
        }
      });

      const totalPages = Math.ceil(total / limit);

      // Add isActive field to each user and include related data
      const usersWithActiveStatus = users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName || undefined,
        paidStatus: user.paidStatus,
        qrCode: user.qrCode || undefined,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        authentikId: user.authentikId || undefined,
        isActive: !!user.authentikId, // User is active if they have an authentikId
        userGroups: user.userGroups.map(ug => ({
          id: ug.id,
          userId: ug.userId,
          groupId: ug.groupId,
          group: {
            id: ug.group.id,
            name: ug.group.name,
            description: ug.group.description,
            externalId: ug.group.externalId,
            createdAt: ug.group.createdAt,
            updatedAt: ug.group.updatedAt
          }
        })),
        userTeams: user.userTeams.map(ut => ({
          id: ut.id,
          userId: ut.userId,
          teamId: ut.teamId,
          role: ut.role,
          team: {
            id: ut.team.id,
            name: ut.team.name,
            description: ut.team.description,
            type: ut.team.type,
            subtype: ut.team.subtype,
            parentTeamId: ut.team.parentTeamId,
            groupId: ut.team.groupId,
            createdAt: ut.team.createdAt,
            updatedAt: ut.team.updatedAt
          }
        })),
        events: [
          // Events the user has RSVP'd to
          ...user.rsvps.map(rsvp => ({
            id: rsvp.event.id,
            title: rsvp.event.title,
            description: rsvp.event.description,
            startTime: rsvp.event.startTime,
            endTime: rsvp.event.endTime,
            category: rsvp.event.category,
            linkedTeamId: rsvp.event.linkedTeamId,
            attendanceType: rsvp.event.attendanceType,
            createdAt: rsvp.event.createdAt,
            updatedAt: rsvp.event.updatedAt,
            rsvpStatus: rsvp.status
          })),
          // Events the user has checked into
          ...user.checkIns.map(checkIn => ({
            id: checkIn.event.id,
            title: checkIn.event.title,
            description: checkIn.event.description,
            startTime: checkIn.event.startTime,
            endTime: checkIn.event.endTime,
            category: checkIn.event.category,
            linkedTeamId: checkIn.event.linkedTeamId,
            attendanceType: checkIn.event.attendanceType,
            createdAt: checkIn.event.createdAt,
            updatedAt: checkIn.event.updatedAt,
            checkedInAt: checkIn.checkedInAt
          }))
        ].filter((event, index, array) => 
          // Remove duplicates based on event ID
          array.findIndex(e => e.id === event.id) === index
        )
      }));

      return {
        success: true,
        data: usersWithActiveStatus,
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
