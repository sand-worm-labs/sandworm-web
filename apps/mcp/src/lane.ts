import { randomUUID } from 'node:crypto';

import { Redis } from 'ioredis';

import { QueueFullError, scheduler } from './scheduler.ts';

// A call to the Sandworm API, and what came back. `path` is the full path, such as /api/graphql.
export type ApiCall = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  timeoutMs: number;
};
export type ApiReply = { status: number; json: unknown };

export type Caller = { userId: string; token: string; apiUrl: string };

// What the API's worker reads from `mcp:jobs:<userId>` (apps/api/.../mcp-job-worker.service.ts).
type Job = { id: string; replyTo: string; userId: string; token: string; expiresAt: number; call: ApiCall };
type Result = { id: string; status: number; json: unknown; error?: string };

export const JOB_USERS_KEY = 'mcp:users';
export const jobsKey = (userId: string) => `mcp:jobs:${userId}`;

const MAX_QUEUED_PER_USER = 10_000;
// How long a call may sit in the queue on top of its own time limit.
const QUEUE_WAIT_MS = 120_000;

// The waiting station. A call is written to Redis and the API's worker takes it
// when it has room, so a burst waits there as data instead of as open
// connections. One blocking read per MCP process hands replies to the callers.
export class RedisLane {
  private readonly pub: Redis;
  private readonly sub: Redis;
  private readonly replyKey = `mcp:replies:${randomUUID()}`;
  private readonly waiters = new Map<string, { resolve: (r: ApiReply) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>();
  private closed = false;

  constructor(url: string) {
    this.pub = new Redis(url);
    this.sub = new Redis(url);
    this.pub.on('error', err => console.error('Redis lane error', err));
    this.sub.on('error', err => console.error('Redis lane reader error', err));
    void this.readReplies();
  }

  async submit(caller: Pick<Caller, 'userId' | 'token'>, call: ApiCall): Promise<ApiReply> {
    const key = jobsKey(caller.userId);
    if ((await this.pub.llen(key)) >= MAX_QUEUED_PER_USER) throw new QueueFullError();

    const waitMs = call.timeoutMs + QUEUE_WAIT_MS;
    const job: Job = {
      id: randomUUID(),
      replyTo: this.replyKey,
      userId: caller.userId,
      token: caller.token,
      expiresAt: Date.now() + waitMs,
      call,
    };

    const reply = new Promise<ApiReply>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters.delete(job.id);
        reject(new Error('Timed out waiting for the Sandworm API'));
      }, waitMs);
      this.waiters.set(job.id, { resolve, reject, timer });
    });

    try {
      await this.pub.multi().rpush(key, JSON.stringify(job)).sadd(JOB_USERS_KEY, caller.userId).exec();
    } catch (err) {
      const w = this.waiters.get(job.id);
      if (w) clearTimeout(w.timer);
      this.waiters.delete(job.id);
      throw err;
    }
    return reply;
  }

  async close(): Promise<void> {
    this.closed = true;
    this.sub.disconnect();
    await this.pub.quit().catch(() => {});
  }

  private async readReplies(): Promise<void> {
    while (!this.closed) {
      try {
        const item = await this.sub.blpop(this.replyKey, 5);
        if (!item) continue;
        const result = JSON.parse(item[1]) as Result;
        const waiter = this.waiters.get(result.id);
        if (!waiter) continue; // the caller already gave up
        clearTimeout(waiter.timer);
        this.waiters.delete(result.id);
        if (result.error) waiter.reject(new Error(result.error));
        else waiter.resolve({ status: result.status, json: result.json });
      } catch (err) {
        if (this.closed) return;
        console.error('Redis lane read failed, retrying', err);
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
}

// The same Redis the API and the AI service use, under the same name: the
// API's worker reads these jobs from its own REDIS_URL.
const redisUrl = process.env.REDIS_URL;
const lane = redisUrl ? new RedisLane(redisUrl) : null;

async function direct(caller: Caller, call: ApiCall): Promise<ApiReply> {
  const res = await fetch(`${caller.apiUrl}${call.path}`, {
    method: call.method,
    headers: {
      Cookie: `access_token=${caller.token}`,
      ...(call.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: call.body === undefined ? undefined : JSON.stringify(call.body),
    signal: AbortSignal.timeout(call.timeoutMs),
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

// Every call to the API goes through here. With REDIS_URL set it waits in
// Redis for the API's worker; without it, it runs here under the in-memory
// scheduler, so the tests need no Redis.
export function callApi(caller: Caller, call: ApiCall): Promise<ApiReply> {
  if (lane) return lane.submit(caller, call);
  return scheduler.run(caller.userId, () => direct(caller, call));
}
