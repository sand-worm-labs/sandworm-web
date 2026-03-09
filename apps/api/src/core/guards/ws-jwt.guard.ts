import { AuthService } from '@/features/auth/core/auth.service';
import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
    // Extract from handshake auth
    const token = client.handshake?.auth?.token;

    if (token) {
      return token;
    }

    // Alternative: Extract from query parameters
    const queryToken = client.handshake?.query?.token;
    if (queryToken && typeof queryToken === 'string') {
      return queryToken;
    }

    // Alternative: Extract from headers (Authorization: Bearer <token>)
    const authHeader = client.handshake?.headers?.authorization;
    if (authHeader) {
      const [type, tokenValue] = authHeader.split(' ');
      return type === 'Bearer' ? tokenValue : undefined;
    }

    return undefined;
  }
}