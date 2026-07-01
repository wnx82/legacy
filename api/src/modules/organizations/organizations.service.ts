import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrganizationSettingsDto,
  InviteOrganizationMemberDto,
  UpdateOrganizationMemberDto,
} from '@legacy/shared';
import { MemberStatus } from '@legacy/database';
import { randomUUID } from 'node:crypto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.organization.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new NotFoundException('Organisation introuvable');
    return organization;
  }

  create(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: dto });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    await this.findOne(id);
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async getMembers(organizationId: string) {
    await this.findOne(organizationId);
    return this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async inviteMember(organizationId: string, dto: InviteOrganizationMemberDto, invitedById: string) {
    await this.findOne(organizationId);
    return this.prisma.invitation.create({
      data: {
        organizationId,
        email: dto.email,
        type: 'ORG_MEMBER',
        invitedById,
        token: randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async updateMember(organizationId: string, memberId: string, dto: UpdateOrganizationMemberDto) {
    const member = await this.prisma.organizationMember.findFirst({ where: { id: memberId, organizationId } });
    if (!member) throw new NotFoundException('Membre introuvable');
    return this.prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        baseRole: dto.baseRole,
        status: dto.status as MemberStatus | undefined,
      },
    });
  }

  async removeMember(organizationId: string, memberId: string) {
    const member = await this.prisma.organizationMember.findFirst({ where: { id: memberId, organizationId } });
    if (!member) throw new NotFoundException('Membre introuvable');
    return this.prisma.organizationMember.update({ where: { id: memberId }, data: { status: MemberStatus.REMOVED } });
  }

  async getSettings(organizationId: string) {
    await this.findOne(organizationId);
    return this.prisma.funeralHomeSettings.findUnique({ where: { organizationId } });
  }

  async updateSettings(organizationId: string, dto: UpdateOrganizationSettingsDto) {
    await this.findOne(organizationId);
    return this.prisma.funeralHomeSettings.upsert({
      where: { organizationId },
      update: dto,
      create: { organizationId, ...dto },
    });
  }
}
