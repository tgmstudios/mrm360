import { PrismaClient, WorkshopSeries } from '@prisma/client';
import { logger } from '@/utils/logger';
import { sendBadgeInvite, getInvitesForBadge } from '@/services/openbadgeService';

export interface CreateSeriesData {
  name: string;
  description?: string;
  badgeClassId: string;
  requiredCheckIns: number;
  autoIssue?: boolean;
}

export interface UpdateSeriesData extends Partial<CreateSeriesData> {}

export class SeriesManager {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createSeries(data: CreateSeriesData): Promise<WorkshopSeries> {
    logger.info('Creating workshop series', { name: data.name });
    const series = await this.prisma.workshopSeries.create({
      data: {
        name: data.name,
        description: data.description,
        badgeClassId: data.badgeClassId,
        requiredCheckIns: data.requiredCheckIns,
        autoIssue: data.autoIssue ?? true,
      },
      include: { events: true },
    });
    logger.info('Workshop series created', { seriesId: series.id });
    return series;
  }

  async getSeriesById(id: string): Promise<WorkshopSeries | null> {
    return this.prisma.workshopSeries.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            checkIns: true,
            rsvps: { include: { user: true } },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });
  }

  async getAllSeries(): Promise<WorkshopSeries[]> {
    return this.prisma.workshopSeries.findMany({
      include: {
        events: {
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get per-member progress across all events in a series.
   * Returns each member who has at least one check-in, which events they
   * checked in to, and whether they've met the badge threshold.
   */
  async getSeriesProgress(seriesId: string): Promise<{
    members: {
      userId: string;
      email: string;
      firstName: string;
      lastName: string;
      checkInCount: number;
      requiredCheckIns: number;
      completed: boolean;
      badgeStatus: 'none' | 'invited' | 'issued';
      checkedInEventIds: string[];
    }[];
    events: { id: string; title: string; startTime: Date }[];
  }> {
    const series = await this.prisma.workshopSeries.findUnique({
      where: { id: seriesId },
      include: {
        events: {
          include: {
            checkIns: {
              include: {
                user: {
                  select: { id: true, email: true, firstName: true, lastName: true },
                },
              },
            },
          },
          orderBy: { startTime: 'asc' },
        },
      },
    });

    if (!series) {
      throw new Error('Series not found');
    }

    const events = series.events.map((e) => ({
      id: e.id,
      title: e.title,
      startTime: e.startTime,
    }));

    // Aggregate check-ins per user
    const userMap = new Map<
      string,
      {
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        checkedInEventIds: Set<string>;
      }
    >();

    for (const event of series.events) {
      for (const checkIn of event.checkIns) {
        const user = (checkIn as any).user;
        if (!user) continue;
        let entry = userMap.get(user.id);
        if (!entry) {
          entry = {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            checkedInEventIds: new Set(),
          };
          userMap.set(user.id, entry);
        }
        entry.checkedInEventIds.add(event.id);
      }
    }

    // Fetch existing invites to determine badge status per user
    // 'issued' = invite claimed (assertionId populated)
    // 'invited' = invite sent, pending claim
    // 'none' = no invite
    const badgeStatusMap = new Map<string, 'invited' | 'issued'>();
    try {
      const invites = await getInvitesForBadge(series.badgeClassId);
      for (const inv of invites) {
        if (!inv.recipientEmail) continue;
        const email = inv.recipientEmail.toLowerCase();
        if (inv.status === 'claimed' && inv.assertionId) {
          badgeStatusMap.set(email, 'issued');
        } else if (inv.status === 'pending' && !badgeStatusMap.has(email)) {
          badgeStatusMap.set(email, 'invited');
        }
      }
    } catch (err) {
      logger.warn('Could not fetch invites for badge status', { err });
    }

    const members = Array.from(userMap.values()).map((entry) => ({
      userId: entry.userId,
      email: entry.email,
      firstName: entry.firstName,
      lastName: entry.lastName,
      checkInCount: entry.checkedInEventIds.size,
      requiredCheckIns: series.requiredCheckIns,
      completed: entry.checkedInEventIds.size >= series.requiredCheckIns,
      badgeStatus: (badgeStatusMap.get(entry.email.toLowerCase()) || 'none') as 'none' | 'invited' | 'issued',
      checkedInEventIds: Array.from(entry.checkedInEventIds),
    }));

    // Sort: completed first, then by check-in count desc
    members.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? -1 : 1;
      return b.checkInCount - a.checkInCount;
    });

    return { members, events };
  }

  async updateSeries(id: string, data: UpdateSeriesData): Promise<WorkshopSeries> {
    logger.info('Updating workshop series', { seriesId: id });
    return this.prisma.workshopSeries.update({
      where: { id },
      data,
      include: { events: true },
    });
  }

  async deleteSeries(id: string): Promise<void> {
    logger.info('Deleting workshop series', { seriesId: id });
    // Unlink events first
    await this.prisma.event.updateMany({
      where: { seriesId: id },
      data: { seriesId: null },
    });
    await this.prisma.workshopSeries.delete({ where: { id } });
  }

  /**
   * After a user checks in to an event in a series, check if they've hit
   * the required number of check-ins. If so, send a badge invite.
   */
  async checkAndIssueBadge(userId: string, eventId: string): Promise<{ issued: boolean; message: string }> {
    // Get the event and its series
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { series: true },
    });

    if (!event?.seriesId || !event.series) {
      return { issued: false, message: 'Event not in a series' };
    }

    const series = event.series;

    // Skip if series is set to manual badge issuing
    if (!series.autoIssue) {
      return { issued: false, message: 'Series uses manual badge issuing' };
    }

    // Count how many distinct events in this series the user has checked in to
    const checkInCount = await this.prisma.checkIn.count({
      where: {
        userId,
        event: { seriesId: series.id },
      },
    });

    logger.info('Series badge progress', {
      userId,
      seriesId: series.id,
      checkInCount,
      required: series.requiredCheckIns,
    });

    if (checkInCount < series.requiredCheckIns) {
      return {
        issued: false,
        message: `${checkInCount}/${series.requiredCheckIns} check-ins in series "${series.name}"`,
      };
    }

    // Check if invite was already sent to this user (avoid duplicates)
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { issued: false, message: 'User not found' };
      }

      const existingInvites = await getInvitesForBadge(series.badgeClassId);
      const alreadyInvited = existingInvites.some(
        (inv) => inv.recipientEmail?.toLowerCase() === user.email.toLowerCase()
          && (inv.status === 'pending' || inv.status === 'claimed'),
      );

      if (alreadyInvited) {
        logger.info('Badge invite already sent to user', { userId, seriesId: series.id });
        return { issued: false, message: 'Badge invite already sent' };
      }

      // Send badge invite
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      await sendBadgeInvite(series.badgeClassId, user.email, fullName || undefined);

      logger.info('Badge invite sent', { userId, seriesId: series.id, email: user.email });
      return {
        issued: true,
        message: `Badge invite sent for series "${series.name}"`,
      };
    } catch (error) {
      logger.error('Failed to send badge invite', { error, userId, seriesId: series.id });
      return { issued: false, message: 'Failed to send badge invite' };
    }
  }
}
