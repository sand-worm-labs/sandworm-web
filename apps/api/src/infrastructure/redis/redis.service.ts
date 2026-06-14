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
