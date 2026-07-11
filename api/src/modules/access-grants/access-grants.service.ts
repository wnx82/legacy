import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  ACCESS_GRANT_CATEGORIES,
  UserRole,
  type ActivateAccessGrantDto,
  type AuthenticatedUser,
  type RequestAccessGrantDto,
} from '@legacy/shared';
import { AccessActivationReason, AccessGrantStatus, NotificationType, Prisma } from '@legacy/database';

const AUTHORITY_ROLES: string[] = [UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN];

/**
 * Gère le cycle de vie d'un `AccessGrant` : accès aux données d'un dossier
 * vivant (défunt) accordé à un proche après décès. L'activation est réservée à
 * une autorité (admin pompe funèbre, super admin) ou à une personne de
 * confiance explicitement habilitée (`canActivateAccess`). Refus par défaut.
 */
@Injectable()
export class AccessGrantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    private readonly notifications: NotificationsService,
  ) {}

  /** Demande d'accès (statut PENDING) — ne donne encore aucun droit. */
  async request(dto: RequestAccessGrantDto, requester: AuthenticatedUser) {
    const livingProfile = await this.prisma.livingProfile.findUnique({ where: { id: dto.livingProfileId } });
    if (!livingProfile) throw new NotFoundException('Dossier vivant introuvable');

    const grantedTo = await this.prisma.user.findUnique({ where: { id: dto.grantedToUserId } });
    if (!grantedTo) throw new NotFoundException('Utilisateur bénéficiaire introuvable');

    const existing = await this.prisma.accessGrant.findFirst({
      where: {
        livingProfileId: dto.livingProfileId,
        grantedToUserId: dto.grantedToUserId,
        status: { in: [AccessGrantStatus.PENDING, AccessGrantStatus.ACTIVE] },
      },
    });
    if (existing) {
      throw new BadRequestException('Une demande ou un accès actif existe déjà pour ce bénéficiaire.');
    }

    const grant = await this.prisma.accessGrant.create({
      data: {
        livingProfileId: dto.livingProfileId,
        grantedToUserId: dto.grantedToUserId,
        grantedByUserId: requester.id,
        status: AccessGrantStatus.PENDING,
        activationReason: dto.activationReason as AccessActivationReason | undefined,
        deathCertificateDocumentId: dto.deathCertificateDocumentId,
        allowedCategories: (dto.allowedCategories ?? ['documents', 'contacts', 'wishes']) as Prisma.InputJsonValue,
        expiresAt: dto.expiresAt,
      },
    });

    await this.auditLogs.log({
      userId: requester.id,
      action: 'access_grant.request',
      resourceType: 'AccessGrant',
      resourceId: grant.id,
      details: { livingProfileId: dto.livingProfileId, grantedToUserId: dto.grantedToUserId },
    });
    return grant;
  }

  /** Active un accès en attente : réservé aux autorités habilitées. */
  async activate(id: string, dto: ActivateAccessGrantDto, actor: AuthenticatedUser) {
    const grant = await this.getOrThrow(id);
    await this.assertCanManage(grant.livingProfileId, actor);
    if (grant.status === AccessGrantStatus.REVOKED || grant.status === AccessGrantStatus.EXPIRED) {
      throw new BadRequestException('Cet accès ne peut plus être activé.');
    }

    const updated = await this.prisma.accessGrant.update({
      where: { id },
      data: {
        status: AccessGrantStatus.ACTIVE,
        validatedByUserId: actor.id,
        activationReason: dto.activationReason as AccessActivationReason,
        deathCertificateDocumentId: dto.deathCertificateDocumentId ?? grant.deathCertificateDocumentId,
        allowedCategories: (dto.allowedCategories ?? (grant.allowedCategories as Prisma.InputJsonValue)) ?? undefined,
        expiresAt: dto.expiresAt ?? grant.expiresAt,
        revokedAt: null,
      },
    });

    await this.notifications.create(
      grant.grantedToUserId,
      NotificationType.SENSITIVE_ACCESS,
      'Accès activé',
      "L'accès aux informations partagées d'un proche a été activé pour vous.",
    );
    await this.auditLogs.log({
      userId: actor.id,
      action: 'access_grant.activate',
      resourceType: 'AccessGrant',
      resourceId: id,
      details: { activationReason: dto.activationReason },
    });
    return updated;
  }

  async suspend(id: string, actor: AuthenticatedUser) {
    return this.transition(id, actor, AccessGrantStatus.SUSPENDED, 'access_grant.suspend');
  }

  async revoke(id: string, actor: AuthenticatedUser) {
    const grant = await this.getOrThrow(id);
    await this.assertCanManage(grant.livingProfileId, actor);
    const updated = await this.prisma.accessGrant.update({
      where: { id },
      data: { status: AccessGrantStatus.REVOKED, revokedAt: new Date() },
    });
    await this.auditLogs.log({
      userId: actor.id,
      action: 'access_grant.revoke',
      resourceType: 'AccessGrant',
      resourceId: id,
    });
    return updated;
  }

  private async transition(id: string, actor: AuthenticatedUser, status: AccessGrantStatus, action: string) {
    const grant = await this.getOrThrow(id);
    await this.assertCanManage(grant.livingProfileId, actor);
    const updated = await this.prisma.accessGrant.update({ where: { id }, data: { status } });
    await this.auditLogs.log({ userId: actor.id, action, resourceType: 'AccessGrant', resourceId: id });
    return updated;
  }

  async listForLivingProfile(livingProfileId: string, actor: AuthenticatedUser) {
    await this.assertCanManage(livingProfileId, actor);
    return this.prisma.accessGrant.findMany({
      where: { livingProfileId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Accès actifs dont l'utilisateur courant est le bénéficiaire. */
  async listMine(actor: AuthenticatedUser) {
    return this.prisma.accessGrant.findMany({
      where: { grantedToUserId: actor.id, status: AccessGrantStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async getOrThrow(id: string) {
    const grant = await this.prisma.accessGrant.findUnique({ where: { id } });
    if (!grant) throw new NotFoundException("Autorisation d'accès introuvable");
    return grant;
  }

  /**
   * Autorise la gestion (activation/suspension/révocation) d'un accès : soit
   * une autorité (admin pompe funèbre / super admin), soit une personne de
   * confiance habilitée (`canActivateAccess`) rattachée par e-mail au dossier
   * vivant. Refus par défaut.
   */
  private async assertCanManage(livingProfileId: string, actor: AuthenticatedUser): Promise<void> {
    if (actor.roles.some((role) => AUTHORITY_ROLES.includes(role))) return;

    const trusted = await this.prisma.trustedPerson.findFirst({
      where: { livingProfileId, email: actor.email, canActivateAccess: true },
    });
    if (!trusted) {
      throw new ForbiddenException("Vous n'êtes pas habilité·e à gérer cet accès.");
    }
  }

  static readonly categories = ACCESS_GRANT_CATEGORIES;
}
