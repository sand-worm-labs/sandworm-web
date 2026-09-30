import '@fastify/cookie';
import { AuthService } from '@/features/auth/core/auth.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_AUTH_OPTIONAL, IS_PUBLIC } from '@sandworm/nest-common';
import { type FastifyRequest } from 'fastify';
import { AuditService } from '@/features/audit/audit.service';
import { AuditResult } from '@sandworm/postgresql-typeorm';
import { ACCESS_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
    private audit?: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isAuthOptional = this.reflector.getAllAndOverride<boolean>(
      IS_AUTH_OPTIONAL,
      [context.getHandler(), context.getClass()],
    );

    const request = this.getRequest(context);
    const accessToken = this.extractTokenFromCookie(request);

    if (isAuthOptional && !accessToken) return true;
    if (!accessToken) {
      this.auditDenied(request, 'missing_token');
      throw new UnauthorizedException();
    }
    let user: Awaited<ReturnType<AuthService['validateTokenAndGetUser']>>;
    try {
      user = await this.authService.validateTokenAndGetUser(accessToken);
    } catch (err) {
      this.auditDenied(request, 'invalid_token');
      throw err;
    }
    request['user'] = {
      ...user,
      token: accessToken,
    };

    return true;
  }

  // Runs before interceptors, so rejected requests would otherwise never be audited.
  private auditDenied(request: FastifyRequest, reason: string): void {
    this.audit?.record({
      action: 'auth.unauthorized',
      result: AuditResult.DENIED,
      resourceType: 'http',
      ip: request.ip ?? null,
      userAgent: request.headers?.['user-agent'] ?? null,
      requestId: request.id ? String(request.id) : null,
      errorMessage: reason,
      metadata: { method: request.method, path: (request.url ?? '').split('?')[0] },
    });
  }

  private getRequest(context: ExecutionContext): FastifyRequest {
    if (context.getType().toString() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  private extractTokenFromCookie(request: FastifyRequest): string {
    return request.cookies?.[ACCESS_TOKEN_COOKIE] as string | "";
  }
}