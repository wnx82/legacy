import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { ExportJobStatus } from '@legacy/database';
import { QUEUE_NAMES } from '../queue.constants';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';

export interface RgpdExportJobData {
  exportJobId: string;
  userId: string;
}

/**
 * Export RGPD (droit à la portabilité) : rassemble toutes les données
 * personnelles d'un utilisateur en un document JSON structuré, l'upload dans
 * MinIO puis marque l'`ExportJob` COMPLETED. Ne contient aucun secret
 * (mots de passe gérés par Keycloak, jamais stockés côté API).
 */
@Processor(QUEUE_NAMES.RGPD_EXPORT)
export class RgpdExportProcessor extends WorkerHost {
  private readonly logger = new Logger(RgpdExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {
    super();
  }

  async process(job: Job<RgpdExportJobData>): Promise<void> {
    const { exportJobId, userId } = job.data;
    this.logger.log(`Export RGPD pour l'utilisateur ${userId} [job ${exportJobId}]`);

    await this.prisma.exportJob.update({
      where: { id: exportJobId },
      data: { status: ExportJobStatus.PROCESSING },
    });

    try {
      const data = await this.collectUserData(userId);
      const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
      const objectKey = this.storage.buildObjectKey(`exports/rgpd/${userId}`, 'export-rgpd.json');
      await this.storage.putObject(objectKey, buffer, { 'Content-Type': 'application/json' });

      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: ExportJobStatus.COMPLETED, resultStorageKey: objectKey, completedAt: new Date() },
      });
      this.logger.log(`Export RGPD généré (${buffer.length} octets) -> ${objectKey}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Échec export RGPD [job ${exportJobId}] : ${message}`);
      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: ExportJobStatus.FAILED, errorMessage: message, completedAt: new Date() },
      });
      throw error;
    }
  }

  private async collectUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: { include: { organization: { select: { id: true, name: true, type: true } } } },
        consents: true,
        disclaimerAcceptances: true,
        notifications: true,
        livingProfile: {
          include: {
            trustedPersons: true,
            wishes: true,
            contacts: true,
            assets: true,
            insurances: true,
            subscriptions: true,
            pets: true,
            documents: { where: { deletedAt: null }, include: { category: { select: { key: true, label: true } } } },
          },
        },
      },
    });
    if (!user) throw new Error(`Utilisateur ${userId} introuvable`);

    const auditLogs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    return {
      exportedAt: new Date().toISOString(),
      notice:
        "Export RGPD des données personnelles détenues par Legacy. Les mots de passe " +
        'sont gérés par le fournisseur d\'identité (Keycloak) et ne figurent jamais ici.',
      account: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        locale: user.locale,
        createdAt: user.createdAt,
      },
      memberships: user.memberships,
      consents: user.consents,
      disclaimerAcceptances: user.disclaimerAcceptances,
      notifications: user.notifications,
      livingProfile: user.livingProfile,
      auditLogs,
    };
  }
}
