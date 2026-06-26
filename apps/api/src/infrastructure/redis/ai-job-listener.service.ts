import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { validate as isUuid } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatService } from '@/features/chat/chat.service';
import { RedisService } from './redis.service';
import { AiJobEvent, AiJobEventNames } from '@/core/events/ai-job.events';
import { BlockActionEvent, BlockActionEventNames } from '@/core/events/block-action.events';
import pLimit from 'p-limit';

interface RawAiJobEvent {
  chat_id?: string;
  type: AiJobEvent['type'];
  [key: string]: unknown;
}

@Injectable()
export class AiJobListenerService implements OnModuleInit {
  private readonly logger = new Logger(AiJobListenerService.name);
  private readonly buffer = new Map<string, RawAiJobEvent[]>();
  private readonly validatedChats = new Map<string, number>();
  private readonly limit = pLimit(50);

  private readonly BUFFER_TTL_MS = 10 * 60 * 1000;
  private readonly VALIDATED_TTL_MS = 60 * 60 * 1000;

  constructor(
    private readonly redisService: RedisService,
    private readonly chatService: ChatService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Listening for AI job events');
    await this.redisService.catchUpAndSubscribe((channel, message) => {
      void this.limit(async () => {
        try {
          await this.handleJobEvent(channel, message);
        } catch (err) {
          this.logger.error(`[${channel}] Unhandled error`, err);
        }
      });
    });
  }

  private handleJobEvent = async (channel: string, message: string): Promise<void> => {
    const jobId = this.extractJobId(channel);
    const eventsKey = `ai:job:${jobId}:events`;
    const raw = this.parseEvent(message);

    if (!raw) {
      this.logger.warn(`[${channel}] Unparseable message, skipping`);
      return;
    }

    const isValid = await this.validateEvent(raw, jobId, eventsKey);
    if (!isValid) return;

    this.enqueue(jobId, raw);
    this.emitJobEvent(jobId, raw);

    if (raw.type === 'completed' || raw.type === 'error') {
      await this.flush(jobId, raw.chat_id!, eventsKey);
    }
  };

  private emitJobEvent(jobId: string, raw: RawAiJobEvent): void {
    const { chat_id, type, ...rest } = raw;
    const event: AiJobEvent = {
      chatId: chat_id!,
      jobId,
      type,
      payload: rest,
    };
    this.eventEmitter.emit(AiJobEventNames.AI_JOB_EVENT, event);

    if (type === 'block_ready') {
      const blockEvent: BlockActionEvent = {
        action: 'created',
        blockId: (rest as any).block_id ?? '',
        blockType: (rest as any).block_type ?? '',
        blockTitle: (rest as any).block_title ?? '',
        chatId: chat_id!,
      };
      this.eventEmitter.emit(BlockActionEventNames.BLOCK_ACTION, blockEvent);
    }
  }

  private enqueue(jobId: string, event: RawAiJobEvent): void {
    if (!this.buffer.has(jobId)) {
      this.buffer.set(jobId, []);
      setTimeout(() => {
        if (this.buffer.has(jobId)) {
          this.logger.warn(`[job:${jobId}] TTL expired, evicting buffer`);
          this.buffer.delete(jobId);
        }
      }, this.BUFFER_TTL_MS);
    }
    this.buffer.get(jobId)!.push(event);
  }

  private async flush(jobId: string, chatId: string, eventsKey: string): Promise<void> {
    const events = this.buffer.get(jobId) ?? [];
    this.buffer.delete(jobId);

    if (events.length === 0) return;

    await this.chatService.createOrAppendMessageByJobId(chatId, jobId, events);
    await this.redisService.del(eventsKey);

    this.logger.log(`[job:${jobId}] flushed ${events.length} events for chat ${chatId}`);
  }

  private async validateEvent(
    event: RawAiJobEvent,
    jobId: string,
    eventsKey: string,
  ): Promise<boolean> {
    if (!event.chat_id || !isUuid(event.chat_id)) {
      this.logger.warn(`Invalid or missing chat_id on job ${jobId}`);
      await this.redisService.del(eventsKey);
      return false;
    }

    if (this.isValidationCached(event.chat_id)) return true;

    const exists = await this.chatService.chatExists(event.chat_id);
    if (!exists) {
      this.logger.warn(`chat_id ${event.chat_id} not found, deleting job ${jobId}`);
      await this.redisService.del(eventsKey);
      return false;
    }

    this.cacheValidation(event.chat_id);
    return true;
  }

  private cacheValidation(chatId: string): void {
    this.validatedChats.set(chatId, Date.now());
  }

  private isValidationCached(chatId: string): boolean {
    const ts = this.validatedChats.get(chatId);
    if (!ts) return false;
    if (Date.now() - ts > this.VALIDATED_TTL_MS) {
      this.validatedChats.delete(chatId);
      return false;
    }
    return true;
  }

  private extractJobId(channel: string): string {
    return channel.split(':')[2] ?? channel;
  }

  private parseEvent(message: string): RawAiJobEvent | null {
    try {
      return JSON.parse(message) as RawAiJobEvent;
    } catch {
      return null;
    }
  }
}
