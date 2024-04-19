import { Cache } from 'cache-manager';
import { RedisStore } from 'cache-manager-redis-store';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';

@Injectable({})
export class CacheService {
  redisClient;
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache & RedisStore,
  ) {
    this.redisClient = (this.cache.store as any).getClient();
  }

  async get<T = unknown>(key: string) {
    return this.redisClient.get(key);
  }

  async set(key: string, value: any, seconds = 600 /* 10min */) {
    return this.redisClient.set(key, value, { ttl: seconds }, null);
  }

  async del(key: string) {
    return this.redisClient.del(key);
  }

  async setExprKey(
    key: string,
    value: any,
    expr: string,
    seconds: number /* 10min */,
  ) {
    return await this.redisClient.set(key, value, { EX: seconds });
  }

  async incr(key: string) {
    const exists = await this.get(key);
    if (exists) {
      return this.redisClient.incr(key);
    } else {
      return this.redisClient.set(key, 1);
    }
  }

  getRedisClient() {
    return (this.cache.store as any).getClient();
  }
}
