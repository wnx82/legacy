import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditResult, Prisma } from '@legacy/database';

export interface LogAuditEventInput {
  userId?: string;
  organizationId?: string;
  deathCaseId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  result?: AuditResult;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Journalise une action sensible. Ne doit jamais lever d'exception qui
   * bloquerait l'action métier : un échec de journalisation est loggé côté
   * serveur mais n'interrompt pas la requête de l'utilisateur.
   */
  async log(input: LogAuditEventInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId,
          organizationId: input.organizationId,
          deathCaseId: input.deathCaseId,
          action: input.action,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          result: input.result ?? AuditResult.SUCCESS,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          details: input.details as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (error) {
      console.error("Échec de journalisation de l'audit log", error);
    }
  }

  async findAll(params: { organizationId?: string; userId?: string; action?: string; page?: number; pageSize?: number }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 50;
    const where = {
      organizationId: params.organizationId,
      userId: params.userId,
      action: params.action,
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Agrégats pour le tableau de bord d'audit : total, répartition par action et
   * par résultat, volume des 7 derniers jours. Optionnellement filtré par
   * organisation.
   */
  async summary(params: { organizationId?: string } = {}) {
    const where = params.organizationId ? { organizationId: params.organizationId } : {};
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, last7Days, byAction, byResult, failures] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.count({ where: { ...where, createdAt: { gte: sevenDaysAgo } } }),
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 15,
      }),
      this.prisma.auditLog.groupBy({ by: ['result'], where, _count: { result: true } }),
      this.prisma.auditLog.count({ where: { ...where, result: AuditResult.FAILURE } }),
    ]);

    return {
      total,
      last7Days,
      failures,
      byAction: byAction.map((row) => ({ action: row.action, count: row._count.action })),
      byResult: byResult.map((row) => ({ result: row.result, count: row._count.result })),
    };
  }
}
