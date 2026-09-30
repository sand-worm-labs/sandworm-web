import { SetMetadata } from '@nestjs/common';

export const NO_AUDIT = 'audit:skip';
export const AUDIT_ACTION = 'audit:action';
export const AUDIT_REASON = 'audit:reason';

// Design borrowed from @nestarc/audit-log (which is Prisma-only, so not usable here).

/** Skip auditing for a mutation (or a whole resolver), e.g. high-volume, non-sensitive ones. */
export const NoAudit = () => SetMetadata(NO_AUDIT, true);

/**
 * Audit a handler that the interceptor would otherwise skip (queries), and/or
 * override the recorded action name.
 */
export const AuditAction = (action: string) => SetMetadata(AUDIT_ACTION, action);

/** Attach a fixed human-readable reason, e.g. "admin override". */
export const AuditReason = (reason: string) => SetMetadata(AUDIT_REASON, reason);
