import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { ContactRequestDto, DemoRequestDto } from '@legacy/shared';

@Injectable()
export class SiteService {
  constructor(private readonly prisma: PrismaService) {}

  createContactRequest(dto: ContactRequestDto) {
    return this.prisma.contactRequest.create({ data: dto });
  }

  createDemoRequest(dto: DemoRequestDto) {
    return this.prisma.demoRequest.create({ data: dto });
  }
}
