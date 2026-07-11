import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { QUEUE_NAMES } from '../queue/queue.constants';
import type { DocumentScanJobData } from '../queue/processors/document-scan.processor';
import type { RequestUploadUrlDto, UpdateDocumentDto } from '@legacy/shared';
import { randomUUID } from 'node:crypto';

interface UploadContext {
  userId: string;
  livingProfileId?: string;
  deathCaseId?: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly auditLogsService: AuditLogsService,
    @InjectQueue(QUEUE_NAMES.DOCUMENT_SCAN) private readonly scanQueue: Queue<DocumentScanJobData>,
  ) {}

  /**
   * Confirme la fin d'un upload direct navigateur -> MinIO. Déclenche le
   * recalcul du checksum réel et le scan antivirus asynchrone.
   */
  async confirmUpload(documentId: string, userId: string) {
    const document = await this.findOneOrThrow(documentId);
    await this.scanQueue.add('scan', { documentId: document.id });
    await this.auditLogsService.log({
      userId,
      action: 'document.upload_confirmed',
      resourceType: 'Document',
      resourceId: document.id,
    });
    return { id: document.id, scanStatus: document.scanStatus };
  }

  /**
   * Crée l'enregistrement du document et renvoie une URL PUT signée.
   * Le fichier ne transite jamais par l'API (upload direct navigateur -> MinIO).
   * Choix assumé pour le MVP : l'enregistrement est créé de manière
   * optimiste avant la fin de l'upload réel (voir docs/architecture.md).
   */
  async requestUploadUrl(dto: RequestUploadUrlDto, context: UploadContext) {
    const category = await this.prisma.documentCategory.findUnique({ where: { key: dto.categoryKey } });
    if (!category) throw new NotFoundException('Catégorie de document inconnue');

    const prefix = context.deathCaseId ? `death-cases/${context.deathCaseId}` : `living-profiles/${context.livingProfileId}`;
    const storageKey = this.storageService.buildObjectKey(prefix, dto.filename);

    const document = await this.prisma.document.create({
      data: {
        livingProfileId: context.livingProfileId,
        deathCaseId: context.deathCaseId,
        checklistTaskId: dto.checklistTaskId,
        categoryId: category.id,
        filename: dto.filename,
        mimeType: dto.mimeType,
        sizeBytes: dto.sizeBytes,
        storageKey,
        checksumSha256: randomUUID(), // recalculé côté worker après upload (Phase 2)
        uploadedById: context.userId,
      },
    });

    const uploadUrl = await this.storageService.getPresignedUploadUrl(storageKey);
    return { document, uploadUrl };
  }

  async getDownloadUrl(documentId: string, userId: string) {
    const document = await this.findOneOrThrow(documentId);
    const url = await this.storageService.getPresignedDownloadUrl(document.storageKey);

    await this.auditLogsService.log({
      userId,
      action: 'document.download',
      resourceType: 'Document',
      resourceId: document.id,
    });

    return { url, expiresInSeconds: 300 };
  }

  async findOne(documentId: string) {
    return this.findOneOrThrow(documentId);
  }

  async update(documentId: string, dto: UpdateDocumentDto) {
    await this.findOneOrThrow(documentId);
    const data: Record<string, unknown> = {};
    if (dto.categoryKey) {
      const category = await this.prisma.documentCategory.findUnique({ where: { key: dto.categoryKey } });
      if (!category) throw new NotFoundException('Catégorie de document inconnue');
      data.categoryId = category.id;
    }
    if (dto.checklistTaskId) data.checklistTaskId = dto.checklistTaskId;
    return this.prisma.document.update({ where: { id: documentId }, data });
  }

  async remove(documentId: string, userId: string) {
    const document = await this.findOneOrThrow(documentId);
    await this.storageService.removeObject(document.storageKey);
    await this.prisma.document.update({ where: { id: documentId }, data: { deletedAt: new Date() } });
    await this.auditLogsService.log({ userId, action: 'document.delete', resourceType: 'Document', resourceId: documentId });
    return { success: true };
  }

  private async findOneOrThrow(documentId: string) {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document || document.deletedAt) throw new NotFoundException('Document introuvable');
    return document;
  }
}
