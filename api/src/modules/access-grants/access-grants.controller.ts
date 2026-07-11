import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AccessGrantsService } from './access-grants.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ActivateAccessGrantSchema,
  RequestAccessGrantSchema,
  UserRole,
  type ActivateAccessGrantDto,
  type AuthenticatedUser,
  type RequestAccessGrantDto,
} from '@legacy/shared';

@ApiTags('access-grants')
@ApiBearerAuth()
@Controller('access-grants')
export class AccessGrantsController {
  constructor(private readonly accessGrants: AccessGrantsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN, UserRole.FUNERAL_ADVISOR, UserRole.TRUSTED_PERSON)
  @ApiOperation({ summary: "Demande d'accès aux données d'un défunt (statut PENDING)" })
  request(
    @Body(new ZodValidationPipe(RequestAccessGrantSchema)) dto: RequestAccessGrantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.accessGrants.request(dto, user);
  }

  @Get('mine')
  @ApiOperation({ summary: "Accès actifs dont je suis bénéficiaire" })
  listMine(@CurrentUser() user: AuthenticatedUser) {
    return this.accessGrants.listMine(user);
  }

  @Get()
  @ApiOperation({ summary: "Liste des accès d'un dossier vivant (autorité)" })
  list(@Query('livingProfileId') livingProfileId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.accessGrants.listForLivingProfile(livingProfileId, user);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: "Active un accès (autorité ou personne de confiance habilitée)" })
  activate(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(ActivateAccessGrantSchema)) dto: ActivateAccessGrantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.accessGrants.activate(id, dto, user);
  }

  @Post(':id/suspend')
  suspend(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.accessGrants.suspend(id, user);
  }

  @Post(':id/revoke')
  revoke(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.accessGrants.revoke(id, user);
  }
}
