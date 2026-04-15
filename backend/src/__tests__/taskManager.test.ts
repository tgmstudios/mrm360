import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockAdd, mockGetJob, mockGetWaiting, mockGetActive,
  mockGetCompleted, mockGetFailed, mockGetDelayed, mockClean,
} = vi.hoisted(() => ({
  mockAdd: vi.fn(),
  mockGetJob: vi.fn(),
  mockGetWaiting: vi.fn(),
  mockGetActive: vi.fn(),
  mockGetCompleted: vi.fn(),
  mockGetFailed: vi.fn(),
  mockGetDelayed: vi.fn(),
  mockClean: vi.fn(),
}));

vi.mock('../tasks/queue', () => {
  const q = {
    add: mockAdd,
    getJob: mockGetJob,
    getWaiting: mockGetWaiting,
    getActive: mockGetActive,
    getCompleted: mockGetCompleted,
    getFailed: mockGetFailed,
    getDelayed: mockGetDelayed,
    clean: mockClean,
  };
  return {
    emailQueue: q,
    qrCodeQueue: q,
    syncGroupsQueue: q,
    provisionQueue: q,
    paymentStatusQueue: q,
  };
});

vi.mock('@/models/prismaClient', () => ({ prisma: {} }));

vi.mock('@/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

import { TaskManager } from '../managers/taskManager';

describe('TaskManager', () => {
  let tm: TaskManager;

  beforeEach(() => {
    tm = new TaskManager();
    mockAdd.mockReset().mockResolvedValue({ id: 'job-42' });
    mockGetJob.mockReset();
    mockGetWaiting.mockReset().mockResolvedValue([]);
    mockGetActive.mockReset().mockResolvedValue([]);
    mockGetCompleted.mockReset().mockResolvedValue([]);
    mockGetFailed.mockReset().mockResolvedValue([]);
    mockGetDelayed.mockReset().mockResolvedValue([]);
    mockClean.mockReset().mockResolvedValue([]);
  });

  describe('enqueueEmailJob', () => {
    it('adds job to email queue with default options', async () => {
      const jobId = await tm.enqueueEmailJob({
        to: 'alice@test.com',
        subject: 'Hello',
        body: '<p>Hi</p>',
      });

      expect(jobId).toBe('job-42');
      expect(mockAdd).toHaveBeenCalledWith('send-email', {
        to: 'alice@test.com',
        subject: 'Hello',
        body: '<p>Hi</p>',
      }, {
        delay: 0,
        priority: 0,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      });
    });

    it('passes custom options', async () => {
      await tm.enqueueEmailJob(
        { to: 'a@b.com', subject: 'x', body: 'y' },
        { delay: 5000, priority: 1, attempts: 5 },
      );

      expect(mockAdd).toHaveBeenCalledWith('send-email', expect.anything(), expect.objectContaining({
        delay: 5000,
        priority: 1,
        attempts: 5,
      }));
    });

    it('includes template data when provided', async () => {
      await tm.enqueueEmailJob({
        to: 'a@b.com',
        subject: '',
        body: '',
        template: 'rsvpConfirmed',
        templateData: { userName: 'Alice' },
      });

      expect(mockAdd).toHaveBeenCalledWith('send-email', expect.objectContaining({
        template: 'rsvpConfirmed',
        templateData: { userName: 'Alice' },
      }), expect.anything());
    });

    it('throws when queue add fails', async () => {
      mockAdd.mockRejectedValueOnce(new Error('Redis down'));

      await expect(tm.enqueueEmailJob({
        to: 'a@b.com',
        subject: 'x',
        body: 'y',
      })).rejects.toThrow('Redis down');
    });
  });

  describe('enqueueQRCodeJob', () => {
    it('adds job to qr-code queue', async () => {
      const jobId = await tm.enqueueQRCodeJob({
        userId: 'user-1',
        userEmail: 'alice@test.com',
        userName: 'Alice',
      });

      expect(jobId).toBe('job-42');
      expect(mockAdd).toHaveBeenCalledWith('generate-qr-code', expect.objectContaining({
        userId: 'user-1',
      }), expect.anything());
    });
  });

  describe('enqueueSyncGroupsJob', () => {
    it('adds job to sync-groups queue', async () => {
      const jobId = await tm.enqueueSyncGroupsJob({ userId: 'user-1', force: true });

      expect(jobId).toBe('job-42');
      expect(mockAdd).toHaveBeenCalledWith('sync-groups', { userId: 'user-1', force: true }, expect.objectContaining({
        backoff: { type: 'exponential', delay: 5000 },
      }));
    });
  });

  describe('enqueuePaymentStatusJob', () => {
    it('adds job to payment-status queue', async () => {
      const jobId = await tm.enqueuePaymentStatusJob({ type: 'check-expired' });

      expect(jobId).toBe('job-42');
      expect(mockAdd).toHaveBeenCalledWith('payment-status', { type: 'check-expired' }, expect.anything());
    });
  });

  describe('getJobStatus', () => {
    it('returns job status for email queue', async () => {
      mockGetJob.mockResolvedValue({
        id: 'job-1',
        name: 'send-email',
        data: { to: 'a@b.com' },
        timestamp: 123,
        processedOn: 456,
        finishedOn: 789,
        failedReason: null,
        getState: vi.fn().mockResolvedValue('completed'),
        progress: vi.fn().mockResolvedValue(100),
      });

      const status = await tm.getJobStatus('email', 'job-1');

      expect(status.status).toBe('completed');
      expect(status.progress).toBe(100);
      expect(status.id).toBe('job-1');
    });

    it('returns not_found for missing job', async () => {
      mockGetJob.mockResolvedValue(null);

      const status = await tm.getJobStatus('email', 'missing');
      expect(status).toEqual({ status: 'not_found' });
    });

    it('throws for unknown queue name', async () => {
      await expect(tm.getJobStatus('unknown', 'job-1')).rejects.toThrow('Unknown queue: unknown');
    });

    it('works for all valid queue names', async () => {
      mockGetJob.mockResolvedValue(null);

      for (const name of ['email', 'qr-code', 'sync-groups', 'payment-status']) {
        const status = await tm.getJobStatus(name, 'x');
        expect(status).toEqual({ status: 'not_found' });
      }
    });
  });

  describe('getQueueStats', () => {
    it('returns aggregated stats', async () => {
      mockGetWaiting.mockResolvedValue([1, 2]);
      mockGetActive.mockResolvedValue([3]);
      mockGetCompleted.mockResolvedValue([4, 5, 6]);
      mockGetFailed.mockResolvedValue([]);
      mockGetDelayed.mockResolvedValue([7]);

      const stats = await tm.getQueueStats('email');

      expect(stats).toEqual({
        waiting: 2,
        active: 1,
        completed: 3,
        failed: 0,
        delayed: 1,
        total: 7,
      });
    });

    it('throws for unknown queue name', async () => {
      await expect(tm.getQueueStats('unknown')).rejects.toThrow('Unknown queue: unknown');
    });
  });

  describe('retryFailedJob', () => {
    it('retries the job', async () => {
      const mockRetry = vi.fn();
      mockGetJob.mockResolvedValue({ retry: mockRetry });

      await tm.retryFailedJob('email', 'job-1');

      expect(mockRetry).toHaveBeenCalled();
    });

    it('throws when job not found', async () => {
      mockGetJob.mockResolvedValue(null);

      await expect(tm.retryFailedJob('email', 'missing')).rejects.toThrow('Job not found');
    });

    it('throws for unknown queue', async () => {
      await expect(tm.retryFailedJob('unknown', 'job-1')).rejects.toThrow('Unknown queue: unknown');
    });
  });

  describe('clearCompletedJobs', () => {
    it('cleans completed jobs from queue', async () => {
      await tm.clearCompletedJobs('email');

      expect(mockClean).toHaveBeenCalledWith(0, 1000, 'completed');
    });

    it('throws for unknown queue', async () => {
      await expect(tm.clearCompletedJobs('unknown')).rejects.toThrow('Unknown queue: unknown');
    });
  });
});
