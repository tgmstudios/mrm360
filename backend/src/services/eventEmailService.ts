import { Event, User } from '@prisma/client';
import { TaskManager } from '@/managers/taskManager';
import { EmailTemplateName, TemplateData } from './emailTemplates';
import { EmailAttachment } from '@/tasks/workers/emailWorker';
import { buildEventIcs } from '@/utils/ics';
import { logger } from '@/utils/logger';

const taskManager = new TaskManager();

function getTimeZone(): string {
  return process.env.TIMEZONE || 'UTC';
}

function formatEventDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: getTimeZone(),
  });
}

function formatEventTime(start: Date, end: Date): string {
  const timeZone = getTimeZone();
  const fmt = (d: Date) =>
    new Date(d).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
    });
  const tzLabel = new Date(start)
    .toLocaleTimeString('en-US', { timeZone, timeZoneName: 'short' })
    .split(' ')
    .pop();
  return `${fmt(start)} - ${fmt(end)}${tzLabel ? ` ${tzLabel}` : ''}`;
}

function buildTemplateData(user: { firstName: string; lastName: string; email: string }, event: Event, extra?: Record<string, any>): TemplateData {
  return {
    userName: user.firstName,
    eventTitle: event.title,
    eventDate: formatEventDate(event.startTime),
    eventTime: formatEventTime(event.startTime, event.endTime),
    eventDescription: event.description || undefined,
    ...extra,
  };
}

function buildEventIcsAttachment(event: Event, user: { email: string; firstName: string; lastName: string }): EmailAttachment {
  const ics = buildEventIcs({
    uid: `event-${event.id}@mrm360`,
    title: event.title,
    description: event.description || undefined,
    start: event.startTime,
    end: event.endTime,
    attendeeEmail: user.email,
    attendeeName: `${user.firstName} ${user.lastName}`.trim(),
  });
  return {
    filename: 'invite.ics',
    content: ics,
    contentType: 'text/calendar; charset=utf-8; method=REQUEST',
  };
}

async function enqueueEventEmail(
  to: string,
  template: EmailTemplateName,
  data: TemplateData,
  attachments?: EmailAttachment[]
): Promise<void> {
  try {
    await taskManager.enqueueEmailJob({
      to,
      subject: '',
      body: '',
      template,
      templateData: data,
      attachments,
    });
  } catch (error) {
    // Email failures should not block the main operation
    logger.error('Failed to enqueue event email', { error, template, to });
  }
}

export async function sendRsvpConfirmedEmail(user: { firstName: string; lastName: string; email: string }, event: Event): Promise<void> {
  await enqueueEventEmail(
    user.email,
    'rsvpConfirmed',
    buildTemplateData(user, event),
    [buildEventIcsAttachment(event, user)],
  );
}

export async function sendRsvpDeclinedEmail(user: { firstName: string; lastName: string; email: string }, event: Event): Promise<void> {
  await enqueueEventEmail(user.email, 'rsvpDeclined', buildTemplateData(user, event));
}

export async function sendRsvpWaitlistedEmail(user: { firstName: string; lastName: string; email: string }, event: Event): Promise<void> {
  await enqueueEventEmail(user.email, 'rsvpWaitlisted', buildTemplateData(user, event));
}

export async function sendWaitlistPromotedEmail(user: { firstName: string; lastName: string; email: string }, event: Event): Promise<void> {
  await enqueueEventEmail(
    user.email,
    'waitlistPromoted',
    buildTemplateData(user, event),
    [buildEventIcsAttachment(event, user)],
  );
}

export async function sendCheckInConfirmedEmail(
  user: { firstName: string; lastName: string; email: string },
  event: Event,
  seriesProgress?: string
): Promise<void> {
  await enqueueEventEmail(user.email, 'checkInConfirmed', buildTemplateData(user, event, { seriesProgress }));
}

export async function sendEventReminderEmail(user: { firstName: string; lastName: string; email: string }, event: Event): Promise<void> {
  await enqueueEventEmail(user.email, 'eventReminder', buildTemplateData(user, event));
}

export async function sendPostEventThankYouEmail(
  user: { firstName: string; lastName: string; email: string },
  event: Event,
  customMessage?: string
): Promise<void> {
  await enqueueEventEmail(user.email, 'postEventThankYou', buildTemplateData(user, event, { customMessage }));
}
