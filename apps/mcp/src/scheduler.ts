// Every call to the Sandworm API goes through here. At most `concurrency` run at
// once, and at most `perUser` of those belong to one user. The rest wait in a
// queue per user, and free slots are handed out round-robin across the users
// who are waiting (the one served longest ago goes first), so a user with a long backlog cannot make anyone else wait
// for it to drain. A call that cannot be queued is rejected with QueueFullError.

export class QueueFullError extends Error {
  constructor() {
    super('The Sandworm MCP server is at capacity. Try again in a moment.');
  }
}

export type SchedulerOptions = {
  concurrency: number;
  perUser: number;
  maxQueued: number;
};

type Waiter = { start: () => void };

export class Scheduler {
  private running = 0;
  private queued = 0;
  private readonly runningByUser = new Map<string, number>();
  private readonly waiting = new Map<string, Waiter[]>();
  // When each user last got a slot, as a counter. A user never served sorts first.
  private readonly servedAt = new Map<string, number>();
  private turn = 0;

  private readonly options: SchedulerOptions;

  constructor(options: SchedulerOptions) {
    this.options = options;
  }

  stats() {
    return { running: this.running, queued: this.queued };
  }

  run<T>(userId: string, work: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const start = () => {
        this.running++;
        this.servedAt.set(userId, ++this.turn);
        this.runningByUser.set(userId, (this.runningByUser.get(userId) ?? 0) + 1);
        work()
          .then(resolve, reject)
          .finally(() => this.finish(userId));
      };

      if (this.canStart(userId) && this.queued === 0) return start();
      if (this.queued >= this.options.maxQueued) return reject(new QueueFullError());

      const lane = this.waiting.get(userId) ?? [];
      lane.push({ start });
      this.waiting.set(userId, lane);
      this.queued++;
    });
  }

  private canStart(userId: string): boolean {
    return this.running < this.options.concurrency && (this.runningByUser.get(userId) ?? 0) < this.options.perUser;
  }

  private finish(userId: string): void {
    this.running--;
    const left = (this.runningByUser.get(userId) ?? 1) - 1;
    if (left <= 0) this.runningByUser.delete(userId);
    else this.runningByUser.set(userId, left);
    if (left <= 0 && !this.waiting.has(userId)) this.servedAt.delete(userId);
    this.drain();
  }

  private drain(): void {
    while (this.running < this.options.concurrency) {
      let next: string | undefined;
      for (const user of this.waiting.keys()) {
        if (!this.canStart(user)) continue;
        if (next === undefined || (this.servedAt.get(user) ?? 0) < (this.servedAt.get(next) ?? 0)) next = user;
      }
      if (next === undefined) return;

      const lane = this.waiting.get(next)!;
      const waiter = lane.shift()!;
      if (lane.length === 0) this.waiting.delete(next);
      this.queued--;
      waiter.start();
    }
  }
}

const int = (name: string, fallback: number) => {
  const n = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const scheduler = new Scheduler({
  concurrency: int('MCP_MAX_CONCURRENT', 50),
  perUser: int('MCP_MAX_CONCURRENT_PER_USER', 4),
  maxQueued: int('MCP_MAX_QUEUED', 100_000),
});
