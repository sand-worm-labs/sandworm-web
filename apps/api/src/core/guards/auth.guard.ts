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

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
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
    console.dir( request , { depth: null });
    const accessToken = this.extractTokenFromCookie(request);

    if (isAuthOptional && !accessToken) return true;
    if (!accessToken) throw new UnauthorizedException();

    request['user'] = {
      ...(await this.authService.verifyAccessToken(accessToken)),
      token: accessToken,
    };

    return true;
  }

  private getRequest(context: ExecutionContext): FastifyRequest {
    if (context.getType().toString() === 'graphql') {
      return GqlExecutionContext.create(context).getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  private extractTokenFromCookie(request: FastifyRequest): string | undefined {
    return request.cookies?.['access_token'];
  }
}