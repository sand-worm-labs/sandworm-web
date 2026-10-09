import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { validate as isUuid } from 'uuid';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatService } from '@/features/chat/chat.service';
import { RedisService } from './redis.service';
import { AiJobEvent, AiJobEventNames } from '@/core/events/ai-job.events';
import pLimit from 'p-limit';

interface RawAiJobEvent {
  chat_id?: string;
  type: AiJobEvent['type'];
  [key: string]: unknown;
}

const CATCH_UP_MS = 5 * 1000;

@Injectable()
export class AiJobListenerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiJobListenerService.name);
  private readonly buffer = new Map<string, RawAiJobEvent[]>();
  private readonly validatedChats = new Map<string, number>();
  private readonly limit = pLimit(50);
  // Tail of each job's event chain: events of one job run strictly in order,
  // different jobs run in parallel (bounded by `limit`).
  private readonly jobTails = new Map<string, Promise<void>>();
  // How many of each job's events have been read from its list in Redis.
  private readonly read = new Map<string, number>();

  // As long as Redis keeps a job's events, and well past the longest chat run
  // (AGENT_MAX_SECONDS in the AI service), so a job never loses its early
  // events while it is still going.
  private readonly BUFFER_TTL_MS = 60 * 60 * 1000;
  private readonly VALIDATED_TTL_MS = 60 * 60 * 1000;

  private catchUpTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly redisService: RedisService,
    private readonly chatService: ChatService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Listening for AI job events');
    // A message only says that a job has something new. The events are read
    // from the job's list in Redis, which keeps them in order, so nothing is
    // handled twice or skipped however the news arrives.
    this.redisService.psubscribe('ai:job:*', channel => this.enqueueForJob(this.extractJobId(channel)));
    // Messages published while the subscriber was away never arrive, so every
    // time it connects, look at each job that has events waiting.
    this.redisService.onSubscriberReady(() => void this.catchUp());
    // And every few seconds, in case the one message that went missing was a
    // job's last: nothing would come after it to say there is more to read.
    this.catchUpTimer = setInterval(() => void this.catchUp(), CATCH_UP_MS);
    this.catchUpTimer.unref();
    await this.catchUp();
  }

  onModuleDestroy(): void {
    if (this.catchUpTimer) clearInterval(this.catchUpTimer);
  }

  private async catchUp(): Promise<void> {
    try {
      const keys = await this.redisService.keys('ai:job:*:events');
      keys.forEach(key => this.enqueueForJob(this.extractJobId(key)));
    } catch (err) {
      this.logger.error('Could not catch up on AI job events', err);
    }
  }

  private enqueueForJob(jobId: string): void {
    const prev = this.jobTails.get(jobId) ?? Promise.resolve();
    const tail = prev.then(() =>
      this.limit(async () => {
        try {
          await this.readNewEvents(jobId);
        } catch (err) {
          this.logger.error(`[job:${jobId}] Unhandled error`, err);
        }
      }),
    );
    this.jobTails.set(jobId, tail);
    void tail.then(() => {
      if (this.jobTails.get(jobId) === tail) this.jobTails.delete(jobId);
    });
  }

  private async readNewEvents(jobId: string): Promise<void> {
    const messages = await this.redisService.lrange(`ai:job:${jobId}:events`, this.read.get(jobId) ?? 0, -1);
    for (const message of messages) {
      this.read.set(jobId, (this.read.get(jobId) ?? 0) + 1);
      await this.handleJobEvent(`ai:job:${jobId}`, message);
    }
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
    // Saved before it is streamed: whatever the user has seen is already in
    // the database, so leaving the chat, or the AI service dying halfway
    // through an answer, loses nothing.
    await this.save(jobId, raw.chat_id!);
    await this.emitJobEvent(jobId, raw);

    if (raw.type === 'message_stop' || raw.type === 'error') {
      await this.finish(jobId, raw.chat_id!, eventsKey);
    }
  };

  private async save(jobId: string, chatId: string): Promise<void> {
    try {
      await this.chatService.saveMessageByJobId(chatId, jobId, this.buffer.get(jobId) ?? []);
    } catch (err) {
      // The next event saves everything again, so the stream carries on.
      this.logger.error(`[job:${jobId}] could not save the answer so far`, err);
    }
  }

  private async emitJobEvent(jobId: string, raw: RawAiJobEvent): Promise<void> {
    const { chat_id, type, ...rest } = raw;
    const event: AiJobEvent = {
      chatId: chat_id!,
      jobId,
      type,
      payload: rest,
    };
    try {
      // Awaited so a job's events reach the chat in the order they were written.
      await this.eventEmitter.emitAsync(AiJobEventNames.AI_JOB_EVENT, event);
    } catch (err) {
      // Already saved: the chat shows it the next time it loads.
      this.logger.error(`[job:${jobId}] could not stream a ${type} event`, err);
    }
  }

  private enqueue(jobId: string, event: RawAiJobEvent): void {
    if (!this.buffer.has(jobId)) {
      this.buffer.set(jobId, []);
      setTimeout(() => {
        if (this.buffer.has(jobId)) {
          this.logger.warn(`[job:${jobId}] TTL expired, evicting buffer`);
          this.buffer.delete(jobId);
          this.read.delete(jobId);
        }
      }, this.BUFFER_TTL_MS).unref();
    }
    this.buffer.get(jobId)!.push(event);
  }

  private async finish(jobId: string, chatId: string, eventsKey: string): Promise<void> {
    const count = this.buffer.get(jobId)?.length ?? 0;
    this.buffer.delete(jobId);
    this.read.delete(jobId);
    await this.redisService.del(eventsKey);

    this.logger.log(`[job:${jobId}] saved ${count} events for chat ${chatId}`);
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
