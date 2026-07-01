import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { OrganizationsService } from './organizations.service';
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  UpdateOrganizationSettingsSchema,
  InviteOrganizationMemberSchema,
  UpdateOrganizationMemberSchema,
  type CreateOrganizationDto,
  type UpdateOrganizationDto,
  type UpdateOrganizationSettingsDto,
  type InviteOrganizationMemberDto,
  type UpdateOrganizationMemberDto,
  UserRole,
} from '@legacy/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@legacy/shared';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  findAll() {
    return this.organizationsService.findAll();
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body(new ZodValidationPipe(CreateOrganizationSchema)) dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN, UserRole.FUNERAL_ADVISOR)
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN)
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateOrganizationSchema)) dto: UpdateOrganizationDto) {
    return this.organizationsService.update(id, dto);
  }

  @Get(':id/members')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN)
  getMembers(@Param('id') id: string) {
    return this.organizationsService.getMembers(id);
  }

  @Post(':id/members')
  @Roles(UserRole.FUNERAL_HOME_ADMIN)
  inviteMember(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(InviteOrganizationMemberSchema)) dto: InviteOrganizationMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.inviteMember(id, dto, user.id);
  }

  @Patch(':id/members/:memberId')
  @Roles(UserRole.FUNERAL_HOME_ADMIN)
  updateMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body(new ZodValidationPipe(UpdateOrganizationMemberSchema)) dto: UpdateOrganizationMemberDto,
  ) {
    return this.organizationsService.updateMember(id, memberId, dto);
  }

  @Delete(':id/members/:memberId')
  @Roles(UserRole.FUNERAL_HOME_ADMIN)
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.organizationsService.removeMember(id, memberId);
  }

  @Get(':id/settings')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN, UserRole.FUNERAL_ADVISOR)
  getSettings(@Param('id') id: string) {
    return this.organizationsService.getSettings(id);
  }

  @Patch(':id/settings')
  @Roles(UserRole.FUNERAL_HOME_ADMIN)
  updateSettings(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateOrganizationSettingsSchema)) dto: UpdateOrganizationSettingsDto,
  ) {
    return this.organizationsService.updateSettings(id, dto);
  }
}
