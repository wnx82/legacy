import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { DeathCasesService } from './death-cases.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  CreateDeathCaseSchema,
  UpdateDeathCaseSchema,
  CreateChecklistTaskSchema,
  UpdateChecklistTaskSchema,
  InviteFamilyMemberSchema,
  CreateNoteSchema,
  RequestUploadUrlSchema,
  UserRole,
  type CreateDeathCaseDto,
  type UpdateDeathCaseDto,
  type CreateChecklistTaskDto,
  type UpdateChecklistTaskDto,
  type InviteFamilyMemberDto,
  type CreateNoteDto,
  type RequestUploadUrlDto,
  type AuthenticatedUser,
} from '@legacy/shared';

const PRO_ROLES = [UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN, UserRole.FUNERAL_ADVISOR];

@ApiTags('death-cases')
@ApiBearerAuth()
@Controller('death-cases')
export class DeathCasesController {
  constructor(private readonly deathCasesService: DeathCasesService) {}

  @Get()
  @Roles(...PRO_ROLES)
  findAll(@Query('organizationId') organizationId?: string) {
    return this.deathCasesService.findAll(organizationId);
  }

  @Post()
  @Roles(...PRO_ROLES, UserRole.FAMILY_MEMBER)
  create(@Body(new ZodValidationPipe(CreateDeathCaseSchema)) dto: CreateDeathCaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.deathCasesService.create(dto, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deathCasesService.findOne(id);
  }

  @Patch(':id')
  @Roles(...PRO_ROLES)
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateDeathCaseSchema)) dto: UpdateDeathCaseDto, @CurrentUser() user: AuthenticatedUser) {
    return this.deathCasesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(...PRO_ROLES)
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.deathCasesService.remove(id, user.id);
  }

  @Get(':id/tasks')
  listTasks(@Param('id') id: string) {
    return this.deathCasesService.listTasks(id);
  }

  @Post(':id/tasks')
  @Roles(...PRO_ROLES)
  createTask(@Param('id') id: string, @Body(new ZodValidationPipe(CreateChecklistTaskSchema)) dto: CreateChecklistTaskDto) {
    return this.deathCasesService.createTask(id, dto);
  }

  @Patch(':id/tasks/:taskId')
  updateTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body(new ZodValidationPipe(UpdateChecklistTaskSchema)) dto: UpdateChecklistTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deathCasesService.updateTask(id, taskId, dto, user.id);
  }

  @Get(':id/documents')
  listDocuments(@Param('id') id: string) {
    return this.deathCasesService.listDocuments(id);
  }

  @Post(':id/documents')
  requestDocumentUpload(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(RequestUploadUrlSchema)) dto: RequestUploadUrlDto,
  ) {
    return this.deathCasesService.requestDocumentUpload(id, user.id, dto);
  }

  @Get(':id/family')
  listFamily(@Param('id') id: string) {
    return this.deathCasesService.listFamily(id);
  }

  @Post(':id/family')
  @Roles(...PRO_ROLES, UserRole.FAMILY_MEMBER)
  inviteFamilyMember(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(InviteFamilyMemberSchema)) dto: InviteFamilyMemberDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deathCasesService.inviteFamilyMember(id, dto, user.id);
  }

  @Get(':id/notes')
  @Roles(...PRO_ROLES, UserRole.FAMILY_MEMBER)
  listNotes(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const isProUser = user.roles.some((role) => PRO_ROLES.includes(role as UserRole));
    return this.deathCasesService.listNotes(id, { onlyFamilyVisible: !isProUser });
  }

  @Post(':id/notes')
  @Roles(...PRO_ROLES)
  createNote(@Param('id') id: string, @Body(new ZodValidationPipe(CreateNoteSchema)) dto: CreateNoteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.deathCasesService.createNote(id, dto, user.id);
  }

  @Get(':id/invitations')
  @Roles(...PRO_ROLES)
  listInvitations(@Param('id') id: string) {
    return this.deathCasesService.listInvitations(id);
  }

  @Post(':id/invitations')
  @Roles(...PRO_ROLES)
  createInvitation(
    @Param('id') id: string,
    @Body('email') email: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.deathCasesService.createInvitation(id, user.organizationId ?? '', email, user.id);
  }
}
