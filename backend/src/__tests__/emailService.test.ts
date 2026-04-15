import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'test-msg-id' });
const mockVerify = vi.fn().mockResolvedValue(true);

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: mockSendMail, verify: mockVerify })),
  },
}));

vi.mock('@/utils/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

describe('EmailService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mockSendMail.mockClear();
    mockVerify.mockClear();
    mockSendMail.mockResolvedValue({ messageId: 'test-msg-id' });
    mockVerify.mockResolvedValue(true);
  });

  async function loadService() {
    const mod = await import('../services/emailService');
    return mod.emailService;
  }

  describe('sendEmail', () => {
    it('sends email with correct parameters', async () => {
      vi.stubEnv('SMTP_HOST', 'smtp.test.com');
      vi.stubEnv('SMTP_PORT', '587');
      vi.stubEnv('SMTP_USER', 'user');
      vi.stubEnv('SMTP_PASS', 'pass');
      vi.stubEnv('SMTP_FROM', 'Test <test@test.com>');

      const service = await loadService();
      const result = await service.sendEmail({
        to: 'alice@test.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
      });

      expect(result.messageId).toBe('test-msg-id');
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'Test <test@test.com>',
        to: 'alice@test.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        replyTo: undefined,
      });
    });

    it('joins array recipients', async () => {
      vi.stubEnv('SMTP_HOST', 'smtp.test.com');
      vi.stubEnv('SMTP_USER', 'user');
      vi.stubEnv('SMTP_PASS', 'pass');

      const service = await loadService();
      await service.sendEmail({
        to: ['a@test.com', 'b@test.com'],
        subject: 'Hi',
        html: '<p>Hey</p>',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'a@test.com, b@test.com' }),
      );
    });

    it('passes replyTo when provided', async () => {
      vi.stubEnv('SMTP_HOST', 'smtp.test.com');

      const service = await loadService();
      await service.sendEmail({
        to: 'alice@test.com',
        subject: 'Hi',
        html: '<p>Hey</p>',
        replyTo: 'reply@test.com',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ replyTo: 'reply@test.com' }),
      );
    });

    it('uses default from address when SMTP_FROM not set', async () => {
      vi.stubEnv('SMTP_HOST', 'smtp.test.com');
      delete process.env.SMTP_FROM;

      const service = await loadService();
      await service.sendEmail({
        to: 'alice@test.com',
        subject: 'Hi',
        html: '<p>Hey</p>',
      });

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({ from: 'MRM360 <noreply@mrm360.local>' }),
      );
    });

    it('throws when SMTP_HOST is not set', async () => {
      delete process.env.SMTP_HOST;

      const service = await loadService();
      await expect(
        service.sendEmail({ to: 'a@b.com', subject: 'x', html: 'y' }),
      ).rejects.toThrow('SMTP_HOST');
    });
  });

  describe('sendTemplatedEmail', () => {
    it('renders template and sends email', async () => {
      vi.stubEnv('SMTP_HOST', 'smtp.test.com');

      const service = await loadService();
      const result = await service.sendTemplatedEmail({
        to: 'alice@test.com',
        template: 'rsvpConfirmed',
        data: {
          userName: 'Alice',
          eventTitle: 'CTF',
          eventDate: 'April 18',
          eventTime: '2 PM',
        },
      });

      expect(result.messageId).toBe('test-msg-id');
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: "You're confirmed for CTF",
          to: 'alice@test.com',
        }),
      );
    });

    it('throws on unknown template', async () => {
      vi.stubEnv('SMTP_HOST', 'smtp.test.com');

      const service = await loadService();
      await expect(
        service.sendTemplatedEmail({
          to: 'a@b.com',
          template: 'nonexistent' as any,
          data: { userName: 'X', eventTitle: 'Y', eventDate: 'Z', eventTime: 'W' },
        }),
      ).rejects.toThrow('Unknown email template: nonexistent');
    });
  });

  describe('verifyConnection', () => {
    it('returns true when connection succeeds', async () => {
      vi.stubEnv('SMTP_HOST', 'smtp.test.com');

      const service = await loadService();
      const result = await service.verifyConnection();
      expect(result).toBe(true);
    });

    it('returns false when connection fails', async () => {
      vi.stubEnv('SMTP_HOST', 'smtp.test.com');
      mockVerify.mockRejectedValueOnce(new Error('connection refused'));

      const service = await loadService();
      const result = await service.verifyConnection();
      expect(result).toBe(false);
    });
  });
});
