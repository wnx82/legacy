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
}
