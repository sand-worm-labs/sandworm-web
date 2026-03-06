import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import WebSocket from 'ws';
import * as http from 'http';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity, UserWorkspaceEntity, UserWorkspaceRole, UserWorkspaceStatus } from '@sandworm/postgresql-typeorm';
import * as cookie from 'cookie';
import qs from 'querystring';
import { z } from 'zod';
import { YjsDocumentService } from '@/features/collaboration/yjs/yjs-document.service';
import { SessionManagerService } from '@/features/collaboration/yjs/services/session-manager.service';
import { MessageHandlerService } from '@/features/collaboration/yjs/services/message-handler.service';
import { SyncHandlerService } from '@/features/collaboration/yjs/services/sync-handler.service';
import { PersistenceService } from '@/features/collaboration/yjs/services/persistence.service';
import { WebSocketUtils } from '@/features/collaboration/yjs/utils/websocket.utils';
import { RequestData } from './types/requestData.types';
// import { getRequestData, getUserRole, RequestData } from '@/features/collaboration/yjs/utils/validation.utils';

@Injectable()
export class YjsGateway implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(YjsGateway.name);
    private wss: WebSocket.Server;

    constructor(
       private readonly sessionManager: SessionManagerService,
        private readonly messageHandler: MessageHandlerService,
        private readonly syncHandler: SyncHandlerService,
        private readonly persistence: PersistenceService,
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        @InjectRepository(UserWorkspaceEntity)
        private readonly userWorkspaceRepository:Repository<UserWorkspaceEntity>
    ) { }

    onModuleInit() {
        this.logger.log('YJS Gateway initialized');
    }

    public init(port: number) {
        this.logger.log('='.repeat(80));
        this.logger.log('Initializing YJS WebSocket server');
        this.logger.log('='.repeat(80));

        this.wss = new WebSocket.Server({ port: port + 2 });

        this.wss.on('connection', async (socket, req) => {
            await this.handleConnection(socket, req);
        });

        this.sessionManager.startCleanup((session) => this.persistence.persistSession(session));

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

            const data = await this.getRequestData(req);

            if (!data) {
                this.logger.warn('Invalid request, closing');
                client.close(1008, 'Invalid request data');
                return;
            }

            const { document, userId, authUser, role, isApp, clock } = data;

            const session = await this.sessionManager.getOrCreateSession(
                document.id,
                document.workspaceId,
                isApp,
                userId,
                (sess, update, origin) => this.onYDocUpdate(sess, update, origin),
                (sess, changes, origin) => this.onAwarenessUpdate(sess, changes, origin),
            );

            // Validate clock
            if (session.clock !== clock) {
                const isValid = await this.persistence.validateAndFixClock(session, clock);
                if (!isValid) {
                    this.logger.error('Clock validation failed, closing');
                    client.close(1008, 'Clock validation failed');
                    return;
                }
            }

            this.logger.log(`✅ Connected: ${authUser.email} → ${session.documentId}`);

            // Register connection
            session.conns.set(client, new Set());
            client.binaryType = 'arraybuffer';

            const transactionOrigin = { conn: client, user: authUser, role };
            let lastRoleUpdate = Date.now();

            // Message handler
            client.on('message', async (message: ArrayBuffer) => {
                try {
                    const now = Date.now();

                    // Revalidate role every 5 seconds
                    if (now - lastRoleUpdate > 5000) {
                        lastRoleUpdate = now;
                        const updatedRole = await this.getUserRole(authUser.id, session.workspaceId);
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

            // Close handler
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

    private onYDocUpdate(session: any, update: Uint8Array, origin: any) {
        this.messageHandler.handleYDocUpdate(session, update, (msg) => this.broadcast(session, msg));
        this.sessionManager.schedulePersist(session, (s) => this.persistence.persistSession(s));
    }

    private onAwarenessUpdate(session: any, changes: any, origin: any) {
        this.messageHandler.handleAwarenessUpdate(session, changes, origin, (msg) =>
            this.broadcast(session, msg),
        );
    }

    private broadcast(session: any, message: Uint8Array) {
        let count = 0;
        session.conns.forEach((_, conn) => {
            this.send(session, conn, message);
            count++;
        });
        this.logger.debug(`Broadcasted to ${count} connections`);
    }

    private send(session: any, conn: WebSocket, message: Uint8Array) {
        WebSocketUtils.send(session, conn, message, (s, c) => this.closeConnection(s, c));
    }

    private closeConnection(session: any, conn: WebSocket) {
        WebSocketUtils.closeConnection(session, conn);
    }

    private async getRequestData(req: http.IncomingMessage): Promise<RequestData | null> {
         try {
            const cookiesHeader = req.headers.cookie;
            const cookies = cookie.parse(cookiesHeader ?? '');
            const query = qs.parse(req.url?.split('?')[1] ?? '');

            const docId = query['documentId'];
            const clock = parseInt((query['clock'] ?? '').toString());
            const isApp = query['isApp'] === 'true';
            const userId = query['userId']?.toString() ?? null;
            const authToken = cookies['auth-token'] ?? query['authToken']?.toString() ?? null;

            this.logger.debug(`Parsed query params: docId=${docId}, clock=${clock}, isApp=${isApp}, userId=${userId}`);
            this.logger.debug(`Parsed auth token: ${authToken}`);
            const args = z
                .object({
                    docId: z.string().uuid(),
                    clock: z.number().int(),
                    isApp: z.boolean(),
                    userId: z.string().uuid().nullable().optional(),
                })
                .safeParse({ docId, clock, isApp, userId });

            if (!args.success) {
                this.logger.warn('Invalid query string', args.error);
                return null;
            }

            const document = await this.documentRepository.findOne({
                where: { id: args.data.docId },
            });

            if (!document) {
                this.logger.warn(`Document ${args.data.docId} not found`);
                return null;
            }

            const session = await sessionService.validateSessionFromAuthToken(authToken);

            if (!session) {
                this.logger.warn('No valid session found');
                return null;
            }

            const userWorkspace = session.userWorkspaces[document.workspaceId];

            if (!userWorkspace) {
                this.logger.warn(
                    `User ${session.user.id} does not have access to workspace ${document.workspaceId}`,
                );
                return null;
            }

            if (args.data.userId && args.data.userId !== session.user.id) {
                this.logger.warn('User ID mismatch');
                return null;
            }

            return {
                document,
                clock: args.data.clock,
                authUser: session.user,
                role: userWorkspace.role as UserWorkspaceRole,
                isApp: args.data.isApp,
                userId: args.data.userId ?? null,
            };
        } catch (err) {
            this.logger.error(`Failed to get request data: ${err}`);
            return null;
        }
    }

    private async getUserRole(
        userId: string,
        workspaceId: string,
    ): Promise<UserWorkspaceRole | null> {
        try {
            const userWorkspace = await this.userWorkspaceRepository.findOne({
                where: { userId, workspaceId, status: UserWorkspaceStatus.ACTIVE },
            });
    
            return userWorkspace?.role ?? null;
        } catch (err) {
            this.logger.error(`Failed to get user role: ${err}`);
            return null;
        }
    }


    onModuleDestroy() {
        this.logger.log('🛑 Shutting down YJS Gateway');

        if (this.wss) {
            this.wss.close();
        }

        this.sessionManager.destroyAll((session) => this.persistence.persistSession(session));
        this.logger.log('✅ Shutdown complete');
    }
}