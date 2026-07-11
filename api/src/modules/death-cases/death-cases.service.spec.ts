import { Test } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DeathCasesService } from './death-cases.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queue/queue.constants';
import type { AuthenticatedUser } from '@legacy/shared';
import { InvitationStatus } from '@legacy/database';

describe('DeathCasesService — contrôle d\'accès famille', () => {
  let service: DeathCasesService;
  const emailsQueue = { add: jest.fn() };
  const auditLogs = { log: jest.fn() };
  const prismaMock = {
    deathCase: { findUnique: jest.fn(), findMany: jest.fn() },
    familyInvite: { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
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
        { provide: AuditLogsService, useValue: auditLogs },
        { provide: ConfigService, useValue: { get: jest.fn((key: string) => (key === 'WEB_FAMILY_URL' ? 'http://localhost:3003' : undefined)) } },
        { provide: getQueueToken(QUEUE_NAMES.EMAILS), useValue: emailsQueue },
      ],
    }).compile();
    service = moduleRef.get(DeathCasesService);
    prismaMock.familyInvite.create.mockResolvedValue({
      id: 'inv-1',
      deathCaseId: 'dc-1',
      email: 'proche@example.com',
      firstName: 'Proche',
      lastName: 'Test',
      relationship: 'Fils',
      status: InvitationStatus.PENDING,
      token: 'secret-token',
      expiresAt: new Date('2026-07-25T10:00:00Z'),
    });
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

  it("crée une invitation famille et enfile l'e-mail sans exposer le token", async () => {
    prismaMock.deathCase.findUnique.mockResolvedValue({
      id: 'dc-1',
      deceasedFirstName: 'Jean',
      deceasedLastName: 'Dupont',
      organization: { name: 'Pompes Funèbres Horizon' },
    });

    const invite = await service.inviteFamilyMember(
      'dc-1',
      { email: 'proche@example.com', firstName: 'Proche', lastName: 'Test', relationship: 'Fils' },
      'u-pro',
    );

    expect(prismaMock.familyInvite.create).toHaveBeenCalled();
    expect(emailsQueue.add).toHaveBeenCalledWith(
      'family-invite',
      expect.objectContaining({
        to: 'proche@example.com',
        subject: expect.stringContaining('Jean Dupont'),
        html: expect.stringContaining('/invitation?token='),
      }),
    );
    expect(invite).not.toHaveProperty('token');
  });

  it("accepte une invitation valide et renvoie le dossier associé", async () => {
    prismaMock.familyInvite.findUnique.mockResolvedValue({
      id: 'inv-1',
      token: 'secret-token',
      deathCaseId: 'dc-1',
      status: InvitationStatus.PENDING,
      expiresAt: new Date('2026-07-25T10:00:00Z'),
    });
    prismaMock.familyInvite.update.mockResolvedValue({ id: 'inv-1', status: InvitationStatus.ACCEPTED });

    const result = await service.acceptFamilyInvite('secret-token', 'u-fam');

    expect(prismaMock.familyInvite.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { token: 'secret-token' },
        data: expect.objectContaining({ status: InvitationStatus.ACCEPTED }),
      }),
    );
    expect(result).toEqual({ deathCaseId: 'dc-1' });
  });

  it("refuse une invitation expirée et la marque comme telle", async () => {
    prismaMock.familyInvite.findUnique.mockResolvedValue({
      id: 'inv-1',
      token: 'expired-token',
      deathCaseId: 'dc-1',
      status: InvitationStatus.PENDING,
      expiresAt: new Date('2026-07-01T10:00:00Z'),
    });

    await expect(service.acceptFamilyInvite('expired-token', 'u-fam')).rejects.toThrow(BadRequestException);
    expect(prismaMock.familyInvite.update).toHaveBeenCalledWith({
      where: { token: 'expired-token' },
      data: { status: InvitationStatus.EXPIRED },
    });
  });
});
