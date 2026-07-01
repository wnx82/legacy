import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChecklistTemplatesService } from './checklist-templates.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@legacy/shared';

@ApiTags('checklist-templates')
@ApiBearerAuth()
@Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN)
@Controller('checklist-templates')
export class ChecklistTemplatesController {
  constructor(private readonly checklistTemplatesService: ChecklistTemplatesService) {}

  @Get()
  findAll(@Query('organizationId') organizationId?: string) {
    return this.checklistTemplatesService.findAll(organizationId);
  }

  @Post()
  create(@Body() dto: Parameters<ChecklistTemplatesService['create']>[0]) {
    return this.checklistTemplatesService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checklistTemplatesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Parameters<ChecklistTemplatesService['update']>[1]) {
    return this.checklistTemplatesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checklistTemplatesService.remove(id);
  }
}
