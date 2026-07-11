import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeathCasesService } from './death-cases.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '@legacy/shared';

@ApiTags('death-cases')
@Controller('family-invites')
export class FamilyInvitesController {
  constructor(private readonly deathCasesService: DeathCasesService) {}

  @Public()
  @Get(':token')
  @ApiOperation({ summary: "Résout une invitation famille avant connexion (infos publiques minimales)" })
  info(@Param('token') token: string) {
    return this.deathCasesService.getFamilyInviteInfo(token);
  }

  @Post(':token/accept')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Accepte une invitation famille (utilisateur connecté) et renvoie le dossier lié" })
  accept(@Param('token') token: string, @CurrentUser() user: AuthenticatedUser) {
    return this.deathCasesService.acceptFamilyInvite(token, user.id);
  }
}
