import { Test } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { ExportJobStatus, ExportJobType } from '@legacy/database';
import { ExportsService } from './exports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { QUEUE_NAMES } from '../queue/queue.constants';

describe('ExportsService', () => {
  let service: ExportsService;
  const pdfQueue = { add: jest.fn() };
  const zipQueue = { add: jest.fn() };
  const rgpdQueue = { add: jest.fn() };
  const storage = { getPresignedDownloadUrl: jest.fn() };
  const prismaMock = {
    exportJob: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ExportsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storage },
        { provide: getQueueToken(QUEUE_NAMES.PDF_EXPORT), useValue: pdfQueue },
        { provide: getQueueToken(QUEUE_NAMES.ZIP_EXPORT), useValue: zipQueue },
        { provide: getQueueToken(QUEUE_NAMES.RGPD_EXPORT), useValue: rgpdQueue },
      ],
    }).compile();

    service = moduleRef.get(ExportsService);
  });

  it('crée un export RGPD et l’enfile dans la bonne queue', async () => {
    prismaMock.exportJob.create.mockResolvedValue({
      id: 'exp-rgpd-1',
      requestedById: 'u1',
      type: ExportJobType.RGPD_EXPORT,
      status: ExportJobStatus.PENDING,
    });

    const result = await service.requestRgpdExport('u1');

    expect(prismaMock.exportJob.create).toHaveBeenCalledWith({
      data: { requestedById: 'u1', type: ExportJobType.RGPD_EXPORT, status: ExportJobStatus.PENDING },
    });
    expect(rgpdQueue.add).toHaveBeenCalledWith('generate', { exportJobId: 'exp-rgpd-1', userId: 'u1' });
    expect(result.id).toBe('exp-rgpd-1');
  });

  it("refuse l'accès à un export demandé par un autre utilisateur", async () => {
    prismaMock.exportJob.findUnique.mockResolvedValue({
      id: 'exp-1',
      requestedById: 'u-owner',
    });

    await expect(service.findOne('exp-1', 'u-other')).rejects.toThrow(ForbiddenException);
  });

  it("renvoie une URL signée pour un export terminé appartenant au demandeur", async () => {
    prismaMock.exportJob.findUnique.mockResolvedValue({
      id: 'exp-1',
      requestedById: 'u1',
      status: ExportJobStatus.COMPLETED,
      resultStorageKey: 'exports/exp-1.pdf',
    });
    storage.getPresignedDownloadUrl.mockResolvedValue('https://signed.example/export');

    const result = await service.getResultUrl('exp-1', 'u1');

    expect(storage.getPresignedDownloadUrl).toHaveBeenCalledWith('exports/exp-1.pdf');
    expect(result).toEqual({ url: 'https://signed.example/export', expiresInSeconds: 300 });
  });

  it("refuse le téléchargement tant que l'export n'est pas terminé", async () => {
    prismaMock.exportJob.findUnique.mockResolvedValue({
      id: 'exp-1',
      requestedById: 'u1',
      status: ExportJobStatus.PROCESSING,
      resultStorageKey: null,
    });

    await expect(service.getResultUrl('exp-1', 'u1')).rejects.toThrow(NotFoundException);
  });
});
