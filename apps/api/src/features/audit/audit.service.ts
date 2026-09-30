import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLogEntity, AuditResult } from '@sandworm/postgresql-typeorm';
import { FindOptionsWhere, LessThan, Repository } from 'typeorm';

export type AuditEvent = {
  action: string;
  result: AuditResult;
  actorId?: string | null;
  workspaceId?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  errorMessage?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type AuditQuery = {
  workspaceId: string;
  actorId?: string;
  action?: string;
  result?: AuditResult;
  limit?: number;
  // created_at of the last row of the previous page (ISO string).
  before?: Date;
};

const SENSITIVE_KEY = /pass(word)?|secret|token|api[-_]?key|authorization|cookie|credential|private[-_]?key|^value$|^code$|^state$|^hash$|^otp$/i;
const MAX_DEPTH = 4;
const MAX_STRING = 500;

export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  if (typeof value !== 'object') return value;
  if (depth >= MAX_DEPTH) return '[truncated]';
  if (Array.isArray(value)) return value.slice(0, 50).map(v => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE_KEY.test(k) ? '[redacted]' : redact(v, depth + 1),
    ]),
  );
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  /** Awaitable write. Use for events that must not be lost (e.g. inside a critical flow). */
  async recordStrict(event: AuditEvent): Promise<void> {
    await this.repo.insert({ ...event, metadata: (redact(event.metadata) as Record<string, unknown>) ?? null });
  }

  /**
   * Fire-and-forget write: an audit failure must never break the user's
   * request, but it is logged loudly so it can be alerted on.
   */
  record(event: AuditEvent): void {
    this.recordStrict(event).catch(err =>
      this.logger.error(`AUDIT WRITE FAILED action=${event.action} actor=${event.actorId}: ${err?.message}`),
    );
  }

  async query(q: AuditQuery): Promise<AuditLogEntity[]> {
    const where: FindOptionsWhere<AuditLogEntity> = { workspaceId: q.workspaceId };
    if (q.actorId) where.actorId = q.actorId;
    if (q.action) where.action = q.action;
    if (q.result) where.result = q.result;
    if (q.before) where.createdAt = LessThan(q.before);
    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(q.limit ?? 50, 1), 200),
    });
  }
}
