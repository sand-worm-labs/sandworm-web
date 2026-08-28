import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

type MessageHandler = (message: string) => void;
type PatternHandler = (channel: string, message: string) => void;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private subscriber: Redis;
  private readonly handlers = new Map<string, Set<MessageHandler>>();
  private readonly patternHandlers = new Map<string, Set<PatternHandler>>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const url = this.configService.get('redis.url', { infer: true });
    this.client = new Redis(url, { lazyConnect: false });
    this.subscriber = this.client.duplicate();

    this.client.on('error', (err) => this.logger.error('Redis client error', err));
    this.subscriber.on('error', (err) => this.logger.error('Redis subscriber error', err));

    this.subscriber.on('message', (chan, message) => {
      this.handlers.get(chan)?.forEach((fn) => fn(message));
    });

    this.subscriber.on('pmessage', (pattern, channel, message) => {
      this.patternHandlers.get(pattern)?.forEach((fn) => fn(channel, message));
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber.quit();
    await this.client.quit();
  }

  publish(channel: string, message: string): void {
    this.client.publish(channel, message);
  }

  subscribe(channel: string, handler: MessageHandler): void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      this.subscriber.subscribe(channel);
    }
    this.handlers.get(channel)!.add(handler);
  }

  psubscribe(pattern: string, handler: PatternHandler): void {
    if (!this.patternHandlers.has(pattern)) {
      this.patternHandlers.set(pattern, new Set());
      this.subscriber.psubscribe(pattern);
    }
    this.patternHandlers.get(pattern)!.add(handler);
  }

  async catchUpAndSubscribe(handler: PatternHandler): Promise<void> {
    const keys = await this.client.keys('ai:job:*:events');
    for (const key of keys) {
      const jobId = key.split(':')[2];
      const missed = await this.client.lrange(key, 0, -1);
      for (const event of missed) {
        handler(`ai:job:${jobId}`, event);
      }
    }
    this.psubscribe('ai:job:*', handler);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Pushes onto a Redis list and TTLs it — used for the block-result handoff
  // (Node → sidecar): the sidecar BLPOPs the same key, which survives even
  // if it starts waiting slightly after this push (unlike pub/sub).
  async rpush(key: string, value: string, ttlSeconds = 300): Promise<void> {
    await this.client.rpush(key, value);
    await this.client.expire(key, ttlSeconds);
  }

  unsubscribe(channel: string, handler: MessageHandler): void {
    const set = this.handlers.get(channel);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.handlers.delete(channel);
      this.subscriber.unsubscribe(channel);
    }
  }
}
