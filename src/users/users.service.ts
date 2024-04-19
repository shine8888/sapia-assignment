import {
  Injectable,
  NotFoundException,
  Logger,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async registerUser(
    email: string,
    password: string,
  ): Promise<{ message: string }> {
    try {
      const existedUser = await this.userModel.findOne({ email });

      if (existedUser) throw new BadRequestException('User already exists');

      const hash = await bcrypt.hash(password, 10);
      await this.userModel.create({ email, password: hash });

      return { message: 'User registered successfully' };
    } catch (error) {
      throw new Error('An error occurred while registering the user');
    }
  }

  async loginUser(email: string, password: string): Promise<string> {
    try {
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid login credentials');
      }

      const payload = { userId: user._id };
      const token = this.jwtService.sign(payload);

      return token;
    } catch (error) {
      throw new UnauthorizedException('An error occurred while logging in');
    }
  }
}
