import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { PassThrough } from 'node:stream';
import archiver from 'archiver';
import { ExportJobStatus } from '@legacy/database';
import { QUEUE_NAMES } from '../queue.constants';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

export interface ZipExportJobData {
  exportJobId: string;
  documentIds: string[];
}

/**
 * Constitue une archive ZIP des documents demandés : chaque document est
 * streamé depuis MinIO vers l'archive `archiver`, elle-même streamée vers un
 * nouvel objet MinIO. L'ExportJob est marqué COMPLETED (ou FAILED).
 */
@Processor(QUEUE_NAMES.ZIP_EXPORT)
export class ZipExportProcessor extends WorkerHost {
  private readonly logger = new Logger(ZipExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {
    super();
  }

  async process(job: Job<ZipExportJobData>): Promise<void> {
    const { exportJobId, documentIds } = job.data;
    this.logger.log(`Génération ZIP pour l'export ${exportJobId} (${documentIds.length} documents)`);

    await this.prisma.exportJob.update({
      where: { id: exportJobId },
      data: { status: ExportJobStatus.PROCESSING },
    });

    try {
      const documents = await this.prisma.document.findMany({
        where: { id: { in: documentIds }, deletedAt: null },
      });
      if (documents.length === 0) throw new Error('Aucun document valide à archiver');

      const objectKey = this.storage.buildObjectKey('exports/zip', `documents-${exportJobId}.zip`);

      const archive = archiver('zip', { zlib: { level: 9 } });
      const passthrough = new PassThrough();
      archive.pipe(passthrough);

      // On lance l'upload du flux ZIP en parallèle de son alimentation.
      const uploadPromise = this.storage.putObject(objectKey, passthrough, {
        'Content-Type': 'application/zip',
      });

      const usedNames = new Set<string>();
      for (const doc of documents) {
        const stream = await this.storage.getObjectStream(doc.storageKey);
        // Évite les collisions de noms dans l'archive.
        let entryName = doc.filename;
        let suffix = 1;
        while (usedNames.has(entryName)) {
          const dot = doc.filename.lastIndexOf('.');
          entryName =
            dot > 0
              ? `${doc.filename.slice(0, dot)}-${suffix}${doc.filename.slice(dot)}`
              : `${doc.filename}-${suffix}`;
          suffix += 1;
        }
        usedNames.add(entryName);
        archive.append(stream, { name: entryName });
      }

      await archive.finalize();
      await uploadPromise;

      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: {
          status: ExportJobStatus.COMPLETED,
          resultStorageKey: objectKey,
          completedAt: new Date(),
        },
      });
      this.logger.log(`ZIP généré (${documents.length} documents) -> ${objectKey}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Échec génération ZIP [job ${exportJobId}] : ${message}`);
      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: ExportJobStatus.FAILED, errorMessage: message, completedAt: new Date() },
      });
      throw error;
    }
  }
}
