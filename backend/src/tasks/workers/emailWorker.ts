import { Job } from 'bullmq';
import { logger } from '@/utils/logger';
import { emailService } from '@/services/emailService';
import { EmailTemplateName, TemplateData } from '@/services/emailTemplates';

export interface EmailAttachment {
  filename: string;
  content: string;
  contentType?: string;
}

export interface EmailJobPayload {
  to: string | string[];
  subject: string;
  body: string;
  template?: EmailTemplateName;
  templateData?: TemplateData;
  attachments?: EmailAttachment[];
}

export async function processEmailJob(job: Job<EmailJobPayload>) {
  const { to, subject, body, template, templateData, attachments } = job.data;

  logger.info(`Processing email job ${job.id}`, { to, subject, template });

  try {
    if (template && templateData) {
      const result = await emailService.sendTemplatedEmail({
        to,
        template,
        data: templateData,
        attachments,
      });
      logger.info(`Email job ${job.id} completed (template: ${template})`, { messageId: result.messageId });
      return { success: true, messageId: result.messageId, recipient: to };
    }

    const result = await emailService.sendEmail({
      to,
      subject,
      html: body,
      attachments,
    });
    logger.info(`Email job ${job.id} completed`, { messageId: result.messageId });
    return { success: true, messageId: result.messageId, recipient: to };
  } catch (error) {
    logger.error(`Email job ${job.id} failed:`, error);
    throw error;
  }
}

export async function processEmailJobFailed(job: Job<EmailJobPayload>, error: Error) {
  logger.error(`Email job ${job.id} failed permanently:`, {
    error: error.message,
    data: job.data,
    attempts: job.attemptsMade
  });
}
