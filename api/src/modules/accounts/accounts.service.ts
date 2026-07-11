import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

/**
 * Suppression de compte conforme RGPD. Les données personnelles du dossier
 * vivant sont réellement effacées (base + objets MinIO), tandis que
 * l'enregistrement `User` est anonymisé plutôt que supprimé : cela préserve
 * l'intégrité référentielle des enregistrements à conserver pour raisons
 * légales/sécurité (journaux d'audit, dossiers décès traités), tout en
 * effaçant toute donnée identifiante. Voir docs/rgpd.md.
 */
@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly auditLogs: AuditLogsService,
  ) {}

  async deleteMyAccount(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { livingProfile: { include: { documents: true } } },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // 1. Objets MinIO à purger (documents du dossier vivant).
    const storageKeys = user.livingProfile?.documents.map((d) => d.storageKey) ?? [];

    // 2. Effacement transactionnel des données personnelles + anonymisation.
    await this.prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { userId } });
      await tx.consent.deleteMany({ where: { userId } });
      await tx.legalDisclaimerAcceptance.deleteMany({ where: { userId } });
      await tx.organizationMember.deleteMany({ where: { userId } });
      await tx.accessGrant.deleteMany({ where: { grantedToUserId: userId } });

      if (user.livingProfile) {
        // La suppression du dossier vivant cascade sur volontés, contacts,
        // documents, personnes de confiance, patrimoine, assurances, etc.
        await tx.livingProfile.delete({ where: { id: user.livingProfile.id } });
      }

      const marker = `deleted-${user.id}`;
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `${marker}@legacy.invalid`,
          keycloakId: marker,
          firstName: 'Compte',
          lastName: 'supprimé',
          phone: null,
          locale: 'fr',
        },
      });
    });

    // 3. Purge MinIO (best-effort, hors transaction DB).
    for (const key of storageKeys) {
      try {
        await this.storage.removeObject(key);
      } catch (error) {
        this.logger.error(`Purge MinIO échouée pour ${key}: ${error instanceof Error ? error.message : error}`);
      }
    }

    await this.auditLogs.log({
      userId,
      action: 'account.delete',
      resourceType: 'User',
      resourceId: userId,
      details: { purgedObjects: storageKeys.length },
    });

    return {
      success: true,
      purgedObjects: storageKeys.length,
      // Keycloak reste la source de vérité de l'identité : la désactivation du
      // compte côté Keycloak doit être effectuée séparément (admin API).
      note: 'Compte anonymisé et données personnelles effacées. Désactivez aussi le compte côté Keycloak.',
    };
  }
}
