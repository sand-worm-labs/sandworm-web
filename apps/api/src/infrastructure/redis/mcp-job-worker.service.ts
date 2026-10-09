import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

// The other half of the MCP server's waiting station (apps/mcp/src/lane.ts).
// The MCP server writes each API call to `mcp:jobs:<userId>`; this takes them
// when there is room, runs them against this API, and writes the answer to the
// list the caller is waiting on. Taking only what it can run now is what keeps a
// burst of MCP calls in Redis instead of in open connections here.
const USERS_KEY = 'mcp:users';
const jobsKey = (userId: string) => `mcp:jobs:${userId}`;

interface Job {
  id: string;
  replyTo: string;
  userId: string;
  token: string;
  expiresAt: number;
  call: { method: string; path: string; body?: unknown; timeoutMs: number };
}

const int = (name: string, fallback: number) => {
  const n = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

@Injectable()
export class McpJobWorkerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpJobWorkerService.name);
  private readonly concurrency = int('MCP_WORKER_CONCURRENCY', 50);
  private readonly perUser = int('MCP_WORKER_CONCURRENCY_PER_USER', 4);
  private readonly idleMs = 50;

  private redis: Redis;
  private running = 0;
  private readonly runningByUser = new Map<string, number>();
  // When each user last got a turn, so a user with a long backlog cannot starve the others.
  private readonly servedAt = new Map<string, number>();
  private turn = 0;
  private timer: NodeJS.Timeout | null = null;
  private stopped = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.redis = new Redis(this.config.get<string>('redis.url') ?? 'redis://localhost:6379');
    this.redis.on('error', err => this.logger.error('Redis error', err));
    this.schedule(0);
  }

  async onModuleDestroy(): Promise<void> {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    await this.redis.quit().catch(() => {});
  }

  private schedule(ms: number): void {
    if (this.stopped) return;
    this.timer = setTimeout(() => void this.fill(), ms);
  }

  // Takes jobs until every slot is busy or nothing is waiting.
  private async fill(): Promise<void> {
    try {
      while (!this.stopped && this.running < this.concurrency) {
        const job = await this.next();
        if (!job) break;
        this.start(job);
      }
    } catch (err) {
      this.logger.error('Failed to take MCP jobs', err);
    }
    this.schedule(this.idleMs);
  }

  private async next(): Promise<Job | null> {
    const users = await this.redis.smembers(USERS_KEY);
    const ready = users
      .filter(user => (this.runningByUser.get(user) ?? 0) < this.perUser)
      .sort((a, b) => (this.servedAt.get(a) ?? 0) - (this.servedAt.get(b) ?? 0));

    for (const user of ready) {
      const raw = await this.redis.lpop(jobsKey(user));
      if (raw === null) {
        await this.redis.srem(USERS_KEY, user);
        continue;
      }
      try {
        return JSON.parse(raw) as Job;
      } catch {
        this.logger.warn(`Dropped an unreadable MCP job for ${user}`);
      }
    }
    return null;
  }

  private start(job: Job): void {
    // The caller stopped waiting, so there is nobody to answer.
    if (job.expiresAt < Date.now()) return;

    this.running++;
    this.runningByUser.set(job.userId, (this.runningByUser.get(job.userId) ?? 0) + 1);
    this.servedAt.set(job.userId, ++this.turn);

    void this.execute(job)
      .catch(err => this.logger.error(`MCP job ${job.id} failed`, err))
      .finally(() => {
        this.running--;
        const left = (this.runningByUser.get(job.userId) ?? 1) - 1;
        if (left <= 0) this.runningByUser.delete(job.userId);
        else this.runningByUser.set(job.userId, left);
      });
  }

  private async execute(job: Job): Promise<void> {
    const { call } = job;
    const port = this.config.get<number>('app.port');
    let reply: { id: string; status?: number; json?: unknown; error?: string };

    try {
      const res = await fetch(`http://127.0.0.1:${port}${call.path}`, {
        method: call.method,
        headers: {
          Cookie: `access_token=${job.token}`,
          ...(call.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        body: call.body === undefined ? undefined : JSON.stringify(call.body),
        signal: AbortSignal.timeout(call.timeoutMs),
      });
      reply = { id: job.id, status: res.status, json: await res.json().catch(() => null) };
    } catch (err) {
      reply = { id: job.id, error: err instanceof Error ? err.message : 'Request to the API failed' };
    }

    await this.redis.multi().rpush(job.replyTo, JSON.stringify(reply)).expire(job.replyTo, 3600).exec();
  }
}
