import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('AccountsService.deleteMyAccount', () => {
  let service: AccountsService;
  const tx = {
    notification: { deleteMany: jest.fn() },
    consent: { deleteMany: jest.fn() },
    legalDisclaimerAcceptance: { deleteMany: jest.fn() },
    organizationMember: { deleteMany: jest.fn() },
    accessGrant: { deleteMany: jest.fn() },
    livingProfile: { delete: jest.fn() },
    user: { update: jest.fn() },
  };
  const prismaMock = {
    user: { findUnique: jest.fn() },
    $transaction: jest.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)),
  };
  const storageMock = { removeObject: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
        { provide: AuditLogsService, useValue: { log: jest.fn() } },
      ],
    }).compile();
    service = moduleRef.get(AccountsService);
  });

  it('lève NotFound si le compte est absent', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    await expect(service.deleteMyAccount('u')).rejects.toThrow(NotFoundException);
  });

  it('anonymise le compte, supprime le dossier vivant et purge MinIO', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      livingProfile: { id: 'lp1', documents: [{ storageKey: 'k1' }, { storageKey: 'k2' }] },
    });
    const res = await service.deleteMyAccount('u1');
    expect(tx.livingProfile.delete).toHaveBeenCalledWith({ where: { id: 'lp1' } });
    expect(tx.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ email: 'deleted-u1@legacy.invalid' }) }),
    );
    expect(storageMock.removeObject).toHaveBeenCalledTimes(2);
    expect(res.purgedObjects).toBe(2);
  });
});
