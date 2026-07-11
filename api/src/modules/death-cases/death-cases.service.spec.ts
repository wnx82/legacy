import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { DeathCasesService } from './death-cases.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queue/queue.constants';
import type { AuthenticatedUser } from '@legacy/shared';

describe('DeathCasesService — contrôle d\'accès famille', () => {
  let service: DeathCasesService;
  const prismaMock = {
    deathCase: { findUnique: jest.fn(), findMany: jest.fn() },
    familyInvite: { findFirst: jest.fn() },
    contact: { findMany: jest.fn() },
    wish: { findMany: jest.fn() },
  };

  const proUser: AuthenticatedUser = {
    id: 'u-pro',
    keycloakId: 'kc-pro',
    email: 'pro@pf.be',
    firstName: 'Pro',
    lastName: 'User',
    roles: ['FUNERAL_ADVISOR'],
  };
  const familyUser: AuthenticatedUser = {
    id: 'u-fam',
    keycloakId: 'kc-fam',
    email: 'proche@example.com',
    firstName: 'Proche',
    lastName: 'Test',
    roles: ['FAMILY_MEMBER'],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        DeathCasesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: DocumentsService, useValue: {} },
        { provide: AuditLogsService, useValue: { log: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: getQueueToken(QUEUE_NAMES.EMAILS), useValue: { add: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(DeathCasesService);
    prismaMock.deathCase.findUnique.mockResolvedValue({ id: 'dc-1', linkedLivingProfileId: 'lp-1' });
  });

  it('autorise un professionnel', async () => {
    await expect(service.assertCanAccessDeathCase('dc-1', proUser)).resolves.toBeUndefined();
    expect(prismaMock.familyInvite.findFirst).not.toHaveBeenCalled();
  });

  it('refuse un proche sans invitation acceptée', async () => {
    prismaMock.familyInvite.findFirst.mockResolvedValue(null);
    await expect(service.assertCanAccessDeathCase('dc-1', familyUser)).rejects.toThrow(ForbiddenException);
  });

  it('autorise un proche avec invitation acceptée', async () => {
    prismaMock.familyInvite.findFirst.mockResolvedValue({ id: 'inv-1' });
    await expect(service.assertCanAccessDeathCase('dc-1', familyUser)).resolves.toBeUndefined();
  });

  it('ne renvoie que les contacts visibles par la famille', async () => {
    prismaMock.familyInvite.findFirst.mockResolvedValue({ id: 'inv-1' });
    prismaMock.contact.findMany.mockResolvedValue([{ id: 'c1' }]);
    await service.listSharedContacts('dc-1', familyUser);
    expect(prismaMock.contact.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { livingProfileId: 'lp-1', visibleToFamily: true } }),
    );
  });
});
