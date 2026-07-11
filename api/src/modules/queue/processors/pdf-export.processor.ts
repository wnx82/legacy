import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { ExportJobStatus } from '@legacy/database';
import { LEGACY_LEGAL_DISCLAIMER } from '@legacy/shared';
import { QUEUE_NAMES } from '../queue.constants';
import { PrismaService } from '../../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { renderPdf, type PdfSection } from '../../exports/pdf-renderer';

export interface PdfExportJobData {
  exportJobId: string;
  type: 'PDF_LIVING_PROFILE' | 'PDF_DEATH_CASE';
  targetId: string;
}

const fmtDate = (d: Date | null | undefined): string =>
  d ? new Date(d).toLocaleDateString('fr-BE', { timeZone: 'Europe/Brussels' }) : '—';

/**
 * Génère un PDF (dossier vivant ou dossier décès) de manière asynchrone :
 * charge les données depuis Prisma, produit un PDF vectoriel (pdfkit), l'upload
 * dans MinIO puis marque l'ExportJob COMPLETED (ou FAILED en cas d'erreur).
 */
@Processor(QUEUE_NAMES.PDF_EXPORT)
export class PdfExportProcessor extends WorkerHost {
  private readonly logger = new Logger(PdfExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {
    super();
  }

  async process(job: Job<PdfExportJobData>): Promise<void> {
    const { exportJobId, type, targetId } = job.data;
    this.logger.log(`Génération PDF (${type}) pour ${targetId} [job ${exportJobId}]`);

    await this.prisma.exportJob.update({
      where: { id: exportJobId },
      data: { status: ExportJobStatus.PROCESSING },
    });

    try {
      const { title, subtitle, sections, storagePrefix } =
        type === 'PDF_LIVING_PROFILE'
          ? await this.buildLivingProfile(targetId)
          : await this.buildDeathCase(targetId);

      const pdf = await renderPdf({
        title,
        subtitle,
        disclaimer: LEGACY_LEGAL_DISCLAIMER,
        generatedAt: new Date(),
        sections,
      });

      const objectKey = this.storage.buildObjectKey(`exports/${storagePrefix}`, `${type.toLowerCase()}.pdf`);
      await this.storage.putObject(objectKey, pdf, { 'Content-Type': 'application/pdf' });

      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: {
          status: ExportJobStatus.COMPLETED,
          resultStorageKey: objectKey,
          completedAt: new Date(),
        },
      });
      this.logger.log(`PDF généré (${pdf.length} octets) -> ${objectKey}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logger.error(`Échec génération PDF [job ${exportJobId}] : ${message}`);
      await this.prisma.exportJob.update({
        where: { id: exportJobId },
        data: { status: ExportJobStatus.FAILED, errorMessage: message, completedAt: new Date() },
      });
      throw error;
    }
  }

  private async buildLivingProfile(livingProfileId: string): Promise<{
    title: string;
    subtitle: string;
    storagePrefix: string;
    sections: PdfSection[];
  }> {
    const profile = await this.prisma.livingProfile.findUnique({
      where: { id: livingProfileId },
      include: {
        user: true,
        wishes: { orderBy: { order: 'asc' } },
        contacts: true,
        trustedPersons: true,
        documents: { where: { deletedAt: null }, include: { category: true } },
      },
    });
    if (!profile) throw new Error(`Dossier vivant ${livingProfileId} introuvable`);

    const sections: PdfSection[] = [
      {
        heading: 'Identité',
        lines: [
          `Titulaire : ${profile.user.firstName} ${profile.user.lastName}`,
          `E-mail : ${profile.user.email}`,
          `Date de naissance : ${fmtDate(profile.birthDate)}`,
          `Lieu de naissance : ${profile.birthPlace ?? '—'}`,
          `Adresse : ${profile.address ?? '—'}`,
          `Progression du dossier : ${profile.progressPercent}%`,
        ],
      },
      {
        heading: `Volontés (${profile.wishes.length})`,
        lines: profile.wishes.map((w) => `• [${w.category}] ${w.title ? w.title + ' — ' : ''}${w.content}`),
      },
      {
        heading: `Personnes de confiance (${profile.trustedPersons.length})`,
        lines: profile.trustedPersons.map(
          (t) => `• ${t.firstName} ${t.lastName}${t.relationship ? ` (${t.relationship})` : ''} — ${t.email}`,
        ),
      },
      {
        heading: `Contacts (${profile.contacts.length})`,
        lines: profile.contacts.map(
          (c) => `• [${c.category}] ${c.firstName} ${c.lastName ?? ''} ${c.phone ? '— ' + c.phone : ''}`.trim(),
        ),
      },
      {
        heading: `Documents (${profile.documents.length})`,
        lines: profile.documents.map((d) => `• ${d.filename} [${d.category.label}] (${fmtDate(d.createdAt)})`),
      },
    ];

    return {
      title: 'Dossier vivant',
      subtitle: `${profile.user.firstName} ${profile.user.lastName}`,
      storagePrefix: `living-profiles/${livingProfileId}`,
      sections,
    };
  }

  private async buildDeathCase(deathCaseId: string): Promise<{
    title: string;
    subtitle: string;
    storagePrefix: string;
    sections: PdfSection[];
  }> {
    const deathCase = await this.prisma.deathCase.findUnique({
      where: { id: deathCaseId },
      include: {
        organization: true,
        tasks: { orderBy: { order: 'asc' } },
        documents: { where: { deletedAt: null }, include: { category: true } },
        familyInvites: true,
      },
    });
    if (!deathCase) throw new Error(`Dossier décès ${deathCaseId} introuvable`);

    const doneTasks = deathCase.tasks.filter((t) => t.status === 'DONE').length;
    const sections: PdfSection[] = [
      {
        heading: 'Défunt',
        lines: [
          `Nom : ${deathCase.deceasedFirstName} ${deathCase.deceasedLastName}`,
          `Date de naissance : ${fmtDate(deathCase.deceasedBirthDate)}`,
          `Date de décès : ${fmtDate(deathCase.dateOfDeath)}`,
          `Lieu de décès : ${deathCase.placeOfDeath ?? '—'}`,
          `Commune : ${deathCase.municipality ?? '—'}`,
          `Statut du dossier : ${deathCase.status}`,
          `Pompes funèbres : ${deathCase.organization?.name ?? '—'}`,
        ],
      },
      {
        heading: `Checklist des formalités (${doneTasks}/${deathCase.tasks.length} terminées)`,
        lines: deathCase.tasks.map((t) => `• [${t.status}] ${t.title} — priorité ${t.priority}`),
      },
      {
        heading: `Documents (${deathCase.documents.length})`,
        lines: deathCase.documents.map((d) => `• ${d.filename} [${d.category.label}] (${fmtDate(d.createdAt)})`),
      },
      {
        heading: `Proches invités (${deathCase.familyInvites.length})`,
        lines: deathCase.familyInvites.map(
          (f) => `• ${f.firstName ?? ''} ${f.lastName ?? ''} ${f.email} — ${f.status}`.trim(),
        ),
      },
    ];

    return {
      title: 'Dossier décès',
      subtitle: `${deathCase.deceasedFirstName} ${deathCase.deceasedLastName}`,
      storagePrefix: `death-cases/${deathCaseId}`,
      sections,
    };
  }
}
