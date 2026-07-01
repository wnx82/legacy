import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { AuthService } from '../auth.service';
import type { AuthenticatedUser } from '@legacy/shared';

interface KeycloakTokenPayload {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  realm_access?: { roles: string[] };
}

/**
 * Valide les JWT émis par Keycloak (access tokens) via les clés publiques
 * exposées sur le endpoint JWKS du realm — aucune vérification de session
 * ni d'appel réseau à Keycloak à chaque requête (mise en cache des clés).
 */
@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const keycloakUrl = configService.getOrThrow<string>('KEYCLOAK_URL');
    const realm = configService.getOrThrow<string>('KEYCLOAK_REALM');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
      }),
      issuer: `${keycloakUrl}/realms/${realm}`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: KeycloakTokenPayload): Promise<AuthenticatedUser> {
    // Provisionne (ou met à jour) l'utilisateur local à partir du token —
    // évite un flux d'inscription séparé côté API tout en gardant Keycloak
    // comme unique source de vérité pour l'identité et le mot de passe.
    return this.authService.syncUserFromKeycloak(payload);
  }
}
