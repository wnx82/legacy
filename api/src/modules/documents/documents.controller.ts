import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import {
  RequestUploadUrlSchema,
  UpdateDocumentSchema,
  type RequestUploadUrlDto,
  type UpdateDocumentDto,
  type AuthenticatedUser,
} from '@legacy/shared';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload-url')
  requestUploadUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(RequestUploadUrlSchema)) dto: RequestUploadUrlDto,
  ) {
    return this.documentsService.requestUploadUrl(dto, {
      userId: user.id,
      livingProfileId: dto.livingProfileId,
      deathCaseId: dto.deathCaseId,
    });
  }

  @Post(':id/confirm')
  confirmUpload(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.confirmUpload(id, user.id);
  }

  @Get(':id/download-url')
  getDownloadUrl(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.getDownloadUrl(id, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(new ZodValidationPipe(UpdateDocumentSchema)) dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.documentsService.remove(id, user.id);
  }
}
