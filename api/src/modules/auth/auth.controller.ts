import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@legacy/shared';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @ApiOperation({ summary: "Retourne le profil de l'utilisateur authentifié" })
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Termine la session applicative',
    description:
      "Keycloak reste le fournisseur d'identité : cette route ne fait qu'invalider l'état côté API. " +
      'La déconnexion complète (SSO) doit rediriger le client vers le endpoint end-session de Keycloak.',
  })
  logout() {
    return;
  }
}
