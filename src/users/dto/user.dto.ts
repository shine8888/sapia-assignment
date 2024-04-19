import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { User } from '../entities/user.entity';

export class CreateUserInput {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UpdateUserInput extends OmitType(CreateUserInput, [
  'password',
] as const) {}

export class UserPayload extends PartialType(User) {
  createdAt?: string;
  updateAt?: string;
}
