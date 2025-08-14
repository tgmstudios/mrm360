import { PrismaClient, Event, EventCategory, AttendanceType, User, Team } from '@prisma/client';
import { logger } from '../utils/logger';

export interface CreateEventData {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  category: EventCategory;
  linkedTeamId?: string;
  attendanceType: AttendanceType;
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export interface RSVPData {
  userId: string;
  eventId: string;
  status: 'attending' | 'not_attending' | 'maybe';
}

export interface AttendanceCheckInData {
  qrCode: string;
  eventId: string;
}

export class EventManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createEvent(data: CreateEventData): Promise<Event> {
    try {
      logger.info('Creating new event', { title: data.title, category: data.category });
      
      const event = await this.prisma.event.create({
        data: {
          title: data.title,
          description: data.description,
          startTime: data.startTime,
          endTime: data.endTime,
          category: data.category,
          linkedTeamId: data.linkedTeamId,
          attendanceType: data.attendanceType,
        },
        include: {
          linkedTeam: true,
          rsvps: {
            include: {
              user: true,
            },
          },
          checkIns: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info('Event created successfully', { eventId: event.id });
      return event;
    } catch (error) {
      logger.error('Failed to create event', { error, data });
      throw error;
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      logger.info('Fetching event by ID', { eventId: id });
      
      const event = await this.prisma.event.findUnique({
        where: { id },
        include: {
          linkedTeam: true,
          rsvps: {
            include: {
              user: true,
            },
          },
          checkIns: {
            include: {
              user: true,
            },
          },
        },
      });

      return event;
    } catch (error) {
      logger.error('Failed to fetch event by ID', { error, eventId: id });
      throw error;
    }
  }

  async getAllEvents(filters?: {
    category?: EventCategory;
    linkedTeamId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]> {
    try {
      logger.info('Fetching all events', { filters });
      
      const where: any = {};
      
      if (filters?.category) {
        where.category = filters.category;
      }
      
      if (filters?.linkedTeamId) {
        where.linkedTeamId = filters.linkedTeamId;
      }
      
      if (filters?.startDate || filters?.endDate) {
        where.startTime = {};
        if (filters.startDate) {
          where.startTime.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.startTime.lte = filters.endDate;
        }
      }

      const events = await this.prisma.event.findMany({
        where,
        include: {
          linkedTeam: true,
          rsvps: {
            include: {
              user: true,
            },
          },
          checkIns: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { startTime: 'asc' },
      });

      return events;
    } catch (error) {
      logger.error('Failed to fetch events', { error, filters });
      throw error;
    }
  }

  async updateEvent(id: string, data: UpdateEventData): Promise<Event> {
    try {
      logger.info('Updating event', { eventId: id, updates: data });
      
      const event = await this.prisma.event.update({
        where: { id },
        data,
        include: {
          linkedTeam: true,
          rsvps: {
            include: {
              user: true,
            },
          },
          checkIns: {
            include: {
              user: true,
            },
          },
        },
      });

      logger.info('Event updated successfully', { eventId: id });
      return event;
    } catch (error) {
      logger.error('Failed to update event', { error, eventId: id, data });
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      logger.info('Deleting event', { eventId: id });
      
      // Delete related records first
      await this.prisma.eventAttendance.deleteMany({
        where: { eventId: id },
      });
      
      await this.prisma.event.delete({
        where: { id },
      });

      logger.info('Event deleted successfully', { eventId: id });
    } catch (error) {
      logger.error('Failed to delete event', { error, eventId: id });
      throw error;
    }
  }

  async rsvpToEvent(data: RSVPData): Promise<void> {
    try {
      logger.info('Processing RSVP', { userId: data.userId, eventId: data.eventId, status: data.status });
      
      // Check if user is already RSVP'd
      const existingRSVP = await this.prisma.eventAttendance.findUnique({
        where: {
          userId_eventId: {
            userId: data.userId,
            eventId: data.eventId,
          },
        },
      });

      if (existingRSVP) {
        // Update existing RSVP
        await this.prisma.eventAttendance.update({
          where: {
            userId_eventId: {
              userId: data.userId,
              eventId: data.eventId,
            },
          },
          data: {
            status: data.status,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new RSVP
        await this.prisma.eventAttendance.create({
          data: {
            userId: data.userId,
            eventId: data.eventId,
            status: data.status,
          },
        });
      }

      logger.info('RSVP processed successfully', { userId: data.userId, eventId: data.eventId });
    } catch (error) {
      logger.error('Failed to process RSVP', { error, data });
      throw error;
    }
  }

  async checkInAttendance(data: AttendanceCheckInData): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      logger.info('Processing attendance check-in', { qrCode: data.qrCode, eventId: data.eventId });
      
      // Find user by QR code
      const user = await this.prisma.user.findFirst({
        where: { qrCode: data.qrCode },
      });

      if (!user) {
        logger.warn('User not found for QR code', { qrCode: data.qrCode });
        return { success: false, message: 'Invalid QR code' };
      }

      // Check if event exists
      const event = await this.prisma.event.findUnique({
        where: { id: data.eventId },
      });

      if (!event) {
        logger.warn('Event not found', { eventId: data.eventId });
        return { success: false, message: 'Event not found' };
      }

      // Check if user is RSVP'd
      const rsvp = await this.prisma.eventAttendance.findUnique({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: data.eventId,
          },
        },
      });

      if (!rsvp || rsvp.status !== 'attending') {
        logger.warn('User not RSVP\'d as attending', { userId: user.id, eventId: data.eventId });
        return { success: false, message: 'User not RSVP\'d as attending' };
      }

      // Update attendance record
      await this.prisma.eventAttendance.update({
        where: {
          userId_eventId: {
            userId: user.id,
            eventId: data.eventId,
          },
        },
        data: {
          checkedIn: true,
          checkInTime: new Date(),
        },
      });

      logger.info('Attendance check-in successful', { userId: user.id, eventId: data.eventId });
      return { success: true, message: 'Check-in successful', user };
    } catch (error) {
      logger.error('Failed to process attendance check-in', { error, data });
      throw error;
    }
  }

  async getEventAttendance(eventId: string): Promise<any[]> {
    try {
      logger.info('Fetching event attendance', { eventId });
      
      const attendance = await this.prisma.eventAttendance.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              qrCode: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      return attendance;
    } catch (error) {
      logger.error('Failed to fetch event attendance', { error, eventId });
      throw error;
    }
  }
}
