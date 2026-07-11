import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ExportsService } from './exports.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@legacy/shared';

@ApiTags('exports')
@ApiBearerAuth()
@Controller('exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Post('pdf')
  requestPdf(
    @Body() body: { type: 'PDF_LIVING_PROFILE' | 'PDF_DEATH_CASE'; targetId: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.exportsService.requestPdfExport(user.id, body);
  }

  @Post('zip')
  requestZip(@Body() body: { documentIds: string[] }, @CurrentUser() user: AuthenticatedUser) {
    return this.exportsService.requestZipExport(user.id, body.documentIds);
  }

  @Post('rgpd')
  requestRgpd(@CurrentUser() user: AuthenticatedUser) {
    return this.exportsService.requestRgpdExport(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.exportsService.findOne(id, user.id);
  }

  @Get(':id/download')
  getResultUrl(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.exportsService.getResultUrl(id, user.id);
  }
}
