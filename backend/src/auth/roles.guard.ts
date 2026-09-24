import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import {
  AppRole,
  ROLES_KEY,
} from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<AppRole[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request =
      context.switchToHttp().getRequest();

    const user = request.user;

    if (!user?.role) {
      throw new ForbiddenException(
        'Staff role required',
      );
    }

    if (
      !requiredRoles.includes(
        user.role as AppRole,
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission for this resource',
      );
    }

    return true;
  }
}
