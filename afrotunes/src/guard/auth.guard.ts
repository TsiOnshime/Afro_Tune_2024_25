import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserRole } from 'src/schemas/user-role.enum';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const { authorization }: any = request.headers;

      if (!authorization || authorization.trim() === '') {
        throw new UnauthorizedException('Please provide a token');
      }

      const authToken = authorization.replace(/bearer/gim, '').trim();
      const decodedData = await this.authService.validateToken(authToken);

      // Extract user role from decoded data
      const userRole: UserRole = decodedData.role;

      // Log user details including the token and role
      console.log('User Details:', {
        token: authToken,
        user: decodedData,
        role: userRole,
      });

      // Attach decoded data to the request for later use
      request.decodedData = decodedData;

      // Check user's role for admin and super admin
      if (userRole !== UserRole.ARTIST && userRole !== UserRole.SUPER_ADMIN) {
        throw new ForbiddenException('Insufficient permissions');
      }

      return true;
    } catch (error) {
      console.log('Auth error:', error.message);
      throw new ForbiddenException(error.message || 'Session expired! Please sign in');
    }
  }
}
