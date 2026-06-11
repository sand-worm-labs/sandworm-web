import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.get<string>('redis.url') ?? 'redis://localhost:6379';
    this.client = new Redis(url, { lazyConnect: false });
    this.client.on('error', (err) => this.logger.error('Redis client error', err));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  getClient(): Redis {
    return this.client;
  }

  createSubscriber(): Redis {
    return this.client.duplicate();
  }
}
