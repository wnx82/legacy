import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import type {
  CreateDeathCaseDto,
  UpdateDeathCaseDto,
  CreateChecklistTaskDto,
  UpdateChecklistTaskDto,
  InviteFamilyMemberDto,
  CreateNoteDto,
  RequestUploadUrlDto,
} from '@legacy/shared';
import { DeathCaseStatus } from '@legacy/database';
import { randomUUID } from 'node:crypto';

@Injectable()
export class DeathCasesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
    private readonly auditLogsService: AuditLogsService,
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
    await this.findOne(deathCaseId);
    const invite = await this.prisma.familyInvite.create({
      data: {
        deathCaseId,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        relationship: dto.relationship,
        invitedById,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
    await this.auditLogsService.log({
      userId: invitedById,
      deathCaseId,
      action: 'family_invite.create',
      resourceType: 'FamilyInvite',
      resourceId: invite.id,
    });
    return invite;
  }

  // --- Notes ---
  async listNotes(deathCaseId: string) {
    await this.findOne(deathCaseId);
    return this.prisma.note.findMany({ where: { deathCaseId }, orderBy: { createdAt: 'desc' } });
  }

  async createNote(deathCaseId: string, dto: CreateNoteDto, authorId: string) {
    await this.findOne(deathCaseId);
    return this.prisma.note.create({ data: { ...dto, deathCaseId, authorId } });
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
