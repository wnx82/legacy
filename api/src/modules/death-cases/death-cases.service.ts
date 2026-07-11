import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { QUEUE_NAMES } from '../queue/queue.constants';
import type { EmailJobData } from '../queue/processors/emails.processor';
import { familyInviteEmail } from '../mailer/templates';
import type {
  CreateDeathCaseDto,
  UpdateDeathCaseDto,
  CreateChecklistTaskDto,
  UpdateChecklistTaskDto,
  InviteFamilyMemberDto,
  CreateNoteDto,
  RequestUploadUrlDto,
} from '@legacy/shared';
import { ForbiddenException } from '@nestjs/common';
import { DeathCaseStatus, InvitationStatus } from '@legacy/database';
import { UserRole, type AuthenticatedUser } from '@legacy/shared';
import { randomBytes, randomUUID } from 'node:crypto';

const PRO_ROLES: string[] = [UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN, UserRole.FUNERAL_ADVISOR];

@Injectable()
export class DeathCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
    private readonly auditLogsService: AuditLogsService,
    private readonly configService: ConfigService,
    @InjectQueue(QUEUE_NAMES.EMAILS) private readonly emailsQueue: Queue<EmailJobData>,
  ) {}

  async findAll(organizationId?: string) {
    return this.prisma.deathCase.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const deathCase = await this.prisma.deathCase.findUnique({ where: { id } });
    if (!deathCase) throw new NotFoundException('Dossier décès introuvable');
    return deathCase;
  }

  async create(dto: CreateDeathCaseDto, createdByUserId: string) {
    const deathCase = await this.prisma.deathCase.create({
      data: {
        deceasedFirstName: dto.deceasedFirstName,
        deceasedLastName: dto.deceasedLastName,
        deceasedBirthDate: dto.deceasedBirthDate,
        dateOfDeath: dto.dateOfDeath,
        placeOfDeath: dto.placeOfDeath,
        municipality: dto.municipality,
        organizationId: dto.organizationId,
        createdByUserId,
      },
    });

    if (dto.checklistTemplateId) {
      await this.applyChecklistTemplate(deathCase.id, dto.checklistTemplateId);
    }

    await this.auditLogsService.log({
      userId: createdByUserId,
      organizationId: dto.organizationId,
      deathCaseId: deathCase.id,
      action: 'death_case.create',
      resourceType: 'DeathCase',
      resourceId: deathCase.id,
    });

    return deathCase;
  }

  private async applyChecklistTemplate(deathCaseId: string, templateId: string) {
    const items = await this.prisma.checklistTemplateItem.findMany({ where: { templateId }, orderBy: { order: 'asc' } });
    if (items.length === 0) return;
    await this.prisma.checklistTask.createMany({
      data: items.map((item) => ({
        deathCaseId,
        title: item.title,
        description: item.description,
        responsible: item.responsible,
        priority: item.defaultPriority,
        requiredDocumentCategoryId: item.requiredDocumentCategoryId,
        order: item.order,
      })),
    });
  }

  async update(id: string, dto: UpdateDeathCaseDto, userId: string) {
    await this.findOne(id);
    const updated = await this.prisma.deathCase.update({
      where: { id },
      data: {
        status: dto.status as DeathCaseStatus | undefined,
        placeOfDeath: dto.placeOfDeath,
        municipality: dto.municipality,
        archivedAt: dto.status === 'ARCHIVED' ? new Date() : undefined,
      },
    });
    await this.auditLogsService.log({
      userId,
      deathCaseId: id,
      action: 'death_case.update',
      resourceType: 'DeathCase',
      resourceId: id,
      details: dto,
    });
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id);
    await this.prisma.deathCase.update({ where: { id }, data: { status: DeathCaseStatus.ARCHIVED, archivedAt: new Date() } });
    await this.auditLogsService.log({ userId, deathCaseId: id, action: 'death_case.archive', resourceType: 'DeathCase', resourceId: id });
    return { success: true };
  }

  // --- Checklist ---
  async listTasks(deathCaseId: string) {
    await this.findOne(deathCaseId);
    return this.prisma.checklistTask.findMany({ where: { deathCaseId }, orderBy: { order: 'asc' } });
  }

  async createTask(deathCaseId: string, dto: CreateChecklistTaskDto) {
    await this.findOne(deathCaseId);
    const maxOrder = await this.prisma.checklistTask.count({ where: { deathCaseId } });
    return this.prisma.checklistTask.create({ data: { ...dto, deathCaseId, order: maxOrder } });
  }

  async updateTask(deathCaseId: string, taskId: string, dto: UpdateChecklistTaskDto, userId: string) {
    const task = await this.prisma.checklistTask.findFirst({ where: { id: taskId, deathCaseId } });
    if (!task) throw new NotFoundException('Tâche introuvable');
    const updated = await this.prisma.checklistTask.update({ where: { id: taskId }, data: dto });
    if (dto.status) {
      await this.auditLogsService.log({
        userId,
        deathCaseId,
        action: 'checklist_task.status_changed',
        resourceType: 'ChecklistTask',
        resourceId: taskId,
        details: { from: task.status, to: dto.status },
      });
    }
    return updated;
  }

  // --- Documents ---
  async listDocuments(deathCaseId: string) {
    await this.findOne(deathCaseId);
    return this.prisma.document.findMany({ where: { deathCaseId }, include: { category: true } });
  }

  async requestDocumentUpload(deathCaseId: string, userId: string, dto: Omit<RequestUploadUrlDto, 'livingProfileId' | 'deathCaseId'>) {
    await this.findOne(deathCaseId);
    return this.documentsService.requestUploadUrl(dto as RequestUploadUrlDto, { userId, deathCaseId });
  }

  // --- Famille ---
  async listFamily(deathCaseId: string) {
    await this.findOne(deathCaseId);
    return this.prisma.familyInvite.findMany({ where: { deathCaseId } });
  }

  async inviteFamilyMember(deathCaseId: string, dto: InviteFamilyMemberDto, invitedById: string) {
    const deathCase = await this.prisma.deathCase.findUnique({
      where: { id: deathCaseId },
      include: { organization: true },
    });
    if (!deathCase) throw new NotFoundException('Dossier décès introuvable');

    // Jeton d'invitation non devinable (128 bits) — sert de secret d'accès au
    // dossier tant que le proche n'a pas de session : on privilégie un secret
    // aléatoire fort plutôt qu'un UUID v4 exposé dans une URL.
    const invite = await this.prisma.familyInvite.create({
      data: {
        deathCaseId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        relationship: dto.relationship,
        invitedById,
        token: randomBytes(32).toString('hex'),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    // Envoi de l'e-mail d'invitation via la file d'attente (retries, non bloquant).
    const webFamilyUrl = this.configService.get<string>('WEB_FAMILY_URL') ?? 'http://localhost:3003';
    const { subject, html } = familyInviteEmail({
      recipientName: [dto.firstName, dto.lastName].filter(Boolean).join(' ') || null,
      deceasedName: `${deathCase.deceasedFirstName} ${deathCase.deceasedLastName}`,
      organizationName: deathCase.organization?.name ?? null,
      acceptUrl: `${webFamilyUrl}/invitation?token=${invite.token}`,
    });
    await this.emailsQueue.add('family-invite', { to: dto.email, subject, html });

    await this.auditLogsService.log({
      userId: invitedById,
      deathCaseId,
      action: 'family_invite.create',
      resourceType: 'FamilyInvite',
      resourceId: invite.id,
    });
    // Le token n'est pas renvoyé au portail pro : il ne transite que par l'e-mail
    // du proche invité.
    const { token: _token, ...safeInvite } = invite;
    return safeInvite;
  }

  /** Résolution publique d'un jeton d'invitation famille (avant connexion). */
  async getFamilyInviteInfo(token: string) {
    const invite = await this.prisma.familyInvite.findUnique({
      where: { token },
      include: { deathCase: { include: { organization: true } } },
    });
    if (!invite) throw new NotFoundException('Invitation introuvable ou expirée');
    const expired = invite.expiresAt.getTime() < Date.now();
    return {
      status: expired && invite.status === InvitationStatus.PENDING ? InvitationStatus.EXPIRED : invite.status,
      expired,
      deceasedFirstName: invite.deathCase.deceasedFirstName,
      deceasedLastName: invite.deathCase.deceasedLastName,
      organizationName: invite.deathCase.organization?.name ?? null,
    };
  }

  /**
   * Acceptation d'une invitation par un proche connecté : valide le jeton,
   * marque l'invitation ACCEPTED et renvoie l'identifiant du dossier décès
   * auquel le proche a désormais accès.
   */
  async acceptFamilyInvite(token: string, userId: string) {
    const invite = await this.prisma.familyInvite.findUnique({ where: { token } });
    if (!invite) throw new NotFoundException('Invitation introuvable');
    if (invite.status === InvitationStatus.REVOKED) {
      throw new BadRequestException('Cette invitation a été révoquée.');
    }
    if (invite.expiresAt.getTime() < Date.now()) {
      if (invite.status !== InvitationStatus.EXPIRED) {
        await this.prisma.familyInvite.update({ where: { token }, data: { status: InvitationStatus.EXPIRED } });
      }
      throw new BadRequestException('Cette invitation a expiré.');
    }

    if (invite.status !== InvitationStatus.ACCEPTED) {
      await this.prisma.familyInvite.update({
        where: { token },
        data: { status: InvitationStatus.ACCEPTED, acceptedAt: new Date() },
      });
    }
    await this.auditLogsService.log({
      userId,
      deathCaseId: invite.deathCaseId,
      action: 'family_invite.accept',
      resourceType: 'FamilyInvite',
      resourceId: invite.id,
    });
    return { deathCaseId: invite.deathCaseId };
  }

  // --- Contrôle d'accès à un dossier décès ---
  /**
   * Autorise l'accès à un dossier décès soit à un professionnel (rôle pro),
   * soit à un proche disposant d'une invitation `ACCEPTED` pour ce dossier
   * (rapprochée par e-mail). Empêche un utilisateur authentifié quelconque de
   * lire un dossier dont il n'a pas la charge (protection IDOR).
   */
  async assertCanAccessDeathCase(deathCaseId: string, user: AuthenticatedUser): Promise<void> {
    await this.findOne(deathCaseId);
    if (user.roles.some((role) => PRO_ROLES.includes(role))) return;

    const invite = await this.prisma.familyInvite.findFirst({
      where: { deathCaseId, email: user.email, status: InvitationStatus.ACCEPTED },
    });
    if (!invite) {
      throw new ForbiddenException("Vous n'avez pas accès à ce dossier.");
    }
  }

  // --- Données partagées avec la famille (issues du dossier vivant lié) ---
  private async getLinkedLivingProfileId(deathCaseId: string): Promise<string | null> {
    const deathCase = await this.prisma.deathCase.findUnique({
      where: { id: deathCaseId },
      select: { linkedLivingProfileId: true },
    });
    return deathCase?.linkedLivingProfileId ?? null;
  }

  /** Contacts du défunt marqués « visibles par la famille ». */
  async listSharedContacts(deathCaseId: string, user: AuthenticatedUser) {
    await this.assertCanAccessDeathCase(deathCaseId, user);
    const livingProfileId = await this.getLinkedLivingProfileId(deathCaseId);
    if (!livingProfileId) return [];
    return this.prisma.contact.findMany({
      where: { livingProfileId, visibleToFamily: true },
      select: {
        id: true,
        category: true,
        firstName: true,
        lastName: true,
        relationship: true,
        phone: true,
        email: true,
        note: true,
      },
      orderBy: { category: 'asc' },
    });
  }

  /** Volontés (souhaits) exprimées par le défunt dans son dossier vivant. */
  async listSharedWishes(deathCaseId: string, user: AuthenticatedUser) {
    await this.assertCanAccessDeathCase(deathCaseId, user);
    const livingProfileId = await this.getLinkedLivingProfileId(deathCaseId);
    if (!livingProfileId) return [];
    return this.prisma.wish.findMany({
      where: { livingProfileId },
      select: { id: true, category: true, title: true, content: true, order: true },
      orderBy: { order: 'asc' },
    });
  }

  // --- Notes ---
  async listNotes(deathCaseId: string, options: { onlyFamilyVisible?: boolean } = {}) {
    await this.findOne(deathCaseId);
    return this.prisma.note.findMany({
      where: { deathCaseId, visibility: options.onlyFamilyVisible ? 'FAMILY_VISIBLE' : undefined },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNote(deathCaseId: string, dto: CreateNoteDto, authorId: string) {
    await this.findOne(deathCaseId);
    const note = await this.prisma.note.create({ data: { ...dto, deathCaseId, authorId } });
    await this.auditLogsService.log({
      userId: authorId,
      deathCaseId,
      action: 'note.create',
      resourceType: 'Note',
      resourceId: note.id,
      details: { visibility: dto.visibility },
    });
    return note;
  }

  // --- Invitations (collaborateurs / prospects vivants) ---
  async listInvitations(deathCaseId: string) {
    await this.findOne(deathCaseId);
    return this.prisma.invitation.findMany({ where: { deathCaseId } });
  }

  async createInvitation(deathCaseId: string, organizationId: string, email: string, invitedById: string) {
    await this.findOne(deathCaseId);
    return this.prisma.invitation.create({
      data: {
        deathCaseId,
        organizationId,
        email,
        type: 'LIVING_USER_PROSPECT',
        invitedById,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
  }
}
