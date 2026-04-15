import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Event } from '@prisma/client';

const { mockEnqueueEmailJob } = vi.hoisted(() => ({
  mockEnqueueEmailJob: vi.fn(),
}));

vi.mock('@/managers/taskManager', () => ({
  TaskManager: vi.fn(() => ({
    enqueueEmailJob: mockEnqueueEmailJob,
  })),
}));

vi.mock('@/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import {
  sendRsvpConfirmedEmail,
  sendRsvpDeclinedEmail,
  sendRsvpWaitlistedEmail,
  sendWaitlistPromotedEmail,
  sendCheckInConfirmedEmail,
  sendEventReminderEmail,
  sendPostEventThankYouEmail,
} from '../services/eventEmailService';

const mockUser = {
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@test.com',
};

const mockEvent = {
  id: 'evt-1',
  title: 'CTF Workshop',
  description: 'Hands-on CTF practice',
  startTime: new Date('2026-04-18T14:00:00Z'),
  endTime: new Date('2026-04-18T16:00:00Z'),
  location: null,
} as unknown as Event;

describe('eventEmailService', () => {
  beforeEach(() => {
    mockEnqueueEmailJob.mockClear();
    mockEnqueueEmailJob.mockResolvedValue('job-123');
  });

  describe('sendRsvpConfirmedEmail', () => {
    it('enqueues email with rsvpConfirmed template', async () => {
      await sendRsvpConfirmedEmail(mockUser, mockEvent);

      expect(mockEnqueueEmailJob).toHaveBeenCalledOnce();
      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.to).toBe('alice@test.com');
      expect(call.template).toBe('rsvpConfirmed');
      expect(call.templateData.userName).toBe('Alice');
      expect(call.templateData.eventTitle).toBe('CTF Workshop');
    });
  });

  describe('sendRsvpDeclinedEmail', () => {
    it('enqueues email with rsvpDeclined template', async () => {
      await sendRsvpDeclinedEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.template).toBe('rsvpDeclined');
      expect(call.to).toBe('alice@test.com');
    });
  });

  describe('sendRsvpWaitlistedEmail', () => {
    it('enqueues email with rsvpWaitlisted template', async () => {
      await sendRsvpWaitlistedEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.template).toBe('rsvpWaitlisted');
    });
  });

  describe('sendWaitlistPromotedEmail', () => {
    it('enqueues email with waitlistPromoted template', async () => {
      await sendWaitlistPromotedEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.template).toBe('waitlistPromoted');
    });
  });

  describe('sendCheckInConfirmedEmail', () => {
    it('enqueues email with checkInConfirmed template', async () => {
      await sendCheckInConfirmedEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.template).toBe('checkInConfirmed');
    });

    it('includes series progress in template data', async () => {
      await sendCheckInConfirmedEmail(mockUser, mockEvent, '3/5 events');

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.templateData.seriesProgress).toBe('3/5 events');
    });
  });

  describe('sendEventReminderEmail', () => {
    it('enqueues email with eventReminder template', async () => {
      await sendEventReminderEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.template).toBe('eventReminder');
    });
  });

  describe('sendPostEventThankYouEmail', () => {
    it('enqueues email with postEventThankYou template', async () => {
      await sendPostEventThankYouEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.template).toBe('postEventThankYou');
    });

    it('includes custom message in template data', async () => {
      await sendPostEventThankYouEmail(mockUser, mockEvent, 'Great job!');

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.templateData.customMessage).toBe('Great job!');
    });
  });

  describe('template data formatting', () => {
    it('formats event date as locale string', async () => {
      await sendRsvpConfirmedEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(typeof call.templateData.eventDate).toBe('string');
      expect(call.templateData.eventDate).toContain('2026');
    });

    it('formats event time as range', async () => {
      await sendRsvpConfirmedEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(typeof call.templateData.eventTime).toBe('string');
      expect(call.templateData.eventTime).toContain(' - ');
    });

    it('includes event description when present', async () => {
      await sendRsvpConfirmedEmail(mockUser, mockEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.templateData.eventDescription).toBe('Hands-on CTF practice');
    });

    it('sets description to undefined when event has none', async () => {
      const noDescEvent = { ...mockEvent, description: null } as unknown as Event;
      await sendRsvpConfirmedEmail(mockUser, noDescEvent);

      const call = mockEnqueueEmailJob.mock.calls[0][0];
      expect(call.templateData.eventDescription).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('does not throw when enqueue fails', async () => {
      mockEnqueueEmailJob.mockRejectedValueOnce(new Error('Redis down'));

      await expect(sendRsvpConfirmedEmail(mockUser, mockEvent)).resolves.toBeUndefined();
    });

    it('logs error when enqueue fails', async () => {
      const { logger } = await import('@/utils/logger');
      mockEnqueueEmailJob.mockRejectedValueOnce(new Error('Redis down'));

      await sendRsvpConfirmedEmail(mockUser, mockEvent);

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to enqueue event email',
        expect.objectContaining({ template: 'rsvpConfirmed', to: 'alice@test.com' }),
      );
    });
  });
});
