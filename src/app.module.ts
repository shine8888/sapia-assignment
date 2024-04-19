import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerConfig } from './helpers/cloud-config/config.throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useClass: ThrottlerConfig,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI || '', {
      dbName: process.env.DATABASE_NAME,
    }),
    UserModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configs: ConfigService) => ({
        isGlobal: true,
        max: 10000,
        store: (): any =>
          redisStore({
            commandsQueueMaxLength: 10000,
            socket: {
              host: process.env.REDIS_HOST || '',
              port: Number(process.env.REDIS_PORT || 6379),
            },
          }),
      }),
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
