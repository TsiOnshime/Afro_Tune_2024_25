import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from './roles.decorator';
import { UserRole } from 'src/schemas/user-role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Ensure requiredRoles is defined
    if (!requiredRoles) {
      return true; // No specific roles required, allow access
    }

    // Retrieve user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Ensure user object exists and has a role property
    if (!user || !user.role) {
      // Handle case where user or user role is missing
      return false; // Deny access
    }

    // Check if user role matches any of the required roles
    return requiredRoles.some(role => user.role === role);
  }
}
