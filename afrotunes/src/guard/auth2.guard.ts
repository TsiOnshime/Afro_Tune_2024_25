import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const { authorization }: any = request.headers;

      if (!authorization || authorization.trim() === '') {
        throw new UnauthorizedException('Please provide a token');
      }

      const authToken = authorization.replace(/bearer/gim, '').trim();
      await this.authService.validateToken(authToken);

     

      return true;
    } catch (error) {
      console.log('Authentication error:', error.message);
      throw new UnauthorizedException(error.message || 'Session expired! Please sign in');
    }
  }
}
