import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
  minutes,
} from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import Redis from 'ioredis';

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createThrottlerOptions(): Promise<ThrottlerModuleOptions> {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const db = this.configService.get<number>('REDIS_DB');

    const redis = new Redis({
      port: port,
      host: host,
      db: db,
      maxRetriesPerRequest: 0,
      lazyConnect: true,
    });
    return {
      throttlers: [
        {
          ttl: minutes(5),
          limit: 30,
        },
      ],
      storage: new ThrottlerStorageRedisService(redis), // Add the 'storage' property to the 'ThrottlerModuleOptions' interface
    };
  }
}
