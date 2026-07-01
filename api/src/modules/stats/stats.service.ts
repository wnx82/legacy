import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChecklistTaskStatus, DeathCaseStatus } from '@legacy/database';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Statistiques d'usage du portail professionnel (tableau de bord d'une
   * organisation). Distinct des statistiques d'audience du site public,
   * qui sont mesurées par Umami (voir infra/README.md et docs/rgpd.md).
   */
  async getOrganizationStats(organizationId: string) {
    const [deathCasesByStatus, totalDocuments, overdueTasks, totalMembers, totalFamilyInvites] = await Promise.all([
      this.prisma.deathCase.groupBy({
        by: ['status'],
        where: { organizationId },
        _count: { _all: true },
      }),
      this.prisma.document.count({ where: { deathCase: { organizationId } } }),
      this.prisma.checklistTask.count({
        where: {
          deathCase: { organizationId },
          status: { notIn: [ChecklistTaskStatus.DONE, ChecklistTaskStatus.NOT_APPLICABLE] },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.organizationMember.count({ where: { organizationId, status: 'ACTIVE' } }),
      this.prisma.familyInvite.count({ where: { deathCase: { organizationId } } }),
    ]);

    const activeCases = deathCasesByStatus
      .filter((row) => row.status !== DeathCaseStatus.ARCHIVED)
      .reduce((sum, row) => sum + row._count._all, 0);

    return {
      deathCasesByStatus: Object.fromEntries(deathCasesByStatus.map((row) => [row.status, row._count._all])),
      activeCases,
      totalDocuments,
      overdueTasks,
      totalMembers,
      totalFamilyInvites,
    };
  }

  /** Statistiques globales plateforme — réservées au SUPER_ADMIN. */
  async getPlatformStats() {
    const [organizations, livingProfiles, deathCases, users] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.livingProfile.count(),
      this.prisma.deathCase.count(),
      this.prisma.user.count(),
    ]);
    return { organizations, livingProfiles, deathCases, users };
  }

  /** Score de préparation moyen des dossiers vivants — utile pour le suivi produit. */
  async getLivingProfilesAverageProgress() {
    const result = await this.prisma.livingProfile.aggregate({ _avg: { progressPercent: true } });
    return { averageProgressPercent: Math.round(result._avg.progressPercent ?? 0) };
  }
}
