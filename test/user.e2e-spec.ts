import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserController } from '../src/users/users.controller';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../src/users/users.service';

describe('UserController (e2e)', () => {
  let controller: UserController;
  let app: INestApplication;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            registerUser: jest
              .fn()
              .mockResolvedValue({ message: 'User registered successfully' }),
            loginUser: jest.fn().mockResolvedValue('token'),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    controller = app.get<UserController>(UserController);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should register a new user', () => {
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'test1@example.com', password: 'password123' })
      .expect(201)
      .expect((res) => {
        expect(res.body.message).toEqual('User registered successfully');
      });
  });

  it('should login a user', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201)
      .expect(async (res) => {
        expect(res.body.message).toEqual('Login successful');
        expect(res.body.token).toEqual('token');
      });
  });
});
