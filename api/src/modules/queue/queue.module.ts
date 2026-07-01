import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QUEUE_NAMES } from './queue.constants';
import { PdfExportProcessor } from './processors/pdf-export.processor';
import { ZipExportProcessor } from './processors/zip-export.processor';
import { EmailsProcessor } from './processors/emails.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.getOrThrow<string>('REDIS_URL') },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.PDF_EXPORT },
      { name: QUEUE_NAMES.ZIP_EXPORT },
      { name: QUEUE_NAMES.EMAILS },
      { name: QUEUE_NAMES.NOTIFICATIONS },
    ),
  ],
  providers: [PdfExportProcessor, ZipExportProcessor, EmailsProcessor],
  exports: [BullModule],
})
export class QueueModule {}
