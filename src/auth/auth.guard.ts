import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CacheService } from '../helpers/cache/cache.service';
import { FIVE_MINUTES_IN_SECONDS } from '../constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private cacheService: CacheService,
  ) {}

  async checkAttempsLogin(username: string): Promise<boolean> {
    const loginKey = `login_attempts:${username}`;

    // Check if user is locked
    const cachedValue = await this.cacheService.get(loginKey);

    // // Update login attempts
    if (cachedValue === 'locked' || cachedValue >= 3) {
      await this.cacheService.setExprKey(
        loginKey,
        'locked',
        'EX',
        FIVE_MINUTES_IN_SECONDS,
      );
      return false;
    }

    await this.cacheService.incr(loginKey);

    return true;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
