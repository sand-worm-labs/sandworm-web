import { Logger } from '@nestjs/common';
import { WebSocket } from 'ws';
import * as awarenessProtocol from 'y-protocols/awareness';
import { PING_TIMEOUT, WS_READY_STATE_CONNECTING, WS_READY_STATE_OPEN } from '../types/yjs.types';
import { WSSharedDoc } from '../interfaces/ws-shared-doc.interface';

export class WebSocketUtils {
    private static readonly logger = new Logger(WebSocketUtils.name);

    static send(
        session: WSSharedDoc,
        conn: WebSocket,
        message: Uint8Array,
        onClose: (session: WSSharedDoc, conn: WebSocket) => void,
    ) {
        if (conn.readyState !== WS_READY_STATE_CONNECTING && conn.readyState !== WS_READY_STATE_OPEN) {
            onClose(session, conn);
            return;
        }

        try {
            conn.send(message, (err) => {
                if (!err) return;
                onClose(session, conn);

                const isEPIPE = (err as any).code === 'EPIPE';
                if (!isEPIPE) {
                    this.logger.error(`Failed to send message: ${err}`);
                }
            });
        } catch (err) {
            onClose(session, conn);

            const isEPIPE = (err as any).code === 'EPIPE';
            if (!isEPIPE) {
                this.logger.error(`Failed to send message: ${err}`);
            }
        }
    }

    static closeConnection(session: WSSharedDoc, conn: WebSocket) {
        const controlledIds = session.conns.get(conn);

        if (controlledIds !== undefined) {
            session.conns.delete(conn);

            awarenessProtocol.removeAwarenessStates(
                session.awareness,
                Array.from(controlledIds),
                null,
            );

            this.logger.debug(`🔌 Removed ${controlledIds.size} awareness states`);
        }

        try {
            conn.close();
        } catch (err) {
            this.logger.debug(`Error closing connection: ${err}`);
        }
    }

    static setupPingPong(
        session: WSSharedDoc,
        client: WebSocket,
        userId: string,
        onClose: (session: WSSharedDoc, conn: WebSocket) => void,
    ) {
        let pongReceived = true;

        const pingInterval = setInterval(() => {
            if (!pongReceived) {
                if (session.conns.has(client)) {
                    this.logger.warn(`⏱️  Client ${userId} did not respond to ping`);
                    onClose(session, client);
                }
                clearInterval(pingInterval);
            } else if (session.conns.has(client)) {
                pongReceived = false;
                try {
                    client.ping();
                } catch (err) {
                    this.logger.error(`Failed to ping client: ${err}`);
                    onClose(session, client);
                    clearInterval(pingInterval);
                }
            }
        }, PING_TIMEOUT);

        client.on('pong', () => {
            pongReceived = true;
        });

        client.once('close', () => {
            clearInterval(pingInterval);
        });
    }
}