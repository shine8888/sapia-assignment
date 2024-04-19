import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '../helpers/cache/cache.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;
  let cacheService: CacheService;

  beforeEach(async () => {
    const cacheServiceMock = {
      get: jest.fn(),
      setExprKey: jest.fn(),
      incr: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: cacheServiceMock,
        },
        {
          provide: 'CACHE_MANAGER',
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    cacheService = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;
    let request: any;

    beforeEach(() => {
      request = {
        headers: {
          authorization: 'Bearer token',
        },
      };
      context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;
    });

    it('should return true if token is valid', async () => {
      const payload = { userId: 1 };
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.user).toEqual(payload);
    });

    it('should throw UnauthorizedException if token is missing', async () => {
      request.headers.authorization = undefined;

      await expect(guard.canActivate(context)).rejects.toThrow();
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

      await expect(guard.canActivate(context)).rejects.toThrow();
    });
  });

  describe('checkAttempsLogin', () => {
    it('should return false and lock user if login attempts exceed limit', async () => {
      const username = 'testuser';
      const loginKey = `login_attempts:${username}`;
      const cachedValue = 3;

      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedValue);
      jest.spyOn(cacheService, 'setExprKey').mockResolvedValue(undefined);

      const result = await guard.checkAttempsLogin(username);

      expect(result).toBe(false);
      expect(cacheService.setExprKey).toHaveBeenCalledWith(
        loginKey,
        'locked',
        'EX',
        expect.any(Number),
      );
    });

    it('should return true and increment login attempts if user is not locked', async () => {
      const username = 'testuser';
      const loginKey = `login_attempts:${username}`;
      const cachedValue = 2;

      jest.spyOn(cacheService, 'get').mockResolvedValue(cachedValue);
      jest.spyOn(cacheService, 'incr').mockResolvedValue(undefined);

      const result = await guard.checkAttempsLogin(username);

      expect(result).toBe(true);
      expect(cacheService.incr).toHaveBeenCalledWith(loginKey);
    });
  });
});
