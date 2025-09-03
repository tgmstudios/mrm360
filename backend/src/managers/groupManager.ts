import { prisma } from '@/models/prismaClient';
import { 
  GroupProfile, 
  CreateGroupRequest, 
  UpdateGroupRequest 
} from '@/types';
import { logger } from '@/utils/logger';
import { Errors } from '@/middleware/errorHandler';

export class GroupManager {
  async createGroup(data: CreateGroupRequest): Promise<GroupProfile> {
    try {
      // Check if group already exists
      const existingGroup = await prisma.group.findUnique({
        where: { name: data.name }
      });

      if (existingGroup) {
        throw Errors.CONFLICT('Group with this name already exists');
      }

      const group = await prisma.group.create({
        data: {
          name: data.name,
          description: data.description,
          externalId: data.externalId
        }
      });

      logger.info(`Created group: ${group.name}`);
      return group;
    } catch (error) {
      logger.error('Error creating group:', error);
      throw error;
    }
  }

  async getGroupById(id: string): Promise<GroupProfile> {
    try {
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          userGroups: {
            include: {
              user: true
            }
          },
          teams: true
        }
      });

      if (!group) {
        throw Errors.NOT_FOUND('Group');
      }

      return group;
    } catch (error) {
      logger.error(`Error getting group ${id}:`, error);
      throw error;
    }
  }

  async getAllGroups(): Promise<GroupProfile[]> {
    try {
      const groups = await prisma.group.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              userGroups: true,
              teams: true
            }
          }
        }
      });

      return groups;
    } catch (error) {
      logger.error('Error getting all groups:', error);
      throw error;
    }
  }

  async getGroups(params: {
    page?: number;
    limit?: number;
    search?: string;
    isExternal?: boolean;
  }): Promise<{
    data: GroupProfile[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { page = 1, limit = 20, search, isExternal } = params;
      const skip = (page - 1) * limit;

      // Simplified query - no filtering for now
      logger.info('getGroups called with params:', { page, limit, search, isExternal });

      // Get total count without any filters
      const total = await prisma.group.count();
      logger.info('Total groups in database:', total);

      // Get all groups without any filters
      const allGroups = await prisma.group.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          externalId: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logger.info('All groups retrieved:', allGroups.length);

      // Apply pagination manually
      const groups = allGroups.slice(skip, skip + limit);
      const totalPages = Math.ceil(total / limit);

      return {
        data: groups as GroupProfile[],
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error getting groups with pagination:', error);
      throw error;
    }
  }

  async updateGroup(id: string, data: UpdateGroupRequest): Promise<GroupProfile> {
    try {
      // Check if name is being changed and if it conflicts
      if (data.name) {
        const existingGroup = await prisma.group.findFirst({
          where: {
            name: data.name,
            id: { not: id }
          }
        });

        if (existingGroup) {
          throw Errors.CONFLICT('Group with this name already exists');
        }
      }

      const group = await prisma.group.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          externalId: data.externalId
        }
      });

      logger.info(`Updated group: ${group.name}`);
      return group;
    } catch (error) {
      logger.error(`Error updating group ${id}:`, error);
      throw error;
    }
  }

  async deleteGroup(id: string): Promise<void> {
    try {
      // Check if group has members or teams
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              userGroups: true,
              teams: true
            }
          }
        }
      });

      if (!group) {
        throw Errors.NOT_FOUND('Group');
      }

      if (group._count.userGroups > 0) {
        throw Errors.CONFLICT('Cannot delete group with members');
      }

      if (group._count.teams > 0) {
        throw Errors.CONFLICT('Cannot delete group with teams');
      }

      await prisma.group.delete({
        where: { id }
      });

      logger.info(`Deleted group: ${id}`);
    } catch (error) {
      logger.error(`Error deleting group ${id}:`, error);
      throw error;
    }
  }

  async getGroupMembers(id: string) {
    try {
      const group = await prisma.group.findUnique({
        where: { id },
        include: {
          userGroups: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  displayName: true,
                  role: true,
                  paidStatus: true
                }
              }
            }
          }
        }
      });

      if (!group) {
        throw Errors.NOT_FOUND('Group');
      }

      return group.userGroups.map(ug => ({
        ...ug.user
      }));
    } catch (error) {
      logger.error(`Error getting group members ${id}:`, error);
      throw error;
    }
  }

  async syncWithAuthentik(): Promise<{ created: number; updated: number; total: number }> {
    try {
      logger.info('Starting Authentik group sync...');

      // Mock Authentik API call - replace with actual integration
      const mockAuthentikGroups = [
        { id: 'auth-group-1', name: 'Competition Team', description: 'Competition team members' },
        { id: 'auth-group-2', name: 'Development Team', description: 'Development team members' },
        { id: 'auth-group-3', name: 'General Members', description: 'General club members' },
        { id: 'auth-group-4', name: 'tech-team', description: 'Technical team members' },
        { id: 'auth-group-5', name: 'executive-board', description: 'Executive board members' }
      ];

      let created = 0;
      let updated = 0;

      for (const authGroup of mockAuthentikGroups) {
        const existingGroup = await prisma.group.findFirst({
          where: { externalId: authGroup.id }
        });

        if (existingGroup) {
          // Update existing group
          await prisma.group.update({
            where: { id: existingGroup.id },
            data: {
              name: authGroup.name,
              description: authGroup.description
            }
          });
          updated++;
        } else {
          // Create new group
          await prisma.group.create({
            data: {
              name: authGroup.name,
              description: authGroup.description,
              externalId: authGroup.id
            }
          });
          created++;
        }
      }

      logger.info(`Authentik sync completed: ${created} created, ${updated} updated`);
      return { created, updated, total: mockAuthentikGroups.length };
    } catch (error) {
      logger.error('Error syncing with Authentik:', error);
      throw error;
    }
  }
}
