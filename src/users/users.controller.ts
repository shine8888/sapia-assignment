import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Controller('api/auth')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthGuard,
  ) {}

  @Post('register')
  async registerUser(
    @Body() body: { email: string; password: string },
  ): Promise<{ message: string }> {
    const { email, password } = body;
    return await this.userService.registerUser(email, password);
  }

  @Post('login')
  async loginUser(
    @Body() body: { email: string; password: string },
  ): Promise<{ message: string; token?: string }> {
    const { email, password } = body;

    const isValidAttemps = await this.authService.checkAttempsLogin(email);

    if (!isValidAttemps) return { message: 'Fail' };

    const token = await this.userService.loginUser(email, password);
    return { message: 'Login successful', token };
  }
}
