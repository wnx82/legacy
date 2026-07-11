import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AccessGrantsService } from './access-grants.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AuthenticatedUser } from '@legacy/shared';

describe('AccessGrantsService', () => {
  let service: AccessGrantsService;
  const prismaMock = {
    livingProfile: { findUnique: jest.fn() },
    user: { findUnique: jest.fn() },
    accessGrant: { findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findMany: jest.fn() },
    trustedPerson: { findFirst: jest.fn() },
  };
  const notif = { create: jest.fn() };

  const admin: AuthenticatedUser = {
    id: 'a1', keycloakId: 'k', email: 'admin@pf.be', firstName: 'A', lastName: 'D', roles: ['FUNERAL_HOME_ADMIN'],
  };
  const outsider: AuthenticatedUser = {
    id: 'x1', keycloakId: 'k', email: 'x@x.be', firstName: 'X', lastName: 'Y', roles: ['FAMILY_MEMBER'],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccessGrantsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditLogsService, useValue: { log: jest.fn() } },
        { provide: NotificationsService, useValue: notif },
      ],
    }).compile();
    service = moduleRef.get(AccessGrantsService);
  });

  it('empêche une double demande active', async () => {
    prismaMock.livingProfile.findUnique.mockResolvedValue({ id: 'lp' });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u' });
    prismaMock.accessGrant.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(
      service.request({ livingProfileId: 'lp', grantedToUserId: 'u' }, admin),
    ).rejects.toThrow(BadRequestException);
  });

  it('active un accès et notifie le bénéficiaire (autorité)', async () => {
    prismaMock.accessGrant.findUnique.mockResolvedValue({ id: 'g', livingProfileId: 'lp', status: 'PENDING', grantedToUserId: 'u', allowedCategories: ['documents'] });
    prismaMock.accessGrant.update.mockResolvedValue({ id: 'g', status: 'ACTIVE' });
    const res = await service.activate('g', { activationReason: 'MANUAL_FUNERAL_HOME' }, admin);
    expect(res.status).toBe('ACTIVE');
    expect(notif.create).toHaveBeenCalled();
  });

  it('refuse la gestion à un tiers non habilité', async () => {
    prismaMock.accessGrant.findUnique.mockResolvedValue({ id: 'g', livingProfileId: 'lp', status: 'PENDING' });
    prismaMock.trustedPerson.findFirst.mockResolvedValue(null);
    await expect(service.revoke('g', outsider)).rejects.toThrow(ForbiddenException);
  });

  it('autorise une personne de confiance habilitée', async () => {
    prismaMock.accessGrant.findUnique.mockResolvedValue({ id: 'g', livingProfileId: 'lp', status: 'ACTIVE' });
    prismaMock.trustedPerson.findFirst.mockResolvedValue({ id: 'tp', canActivateAccess: true });
    prismaMock.accessGrant.update.mockResolvedValue({ id: 'g', status: 'REVOKED' });
    const res = await service.revoke('g', outsider);
    expect(res.status).toBe('REVOKED');
  });
});
