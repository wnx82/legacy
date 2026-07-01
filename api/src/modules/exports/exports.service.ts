import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { QUEUE_NAMES } from '../queue/queue.constants';
import type { PdfExportJobData } from '../queue/processors/pdf-export.processor';
import type { ZipExportJobData } from '../queue/processors/zip-export.processor';
import { ExportJobStatus, ExportJobType } from '@legacy/database';

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.PDF_EXPORT) private readonly pdfQueue: Queue<PdfExportJobData>,
    @InjectQueue(QUEUE_NAMES.ZIP_EXPORT) private readonly zipQueue: Queue<ZipExportJobData>,
  ) {}

  async requestPdfExport(
    requestedById: string,
    input: { type: 'PDF_LIVING_PROFILE' | 'PDF_DEATH_CASE'; targetId: string },
  ) {
    const exportJob = await this.prisma.exportJob.create({
      data: {
        requestedById,
        type: input.type === 'PDF_LIVING_PROFILE' ? ExportJobType.PDF_LIVING_PROFILE : ExportJobType.PDF_DEATH_CASE,
        status: ExportJobStatus.PENDING,
        relatedLivingProfileId: input.type === 'PDF_LIVING_PROFILE' ? input.targetId : undefined,
        relatedDeathCaseId: input.type === 'PDF_DEATH_CASE' ? input.targetId : undefined,
      },
    });
    await this.pdfQueue.add('generate', { exportJobId: exportJob.id, type: input.type, targetId: input.targetId });
    return exportJob;
  }

  async requestZipExport(requestedById: string, documentIds: string[]) {
    const exportJob = await this.prisma.exportJob.create({
      data: { requestedById, type: ExportJobType.ZIP_DOCUMENTS, status: ExportJobStatus.PENDING },
    });
    await this.zipQueue.add('generate', { exportJobId: exportJob.id, documentIds });
    return exportJob;
  }

  async findOne(id: string) {
    const exportJob = await this.prisma.exportJob.findUnique({ where: { id } });
    if (!exportJob) throw new NotFoundException('Export introuvable');
    return exportJob;
  }
}
