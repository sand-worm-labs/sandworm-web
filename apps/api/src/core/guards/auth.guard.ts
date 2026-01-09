
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
import { AuthGraphqlService } from '../modules/auth-graphql/auth-graphql.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthGraphqlService,
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

    // Determine if this is a GraphQL or HTTP request
    const request = this.getRequest(context);
    const accessToken = this.extractTokenFromHeader(request);

    if (isAuthOptional && !accessToken) {
      return true;
    }
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    request['user'] = {
      ...(await this.authService.verifyAccessToken(accessToken)),
      token: accessToken,
    };

    return true;
  }

  private getRequest(context: ExecutionContext): FastifyRequest {
    if (context.getType().toString() == 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    return context.switchToHttp().getRequest();
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if ((type === 'Bearer' || type === 'Token') && token) {
      return token;
    }
  }
}