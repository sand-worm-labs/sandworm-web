import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuditResult } from '@sandworm/postgresql-typeorm';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AUDIT_ACTION, AUDIT_REASON, NO_AUDIT } from './audit.decorators';
import { AuditEvent, AuditService } from './audit.service';

const str = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
const SKIPPED_PATHS = /\/(health|healthz|ping)$/;

type Base = Omit<AuditEvent, 'result'>;

/**
 * Audits everything that enters the API: GraphQL queries and mutations, REST
 * controllers, and WebSocket messages. Who, what, on which workspace, from
 * where, and whether it worked.
 *
 * - Only root GraphQL fields are logged (not every nested field resolver).
 * - Set AUDIT_LOG_READS=false to drop GraphQL queries / HTTP GETs if volume
 *   becomes a problem; writes are always logged.
 * - @NoAudit() opts a handler or resolver out; @AuditAction / @AuditReason
 *   rename or annotate.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logReads = process.env.AUDIT_LOG_READS !== 'false';

  constructor(
    private readonly audit: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(NO_AUDIT, targets)) return next.handle();

    const base = this.describe(context);
    if (!base) return next.handle();

    const customAction = this.reflector.get<string | undefined>(AUDIT_ACTION, context.getHandler());
    const reason = this.reflector.get<string | undefined>(AUDIT_REASON, context.getHandler());
    if (customAction) base.action = customAction;
    if (reason) base.metadata = { ...base.metadata, reason };

    let last: any;
    return next.handle().pipe(
      tap({
        next: value => (last = value),
        // Once per call, even for streamed (SSE) responses.
        complete: () =>
          this.audit.record({
            ...base,
            // Login/register/OAuth callbacks have no session yet; the result says who just authenticated.
            actorId: base.actorId ?? str(last?.user?.id) ?? null,
            result: AuditResult.SUCCESS,
          }),
      }),
      catchError(err => {
        this.audit.record({
          ...base,
          result: this.isDenied(err) ? AuditResult.DENIED : AuditResult.FAILURE,
          errorMessage: String(err?.message ?? err).slice(0, 500),
        });
        return throwError(() => err);
      }),
    );
  }

  private describe(context: ExecutionContext): Base | null {
    switch (context.getType<string>()) {
      case 'graphql':
        return this.describeGraphql(context);
      case 'http':
        return this.describeHttp(context);
      case 'ws':
        return this.describeWs(context);
      default:
        return null;
    }
  }

  private describeGraphql(context: ExecutionContext): Base | null {
    const gql = GqlExecutionContext.create(context);
    const info = gql.getInfo();
    const root = info.parentType.name;
    if ((root !== 'Query' && root !== 'Mutation') || info.fieldName.startsWith('__')) return null;
    if (root === 'Query' && !this.logReads) return null;

    const req = gql.getContext().req ?? {};
    const args = gql.getArgs() as Record<string, any>;
    return {
      action: info.fieldName,
      actorId: req.user?.id ?? null,
      workspaceId: str(args.workspaceId) ?? str(args.input?.workspaceId) ?? null,
      resourceType: info.returnType?.toString().replace(/[[\]!]/g, '') ?? null,
      resourceId: this.resourceId(args),
      ip: req.ip ?? null,
      userAgent: str(req.headers?.['user-agent']) ?? null,
      requestId: req.id ? String(req.id) : null,
      metadata: { kind: root.toLowerCase(), args },
    };
  }

  private describeHttp(context: ExecutionContext): Base | null {
    const req = context.switchToHttp().getRequest();
    const path: string = (req.routeOptions?.url ?? req.routerPath ?? req.url ?? '').split('?')[0];
    if (SKIPPED_PATHS.test(path)) return null;
    // /graphql is covered per-operation by the GraphQL branch.
    if (req.method === 'OPTIONS' || req.method === 'HEAD') return null;
    if (req.method === 'GET' && !this.logReads) return null;

    const params = (req.params ?? {}) as Record<string, any>;
    return {
      action: `http ${req.method} ${path}`,
      actorId: req.user?.id ?? null,
      workspaceId: str(params.workspaceId) ?? null,
      resourceType: 'http',
      resourceId: this.resourceId(params),
      ip: req.ip ?? null,
      userAgent: str(req.headers?.['user-agent']) ?? null,
      requestId: req.id ? String(req.id) : null,
      metadata: { kind: 'http', params, query: req.query, body: req.body },
    };
  }

  private describeWs(context: ExecutionContext): Base {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const payload = data && typeof data === 'object' ? (data as Record<string, any>) : { data };
    return {
      action: `ws ${context.getHandler().name}`,
      actorId: client.data?.session?.user?.id ?? null,
      workspaceId: str(payload.workspaceId) ?? null,
      resourceType: 'ws',
      resourceId: this.resourceId(payload),
      ip: client.handshake?.address ?? null,
      userAgent: str(client.handshake?.headers?.['user-agent']) ?? null,
      requestId: null,
      metadata: { kind: 'ws', data: payload },
    };
  }

  private isDenied(err: any): boolean {
    if (err instanceof ForbiddenException || err instanceof UnauthorizedException) return true;
    const status = err?.getStatus?.();
    return status === 401 || status === 403 || err?.message === 'Unauthorized';
  }

  // First id-looking argument that isn't the workspace itself, e.g. userId, documentId, id.
  private resourceId(args: Record<string, any>): string | null {
    const source = { ...args, ...(typeof args.input === 'object' ? args.input : {}) };
    const key = Object.keys(source).find(k => (k === 'id' || k.endsWith('Id')) && k !== 'workspaceId' && str(source[k]));
    return key ? source[key] : null;
  }
}
