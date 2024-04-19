import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './users.service';
import { Model } from 'mongoose';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const hash = await bcrypt.hash(password, 10);
      const createUserSpy = jest
        .spyOn(userModel, 'create')
        .mockResolvedValueOnce(undefined as never);
      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(null);

      const result = await service.registerUser(email, password);

      expect(findOneSpy).toHaveBeenCalledWith({ email });
      expect(createUserSpy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should throw BadRequestException if user already exists', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce({});

      await expect(service.registerUser(email, password)).rejects.toThrow();
      expect(findOneSpy).toHaveBeenCalledWith({ email });
    });

    it('should throw an error if an error occurs during registration', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockRejectedValueOnce(new Error());

      await expect(service.registerUser(email, password)).rejects.toThrow();
      expect(findOneSpy).toHaveBeenCalledWith({ email });
    });
  });

  describe('loginUser', () => {
    it('should login a user and return a token', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = {
        _id: '123',
        email,
        password: await bcrypt.hash(password, 10),
      };
      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(user);
      const compareSpy = jest
        .spyOn(bcrypt, 'compare')
        .mockResolvedValueOnce(true);
      const signSpy = jest
        .spyOn(jwtService, 'sign')
        .mockReturnValueOnce('token');

      const result = await service.loginUser(email, password);

      expect(findOneSpy).toHaveBeenCalledWith({ email });
      expect(compareSpy).toHaveBeenCalledWith(password, user.password);
      expect(signSpy).toHaveBeenCalledWith({ userId: user._id });
      expect(result).toBe('token');
    });

    it('should throw NotFoundException if user is not found', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(null);

      await expect(service.loginUser(email, password)).rejects.toThrow();
      expect(findOneSpy).toHaveBeenCalledWith({ email });
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = {
        _id: '123',
        email,
        password: 'hashedpassword',
      };
      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValueOnce(user);
      const compareSpy = jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(service.loginUser(email, password)).rejects.toThrow();
      expect(findOneSpy).toHaveBeenCalledWith({ email });
      expect(compareSpy).toHaveBeenCalledWith(password, user.password);
    });

    it('should throw an error if an error occurs during login', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const findOneSpy = jest
        .spyOn(userModel, 'findOne')
        .mockRejectedValueOnce(new Error('User not found'));

      await expect(service.loginUser(email, password)).rejects.toThrowError();
      expect(findOneSpy).toHaveBeenCalledWith({ email });
    });
  });
});
