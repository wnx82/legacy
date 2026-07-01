import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '@legacy/shared';

interface KeycloakTokenPayload {
  sub: string;
  email: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async syncUserFromKeycloak(payload: KeycloakTokenPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.upsert({
      where: { keycloakId: payload.sub },
      update: {
        email: payload.email,
        firstName: payload.given_name ?? undefined,
        lastName: payload.family_name ?? undefined,
      },
      create: {
        keycloakId: payload.sub,
        email: payload.email,
        firstName: payload.given_name ?? 'Utilisateur',
        lastName: payload.family_name ?? 'Legacy',
      },
      include: { memberships: true },
    });

    const organizationId = user.memberships[0]?.organizationId;

    return {
      id: user.id,
      keycloakId: user.keycloakId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: payload.realm_access?.roles ?? [],
      organizationId,
    };
  }

  async getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { memberships: { include: { organization: true } }, livingProfile: true },
    });
  }
}
