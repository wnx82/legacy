import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { LivingProfileService } from './living-profile.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  UpdateLivingProfileSchema,
  CreateWishSchema,
  UpdateWishSchema,
  CreateContactSchema,
  UpdateContactSchema,
  CreateTrustedPersonSchema,
  RequestUploadUrlSchema,
  UserRole,
  type UpdateLivingProfileDto,
  type CreateWishDto,
  type UpdateWishDto,
  type CreateContactDto,
  type UpdateContactDto,
  type CreateTrustedPersonDto,
  type RequestUploadUrlDto,
  type AuthenticatedUser,
} from '@legacy/shared';

@ApiTags('living-profile')
@ApiBearerAuth()
@Roles(UserRole.LIVING_USER, UserRole.SUPER_ADMIN)
@Controller('living-profile')
export class LivingProfileController {
  constructor(private readonly livingProfileService: LivingProfileService) {}

  @Get()
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.livingProfileService.findByUser(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser) {
    return this.livingProfileService.getOrCreate(user.id);
  }

  @Patch()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(UpdateLivingProfileSchema)) dto: UpdateLivingProfileDto,
  ) {
    return this.livingProfileService.update(user.id, dto);
  }

  @Get('progress')
  getProgress(@CurrentUser() user: AuthenticatedUser) {
    return this.livingProfileService.getProgress(user.id);
  }

  @Get('documents')
  listDocuments(@CurrentUser() user: AuthenticatedUser) {
    return this.livingProfileService.listDocuments(user.id);
  }

  @Post('documents')
  requestDocumentUpload(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(RequestUploadUrlSchema)) dto: RequestUploadUrlDto,
  ) {
    return this.livingProfileService.requestDocumentUpload(user.id, dto);
  }

  @Get('wishes')
  listWishes(@CurrentUser() user: AuthenticatedUser) {
    return this.livingProfileService.listWishes(user.id);
  }

  @Post('wishes')
  createWish(@CurrentUser() user: AuthenticatedUser, @Body(new ZodValidationPipe(CreateWishSchema)) dto: CreateWishDto) {
    return this.livingProfileService.createWish(user.id, dto);
  }

  @Patch('wishes/:id')
  updateWish(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateWishSchema)) dto: UpdateWishDto,
  ) {
    return this.livingProfileService.updateWish(user.id, id, dto);
  }

  @Get('contacts')
  listContacts(@CurrentUser() user: AuthenticatedUser) {
    return this.livingProfileService.listContacts(user.id);
  }

  @Post('contacts')
  createContact(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateContactSchema)) dto: CreateContactDto,
  ) {
    return this.livingProfileService.createContact(user.id, dto);
  }

  @Patch('contacts/:id')
  updateContact(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateContactSchema)) dto: UpdateContactDto,
  ) {
    return this.livingProfileService.updateContact(user.id, id, dto);
  }

  @Delete('contacts/:id')
  deleteContact(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.livingProfileService.deleteContact(user.id, id);
  }

  @Get('trusted-persons')
  listTrustedPersons(@CurrentUser() user: AuthenticatedUser) {
    return this.livingProfileService.listTrustedPersons(user.id);
  }

  @Post('trusted-persons')
  createTrustedPerson(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateTrustedPersonSchema)) dto: CreateTrustedPersonDto,
  ) {
    return this.livingProfileService.createTrustedPerson(user.id, dto);
  }

  @Delete('trusted-persons/:id')
  deleteTrustedPerson(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.livingProfileService.deleteTrustedPerson(user.id, id);
  }
}
