import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { ContactRequestDto, DemoRequestDto } from '@legacy/shared';

@Injectable()
export class SiteService {
  private readonly logger = new Logger(SiteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createContactRequest(dto: ContactRequestDto) {
    if (this.isSpam(dto.website)) return this.silentSuccess('contact');
    const { website: _website, ...data } = dto;
    return this.prisma.contactRequest.create({ data });
  }

  async createDemoRequest(dto: DemoRequestDto) {
    if (this.isSpam(dto.website)) return this.silentSuccess('demo');
    const { website: _website, ...data } = dto;
    return this.prisma.demoRequest.create({ data });
  }

  /** Le pot de miel a été rempli : requête très probablement automatisée. */
  private isSpam(honeypotValue?: string): boolean {
    return Boolean(honeypotValue && honeypotValue.trim().length > 0);
  }

  private silentSuccess(kind: string) {
    this.logger.warn(`Soumission ${kind} ignorée (pot de miel rempli).`);
    // Réponse indiscernable d'un succès réel pour ne pas révéler le piège.
    return { id: 'ok', createdAt: new Date() };
  }
}
