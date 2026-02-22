import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import * as http from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '@sandworm/postgresql-typeorm';
import { SessionService } from '@/features/session/session.service';
import { MessageHandlerService } from '@/features/collaboration/yjs/services/message-handler.service';
import { SyncHandlerService } from '@/features/collaboration/yjs/services/sync-handler.service';
import { WebSocketUtils } from '@/features/collaboration/yjs/utils/websocket.utils';
import { PersistenceService } from '@/features/collaboration/yjs/services/persistence.service';
import { PersistorFactory } from '@/features/collaboration/yjs/persistors/persistor.factory';
import { YjsDocumentService } from '@/features/collaboration/yjs/yjs-document.service';
import { getRequestData, getUserRole } from '@/features/collaboration/yjs/utils/validation.utils';
import { WSSharedDoc } from './interfaces';
import { getDocId } from '@/common/utils/validation';

@Injectable()
export class YjsGateway implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(YjsGateway.name);
    private wss: WebSocket.Server;

    constructor(
        private readonly yjsDocumentService: YjsDocumentService,
        private readonly persistorFactory: PersistorFactory,
        private readonly persistence: PersistenceService,
        private readonly messageHandler: MessageHandlerService,
        private readonly syncHandler: SyncHandlerService,
        private readonly sessionService: SessionService,
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
    ) { }

    onModuleInit() {
        this.logger.log('YJS Gateway initialized');
    }

    async init(port: number) {

        this.logger.log('='.repeat(80));
        this.logger.log('Initializing YJS WebSocket server');
        this.logger.log('='.repeat(80));

        this.wss = new WebSocket.Server({ port: port + 1 });

        this.wss.on('connection', async (socket, req) => {
            await this.handleConnection(socket, req);
        });

        this.logger.log(`🚀 WebSocket server running on port ${port + 2} at /yjs`);
        this.logger.log('='.repeat(80));
    }

    private async handleConnection(client: WebSocket, req: http.IncomingMessage) {
        try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            if (!url.pathname.startsWith('/yjs')) {
                client.close(1008, 'Invalid path');
                return;
            }

            this.logger.log(`📥 New connection from ${req.socket.remoteAddress}`);

            const data = await getRequestData(req, this.sessionService, this.documentRepository);

            if (!data) {
                this.logger.warn('Invalid request, closing');
                client.close(1008, 'Invalid request data');
                return;
            }

            const { document, userId, authUser, role, isApp, clock, appId } = data;

            const docId = getDocId(
                document.id,
                isApp && appId ? { id: appId, userId } : null,
            );

            const persistor = isApp && appId
                ? this.persistorFactory.createAppPersistor(document.id, appId, userId)
                : this.persistorFactory.createDocumentPersistor(document.id);

            const session = await this.yjsDocumentService.getYDoc(
                docId,
                document.id,
                document.workspaceId,
                persistor,
            );

            if (session.clock !== clock) {
                const isValid = await this.persistence.validateAndFixClock(session, clock);
                if (!isValid) {
                    this.logger.error('Clock validation failed, closing');
                    client.close(1008, 'Clock validation failed');
                    return;
                }
            }

            this.logger.log(`✅ Connected: ${authUser.email} → ${session.documentId}`);

            session.conns.set(client, new Set());
            client.binaryType = 'arraybuffer';

            const transactionOrigin = { conn: client, user: authUser, role };
            let lastRoleUpdate = Date.now();

            client.on('message', async (message: ArrayBuffer) => {
                try {
                    const now = Date.now();

                    if (now - lastRoleUpdate > 5000) {
                        lastRoleUpdate = now;
                        const updatedRole = await getUserRole(authUser.id, session.workspaceId);
                        if (updatedRole) {
                            transactionOrigin.role = updatedRole;
                        } else {
                            this.logger.warn(`User ${authUser.id} lost access`);
                            this.closeConnection(session, client);
                            return;
                        }
                    }

                    this.messageHandler.handleMessage(
                        session,
                        new Uint8Array(message),
                        transactionOrigin,
                        (msg) => this.send(session, client, msg),
                    );
                } catch (err) {
                    if ((err as Error).message === 'VIEWER_WRITE_REJECTED') {
                        this.closeConnection(session, client);
                    } else {
                        this.logger.error(`Error handling message: ${err}`);
                    }
                }
            });

            WebSocketUtils.setupPingPong(session, client, authUser.id, (s, c) =>
                this.closeConnection(s, c),
            );

            client.on('close', () => {
                this.logger.log(`🔌 Closed: ${authUser.email}`);
                this.closeConnection(session, client);
            });

            client.on('error', (error) => {
                this.logger.error(`WebSocket error: ${error.message}`);
            });

            await this.syncHandler.sendInitialState(session, (msg) =>
                this.send(session, client, msg),
            );

            this.logger.log(`✨ ${authUser.email} ready`);
        } catch (err) {
            this.logger.error(`Connection failed: ${err}`, err);
            client.close(1011, 'Internal server error');
        }
    }

    private send(session: WSSharedDoc, conn: WebSocket, message: Uint8Array) {
        WebSocketUtils.send(session, conn, message, (s, c) => this.closeConnection(s, c));
    }

    private closeConnection(session: WSSharedDoc, conn: WebSocket) {
        WebSocketUtils.closeConnection(session, conn);
    }

    onModuleDestroy() {
        this.logger.log('🛑 Shutting down YJS Gateway');

        if (this.wss) {
            this.wss.close();
        }

        this.logger.log('✅ Shutdown complete');
    }
}