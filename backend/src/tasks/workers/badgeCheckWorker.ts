import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { prisma } from '@/models/prismaClient';
import { SeriesManager } from '@/managers/seriesManager';
import { sendCheckInConfirmedEmail } from '@/services/eventEmailService';

export interface BadgeCheckJobPayload {
  userId: string;
  eventId: string;
}

export async function processBadgeCheckJob(job: Job<BadgeCheckJobPayload>) {
  const { userId, eventId } = job.data;

  logger.info(`Processing badge check job ${job.id}`, { userId, eventId });

  // Load event with series
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { series: true },
  });

  if (!event) {
    logger.warn(`Badge check: event ${eventId} not found`);
    return { success: false, reason: 'event_not_found' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    logger.warn(`Badge check: user ${userId} not found`);
    return { success: false, reason: 'user_not_found' };
  }

  // Build series progress for the email
  let seriesProgress: string | undefined;
  if (event.series) {
    const checkInCount = await prisma.checkIn.count({
      where: { userId, event: { seriesId: event.seriesId! } },
    });
    seriesProgress = `${checkInCount}/${event.series.requiredCheckIns} check-ins in "${event.series.name}"`;
  }

  // Send check-in confirmation email
  try {
    await sendCheckInConfirmedEmail(user, event, seriesProgress);
    logger.info(`Badge check job ${job.id}: check-in email enqueued`, { userId, eventId });
  } catch (emailErr) {
    logger.error(`Badge check job ${job.id}: failed to send check-in email`, { emailErr, userId, eventId });
  }

  // Check series badge threshold and issue if met
  if (event.seriesId) {
    try {
      const seriesManager = new SeriesManager(prisma);
      const badgeResult = await seriesManager.checkAndIssueBadge(userId, eventId);
      logger.info(`Badge check job ${job.id}: badge result`, { ...badgeResult, userId, eventId });
      return { success: true, badgeResult };
    } catch (badgeErr) {
      logger.error(`Badge check job ${job.id}: badge issue failed`, { badgeErr, userId, eventId });
      throw badgeErr; // Let BullMQ retry
    }
  }

  return { success: true, badgeResult: { issued: false, message: 'Event not in a series' } };
}

export async function processBadgeCheckJobFailed(job: Job<BadgeCheckJobPayload>, error: Error) {
  logger.error(`Badge check job ${job.id} failed permanently:`, {
    error: error.message,
    data: job.data,
    attempts: job.attemptsMade,
  });
}
