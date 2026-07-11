import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { createHash } from 'node:crypto';
import { DocumentScanStatus } from '@legacy/database';
import { QUEUE_NAMES } from '../queue.constants';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { AntivirusService } from '../../documents/antivirus.service';

export interface DocumentScanJobData {
  documentId: string;
}

/**
 * Traite un document après confirmation d'upload : recalcule le checksum
 * SHA-256 réel de l'objet MinIO (remplace le placeholder posé à la création)
 * et lance un scan antivirus (si clamd est configuré). En cas d'infection,
 * l'objet est purgé et le document neutralisé (soft delete).
 */
@Processor(QUEUE_NAMES.DOCUMENT_SCAN)
export class DocumentScanProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentScanProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly antivirus: AntivirusService,
  ) {
    super();
  }

  async process(job: Job<DocumentScanJobData>): Promise<void> {
    const { documentId } = job.data;
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document || document.deletedAt) {
      this.logger.warn(`Document ${documentId} introuvable ou supprimé — scan ignoré`);
      return;
    }

    // 1. Checksum réel (lecture indépendante du scan).
    const checksumStream = await this.storage.getObjectStream(document.storageKey);
    const hash = createHash('sha256');
    for await (const chunk of checksumStream) hash.update(chunk as Buffer);
    const checksumSha256 = hash.digest('hex');

    // 2. Scan antivirus (flux séparé).
    const scanStream = await this.storage.getObjectStream(document.storageKey);
    const verdict = await this.antivirus.scanStream(scanStream);

    if (verdict.status === 'INFECTED') {
      this.logger.error(`Document ${documentId} INFECTÉ (${verdict.signature}) — purge`);
      try {
        await this.storage.removeObject(document.storageKey);
      } catch (error) {
        this.logger.error(`Purge de l'objet infecté échouée : ${error instanceof Error ? error.message : error}`);
      }
      await this.prisma.document.update({
        where: { id: documentId },
        data: { scanStatus: DocumentScanStatus.INFECTED, scannedAt: new Date(), checksumSha256, deletedAt: new Date() },
      });
      return;
    }

    const scanStatus = verdict.status === 'CLEAN' ? DocumentScanStatus.CLEAN : DocumentScanStatus.SKIPPED;
    await this.prisma.document.update({
      where: { id: documentId },
      data: { scanStatus, scannedAt: new Date(), checksumSha256 },
    });
    this.logger.log(`Document ${documentId} traité (${scanStatus}, checksum ${checksumSha256.slice(0, 12)}…)`);
  }
}
