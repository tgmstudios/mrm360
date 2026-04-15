import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '@/utils/logger';
import { emailTemplates, EmailTemplateName, TemplateData } from './emailTemplates';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendTemplatedEmailOptions {
  to: string | string[];
  template: EmailTemplateName;
  data: TemplateData;
  replyTo?: string;
}

class EmailService {
  private transporter: Transporter | null = null;

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST;
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!host) {
        throw new Error('SMTP_HOST environment variable is not set. Email sending is disabled.');
      }

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
      });
    }
    return this.transporter;
  }

  private getFromAddress(): string {
    return process.env.SMTP_FROM || 'MRM360 <noreply@mrm360.local>';
  }

  async sendEmail(options: SendEmailOptions): Promise<{ messageId: string }> {
    const transporter = this.getTransporter();
    const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

    logger.info('Sending email', { to: recipients, subject: options.subject });

    const result = await transporter.sendMail({
      from: this.getFromAddress(),
      to: recipients,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });

    logger.info('Email sent', { messageId: result.messageId, to: recipients });
    return { messageId: result.messageId };
  }

  async sendTemplatedEmail(options: SendTemplatedEmailOptions): Promise<{ messageId: string }> {
    const templateFn = emailTemplates[options.template];
    if (!templateFn) {
      throw new Error(`Unknown email template: ${options.template}`);
    }

    const { subject, html } = templateFn(options.data);

    return this.sendEmail({
      to: options.to,
      subject,
      html,
      replyTo: options.replyTo,
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      logger.info('SMTP connection verified');
      return true;
    } catch (error) {
      logger.error('SMTP connection verification failed', { error });
      return false;
    }
  }
}

export const emailService = new EmailService();
