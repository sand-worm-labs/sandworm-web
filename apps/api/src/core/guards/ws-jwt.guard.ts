import { AuthService } from '@/features/auth/core/auth.service';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/features/auth/core/utils/cookie';
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

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
      
      if (!currentUser) {
        throw new WsException('Unauthorized');
      }
      client.data.session = { payload, user: currentUser };
      return true;
    } catch (error) {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHandshake(client: Socket): string | undefined {
    // 1. Primary: HttpOnly cookie
    const cookieHeader = client.request?.headers?.cookie;
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => [c.slice(0, c.indexOf('=')), c.slice(c.indexOf('=') + 1)])
      );
      if (cookies[ACCESS_TOKEN_COOKIE]) return cookies[ACCESS_TOKEN_COOKIE];
    }

    // 2. Handshake auth object (io(url, { auth: { token } }))
    const authToken = client.handshake?.auth?.token;
    if (authToken) return authToken;

    // 3. Query parameter (io(url, { query: { token } }))
    const queryToken = client.handshake?.query?.token;
    if (queryToken && typeof queryToken === 'string') return queryToken;

    // 4. Authorization header (Bearer <token>)
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader) {
      const [type, tokenValue] = authHeader.split(' ');
      if (type === 'Bearer' && tokenValue) return tokenValue;
    }

    return undefined;
  }
}