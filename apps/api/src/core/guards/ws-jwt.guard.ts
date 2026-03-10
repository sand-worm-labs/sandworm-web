import { AuthService } from '@/features/auth/core/auth.service';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { FastifyRequest } from 'fastify';
import { Socket } from 'socket.io';
import { array } from 'zod';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger = new Logger(WsJwtGuard.name);

  constructor(private authService: AuthService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.authService.validateTokenAndGetUser(token);
      const currentUser = await this.authService.me(payload.user.id);
      console.dir(currentUser);     
      
      if (!currentUser) {
        throw new WsException('Unauthorized');
      }
      client.data.session = { payload, user: currentUser };
      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    let authCookie =  client.request.headers.cookie.split(`; `).filter(c => c.startsWith(ACCESS_TOKEN_COOKIE) || c.startsWith(REFRESH_TOKEN_COOKIE));
    let authTokens  = Object.fromEntries(authCookie.map(c => [c.slice(0, c.indexOf('=')), c.slice(c.indexOf('=') + 1)]));
    return authTokens[ACCESS_TOKEN_COOKIE] || null;
  }
}