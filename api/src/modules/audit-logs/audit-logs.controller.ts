import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@legacy/shared';

@ApiTags('audit-logs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN)
  @ApiOperation({ summary: "Agrégats du journal d'audit (tableau de bord)" })
  summary(@Query('organizationId') organizationId?: string) {
    return this.auditLogsService.summary({ organizationId });
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN)
  @ApiOperation({ summary: "Consulter le journal d'audit (accès restreint)" })
  findAll(
    @Query('organizationId') organizationId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.auditLogsService.findAll({
      organizationId,
      userId,
      action,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }
}
