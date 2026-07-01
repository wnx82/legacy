import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@legacy/shared';

@ApiTags('stats')
@ApiBearerAuth()
@Controller()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('organizations/:id/stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.FUNERAL_HOME_ADMIN, UserRole.FUNERAL_ADVISOR)
  @ApiOperation({ summary: "Statistiques d'usage du portail professionnel pour une organisation" })
  getOrganizationStats(@Param('id') id: string) {
    return this.statsService.getOrganizationStats(id);
  }

  @Get('stats/platform')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Statistiques globales de la plateforme (SUPER_ADMIN)' })
  getPlatformStats() {
    return this.statsService.getPlatformStats();
  }

  @Get('stats/living-profiles/average-progress')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Score de préparation moyen des dossiers vivants' })
  getLivingProfilesAverageProgress() {
    return this.statsService.getLivingProfilesAverageProgress();
  }
}
