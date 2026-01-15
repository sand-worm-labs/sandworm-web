import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import cookie from 'cookie';
import { SessionService } from '@/features/session/session.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly sessionService: SessionService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    try {
      // Check if session is already attached (from previous calls)
      if (client.data.session) {
        return true;
      }

      const cookiesHeader = client.handshake.headers.cookie;
      if (!cookiesHeader) {
        throw new WsException('No cookies provided');
      }

      const cookies = cookie.parse(cookiesHeader);

      // Use your existing session service to validate
      const session = await this.sessionService.validateSessionFromCookies(cookies);

      if (!session) {
        throw new WsException('Unauthorized');
      }

      // Attach session to socket data for reuse
      client.data.session = session;
      return true;
    } catch (err) {
      this.logger.error(
        `WebSocket authentication failed for socket ${client.id}`,
        err
      );
      throw new WsException('Unauthorized');
    }
  }
}