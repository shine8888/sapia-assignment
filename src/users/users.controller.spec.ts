import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let authService: AuthGuard;

  beforeEach(async () => {
    const authServiceMock = {
      checkAttempsLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            registerUser: jest.fn(),
            loginUser: jest.fn(),
            getUsers: jest.fn(),
            constructor: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthGuard>(AuthGuard);
  });

  describe('constructor', () => {
    it('should create an instance of UserController', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const expectedResult = { message: 'User registered successfully' };

      jest
        .spyOn(userService, 'registerUser')
        .mockResolvedValueOnce({ message: 'User registered successfully' });

      const result = await controller.registerUser({ email, password });

      expect(userService.registerUser).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('loginUser', () => {
    it('should login a user and return a token', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const token = 'token';
      const expectedResult = { message: 'Login successful', token };

      jest.spyOn(authService, 'checkAttempsLogin').mockResolvedValueOnce(true);

      jest.spyOn(userService, 'loginUser').mockResolvedValueOnce(token);

      const result = await controller.loginUser({ email, password });

      expect(userService.loginUser).toHaveBeenCalledWith(email, password);
      expect(result).toEqual(expectedResult);
    });

    it('should return a message if login fails', async () => {
      const email = '';
      const password = 'password';
      const expectedResult = { message: 'Fail' };

      jest.spyOn(authService, 'checkAttempsLogin').mockResolvedValueOnce(false);

      const result = await controller.loginUser({ email, password });

      expect(authService.checkAttempsLogin).toHaveBeenCalledWith(email);
      expect(result).toEqual(expectedResult);
    });
  });
});
