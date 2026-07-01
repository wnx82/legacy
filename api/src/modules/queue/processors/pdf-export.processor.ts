import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { QUEUE_NAMES } from '../queue.constants';

export interface PdfExportJobData {
  exportJobId: string;
  type: 'PDF_LIVING_PROFILE' | 'PDF_DEATH_CASE';
  targetId: string;
}

/**
 * Génère un PDF (dossier vivant ou dossier décès) de manière asynchrone.
 * Implémentation de référence à brancher sur une librairie de rendu HTML->PDF
 * (ex: Puppeteer ou @react-pdf/renderer) — volontairement non intégrée dans
 * ce scaffold pour garder l'image Docker légère. Voir docs/roadmap.md.
 */
@Processor(QUEUE_NAMES.PDF_EXPORT)
export class PdfExportProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfExportProcessor.name);

  async process(job: Job<PdfExportJobData>): Promise<void> {
    this.logger.log(`Génération PDF (${job.data.type}) pour ${job.data.targetId}`);
    // TODO Phase 1 : rendre un template HTML (React server-side) en PDF,
    // uploader le résultat dans MinIO, puis marquer l'ExportJob COMPLETED.
  }
}
