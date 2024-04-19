import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { User, UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/auth.guard';
import { CacheService } from '../helpers/cache/cache.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [UserService, JwtModule, AuthGuard, CacheService, Logger],
  controllers: [UserController],
})
export class UserModule {}
