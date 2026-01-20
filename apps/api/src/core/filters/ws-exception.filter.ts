import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
    private readonly logger = new Logger(WsExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const client = host.switchToWs().getClient<Socket>();

        if (exception instanceof WsException) {
            const error = exception.getError();
            const message = typeof error === 'string' ? error : (error as any)?.message || 'Unknown error';

            this.logger.warn(`WS Exception [${client.id}]: ${message}`);

            client.emit('error', {
                message,
                timestamp: new Date().toISOString(),
            });
        } else if (exception instanceof Error) {
            this.logger.error(
                `WS Error [${client.id}]: ${exception.message}`,
                exception.stack,
            );

            client.emit('error', {
                message: process.env.NODE_ENV === 'production'
                    ? 'Internal server error'
                    : exception.message,
                timestamp: new Date().toISOString(),
            });
        } else {
            this.logger.error(`WS Unknown exception [${client.id}]`, exception);

            client.emit('error', {
                message: 'An unexpected error occurred',
                timestamp: new Date().toISOString(),
            });
        }
    }
}