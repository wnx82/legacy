import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue.constants';
import { MailerService } from '../../mailer/mailer.service';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

@Processor(QUEUE_NAMES.EMAILS)
export class EmailsProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    await this.mailerService.send(job.data);
  }
}
