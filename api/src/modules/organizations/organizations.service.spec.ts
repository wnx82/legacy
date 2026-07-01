import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  const prismaMock = {
    organization: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [OrganizationsService, { provide: PrismaService, useValue: prismaMock }],
    }).compile();
    service = moduleRef.get(OrganizationsService);
  });

  it("lève une NotFoundException si l'organisation n'existe pas", async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);
    await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException);
  });

  it('retourne une organisation existante', async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: 'org-1', name: 'Pompes Funèbres Test' });
    const result = await service.findOne('org-1');
    expect(result).toEqual({ id: 'org-1', name: 'Pompes Funèbres Test' });
  });
});
