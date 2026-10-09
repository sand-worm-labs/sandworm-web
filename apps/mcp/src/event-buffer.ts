// Holds events per key (an AI job id) in arrival order until the key is done.
// Bounded three ways so a stuck or noisy job cannot grow the process forever:
// events per key, number of keys, and how long a key may sit without a new event.

export type EventBufferOptions = {
  maxEventsPerKey: number;
  maxKeys: number;
  ttlMs: number;
  // Called with whatever a key held when it expired, so nothing is lost silently.
  onExpire?: (key: string, events: unknown[]) => void;
};

type Entry = { events: unknown[]; timer: NodeJS.Timeout };

export class EventBuffer<E = unknown> {
  private readonly entries = new Map<string, Entry>();
  private readonly options: EventBufferOptions;

  constructor(options: EventBufferOptions) {
    this.options = options;
  }

  get size(): number {
    return this.entries.size;
  }

  // Returns false when the event was dropped because a limit was hit.
  push(key: string, event: E): boolean {
    let entry = this.entries.get(key);
    if (!entry) {
      if (this.entries.size >= this.options.maxKeys) return false;
      entry = { events: [], timer: this.expireLater(key) };
      this.entries.set(key, entry);
    } else {
      entry.timer.refresh();
    }
    if (entry.events.length >= this.options.maxEventsPerKey) return false;
    entry.events.push(event);
    return true;
  }

  // Removes the key and hands back its events in the order they arrived.
  take(key: string): E[] {
    const entry = this.entries.get(key);
    if (!entry) return [];
    clearTimeout(entry.timer);
    this.entries.delete(key);
    return entry.events as E[];
  }

  private expireLater(key: string): NodeJS.Timeout {
    const timer = setTimeout(() => {
      const events = this.entries.get(key)?.events ?? [];
      this.entries.delete(key);
      this.options.onExpire?.(key, events);
    }, this.options.ttlMs);
    timer.unref();
    return timer;
  }
}
