import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue.constants';

export interface ZipExportJobData {
  exportJobId: string;
  documentIds: string[];
}

/**
 * Constitue une archive ZIP des documents autorisés. Implémentation de
 * référence à brancher sur `archiver` en streaming direct vers MinIO.
 */
@Processor(QUEUE_NAMES.ZIP_EXPORT)
export class ZipExportProcessor extends WorkerHost {
  private readonly logger = new Logger(ZipExportProcessor.name);

  async process(job: Job<ZipExportJobData>): Promise<void> {
    this.logger.log(`Génération ZIP pour l'export ${job.data.exportJobId} (${job.data.documentIds.length} documents)`);
    // TODO Phase 1 : streamer chaque document depuis MinIO vers une archive
    // `archiver`, uploader le résultat, marquer l'ExportJob COMPLETED.
  }
}
