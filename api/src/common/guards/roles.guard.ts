import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '@legacy/shared';
import type { AuthenticatedUser } from '@legacy/shared';

/**
 * Applique le principe du moindre privilège : une route sans @Roles() reste
 * accessible à tout utilisateur authentifié : les routes sensibles doivent
 * déclarer explicitement les rôles autorisés.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    const hasRole = user?.roles?.some((role) => requiredRoles.includes(role as UserRole));

    if (!hasRole) {
      throw new ForbiddenException("Vous n'avez pas les droits nécessaires pour cette action.");
    }
    return true;
  }
}
