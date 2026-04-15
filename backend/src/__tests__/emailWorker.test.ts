import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Job } from 'bullmq';

const mockSendEmail = vi.fn().mockResolvedValue({ messageId: 'msg-1' });
const mockSendTemplatedEmail = vi.fn().mockResolvedValue({ messageId: 'msg-2' });

vi.mock('@/services/emailService', () => ({
  emailService: {
    sendEmail: (...args: any[]) => mockSendEmail(...args),
    sendTemplatedEmail: (...args: any[]) => mockSendTemplatedEmail(...args),
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { processEmailJob, processEmailJobFailed, EmailJobPayload } from '../tasks/workers/emailWorker';

function makeJob(data: EmailJobPayload, id = 'job-1'): Job<EmailJobPayload> {
  return { id, data, attemptsMade: 0 } as unknown as Job<EmailJobPayload>;
}

describe('emailWorker', () => {
  beforeEach(() => {
    mockSendEmail.mockClear();
    mockSendTemplatedEmail.mockClear();
  });

  describe('processEmailJob', () => {
    it('sends templated email when template and templateData are present', async () => {
      const job = makeJob({
        to: 'alice@test.com',
        subject: '',
        body: '',
        template: 'rsvpConfirmed',
        templateData: {
          userName: 'Alice',
          eventTitle: 'CTF',
          eventDate: 'April 18',
          eventTime: '2 PM',
        },
      });

      const result = await processEmailJob(job);

      expect(mockSendTemplatedEmail).toHaveBeenCalledWith({
        to: 'alice@test.com',
        template: 'rsvpConfirmed',
        data: expect.objectContaining({ userName: 'Alice' }),
      });
      expect(mockSendEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, messageId: 'msg-2', recipient: 'alice@test.com' });
    });

    it('sends raw email when no template is provided', async () => {
      const job = makeJob({
        to: 'bob@test.com',
        subject: 'Hello',
        body: '<p>Hi Bob</p>',
      });

      const result = await processEmailJob(job);

      expect(mockSendEmail).toHaveBeenCalledWith({
        to: 'bob@test.com',
        subject: 'Hello',
        html: '<p>Hi Bob</p>',
      });
      expect(mockSendTemplatedEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, messageId: 'msg-1', recipient: 'bob@test.com' });
    });

    it('sends raw email when template is present but templateData is missing', async () => {
      const job = makeJob({
        to: 'bob@test.com',
        subject: 'Hello',
        body: '<p>Hi</p>',
        template: 'rsvpConfirmed',
        // no templateData
      });

      await processEmailJob(job);

      expect(mockSendEmail).toHaveBeenCalled();
      expect(mockSendTemplatedEmail).not.toHaveBeenCalled();
    });

    it('handles array recipients', async () => {
      const job = makeJob({
        to: ['a@test.com', 'b@test.com'],
        subject: 'Hi',
        body: '<p>Hey</p>',
      });

      await processEmailJob(job);

      expect(mockSendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: ['a@test.com', 'b@test.com'] }),
      );
    });

    it('throws when email sending fails', async () => {
      mockSendEmail.mockRejectedValueOnce(new Error('SMTP error'));

      const job = makeJob({
        to: 'alice@test.com',
        subject: 'Hi',
        body: '<p>Hey</p>',
      });

      await expect(processEmailJob(job)).rejects.toThrow('SMTP error');
    });

    it('throws when templated email sending fails', async () => {
      mockSendTemplatedEmail.mockRejectedValueOnce(new Error('Template error'));

      const job = makeJob({
        to: 'alice@test.com',
        subject: '',
        body: '',
        template: 'rsvpConfirmed',
        templateData: { userName: 'A', eventTitle: 'B', eventDate: 'C', eventTime: 'D' },
      });

      await expect(processEmailJob(job)).rejects.toThrow('Template error');
    });
  });

  describe('processEmailJobFailed', () => {
    it('logs the failure with job details', async () => {
      const { logger } = await import('@/utils/logger');
      const job = makeJob({ to: 'a@b.com', subject: 'x', body: 'y' }, 'job-99');
      (job as any).attemptsMade = 3;

      await processEmailJobFailed(job, new Error('permanent failure'));

      expect(logger.error).toHaveBeenCalledWith(
        'Email job job-99 failed permanently:',
        expect.objectContaining({
          error: 'permanent failure',
          attempts: 3,
        }),
      );
    });
  });
});
