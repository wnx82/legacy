import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VersionService } from './version.service';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@legacy/shared';

@ApiTags('version')
@Controller()
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  /** Public : version du conteneur en cours d'exécution (utilisée par le polling de déploiement). */
  @Public()
  @Get('version')
  @ApiOperation({ summary: 'Version actuelle du conteneur (public)' })
  getVersion() {
    return this.versionService.getVersion();
  }

  /** Réservé SUPER_ADMIN : compare la version locale à la dernière version publiée sur GitHub. */
  @Get('version-check')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vérifie si une mise à jour est disponible (SUPER_ADMIN)' })
  checkForUpdate() {
    return this.versionService.checkForUpdate();
  }
}
