import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server as WSServer, WebSocket } from 'ws';
import * as http from 'http';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import cookie from 'cookie';
import qs from 'querystring';
import { z } from 'zod';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import { encoding, decoding } from 'lib0';
import { DocumentEntity, UserWorkspaceRole } from '@sandworm/postgresql-typeorm';
import { YjsDocumentService } from '../../../features/collaboration/yjs/yjs-document.service';
import { SessionService } from '@/features/session/session.service';

const wsReadyStateOpen = 1;
const wsReadyStateConnecting = 0;
const messageSync = 0;
const messageAwareness = 1;
const pingTimeout = 30000;
const PERSIST_DEBOUNCE_MS = 500;

interface DocumentSession {
    documentId: string;
    workspaceId: string;
    yDoc: Y.Doc;
    awareness: awarenessProtocol.Awareness;
    conns: Map<WebSocket, Set<number>>;
    clock: number;
    isApp: boolean;
    userId: string | null;
    persistTimeout?: NodeJS.Timeout;
    lastPersist: number;
}

interface ClientMetadata {
    user: {
        id: string;
        email: string;
        username?: string;
    };
    role: UserWorkspaceRole;
    session: DocumentSession;
}

interface RequestData {
    document: DocumentEntity;
    clock: number;
    authUser: any;
    role: UserWorkspaceRole;
    isApp: boolean;
    userId: string | null;
}

@WebSocketGateway({
    namespace: 'yjs',
    maxPayload: 1024 * 1024 * 1024,
    transports: ['websocket', "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
})
export class YjsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: WSServer;

    private readonly logger = new Logger(YjsGateway.name);
    private readonly sessions = new Map<string, DocumentSession>();
    private cleanupInterval?: NodeJS.Timeout;

    constructor(
        private readonly yjsDocumentService: YjsDocumentService,
        private readonly sessionService: SessionService,
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
    ) { }

    afterInit(server: WSServer) {
        this.logger.log('YJS WebSocket Gateway initialized');
        this.startSessionCleanup();
    }

    async handleConnection(client: WebSocket, req: http.IncomingMessage) {
        try {
            this.logger.log("YJS client connected");
            // Get request data (auth, document, etc.)
            const data = await this.getRequestData(req);

            if (!data) {
                this.logger.warn('Invalid request data, closing connection');
                client.close(1008, 'Invalid request data');
                return;
            }

            const { document, userId, authUser, role, isApp, clock } = data;

            // Get or create session
            const session = await this.getOrCreateSession(
                document.id,
                document.workspaceId,
                isApp,
                userId,
            );

            // Validate clock
            if (session.clock !== clock) {
                this.logger.warn({
                    documentId: session.documentId,
                    userClock: clock,
                    sessionClock: session.clock,
                    userId: authUser.id,
                }, 'Clock mismatch detected');

                const isValid = await this.validateAndFixClock(
                    session,
                    document,
                    authUser,
                    clock,
                );

                if (!isValid) {
                    this.logger.error('Clock validation failed, closing connection');
                    client.close(1008, 'Clock validation failed');
                    return;
                }
            }

            this.logger.log(
                `Client connecting: ${authUser.id} to document ${session.documentId}`,
            );

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
                        const updatedRole = await this.getUserRole(
                            authUser.id,
                            session.workspaceId,
                        );
                        if (updatedRole) {
                            transactionOrigin.role = updatedRole;
                        } else {
                            this.logger.warn(
                                `User ${authUser.id} lost access to workspace ${session.workspaceId}`,
                            );
                            this.closeConnection(session, client);
                            return;
                        }
                    }

                    this.handleMessage(session, new Uint8Array(message), transactionOrigin);
                } catch (err) {
                    this.logger.error(`Error handling message: ${err}`);
                }
            });

            // Ping/pong for connection health
            this.setupPingPong(session, client, authUser.id);

            // Connection close handler
            client.on('close', () => {
                this.logger.log(
                    `Client ${authUser.id} closed connection to ${session.documentId}`,
                );
                this.closeConnection(session, client);
            });

            // Send initial state
            await this.sendInitialState(session, client);

            this.logger.log(
                `Client ${authUser.id} successfully connected to document ${session.documentId}`,
            );
        } catch (err) {
            this.logger.error(`Failed to handle connection: ${err}`);
            client.close(1011, 'Internal server error');
        }
    }

    handleDisconnect(client: WebSocket) {
        this.logger.debug('Client disconnected');
    }

    private async getOrCreateSession(
        documentId: string,
        workspaceId: string,
        isApp: boolean,
        userId: string | null,
    ): Promise<DocumentSession> {
        const sessionKey = this.getSessionKey(documentId, isApp, userId);
        let session = this.sessions.get(sessionKey);

        if (!session) {
            this.logger.debug(`Creating new session for ${sessionKey}`);

            // Load document state
            const loadResult = isApp && userId
                ? await this.yjsDocumentService.loadAppYDoc(documentId, userId)
                : await this.yjsDocumentService.loadEditYDoc(documentId);

            // Create awareness
            const awareness = new awarenessProtocol.Awareness(loadResult.yDoc);
            awareness.setLocalState(null);

            session = {
                documentId,
                workspaceId,
                yDoc: loadResult.yDoc,
                awareness,
                conns: new Map(),
                clock: loadResult.clock,
                isApp,
                userId,
                lastPersist: Date.now(),
            };

            // Setup update handler
            loadResult.yDoc.on('update', (update: Uint8Array, origin: any) => {
                this.handleYDocUpdate(session!, update, origin);
            });

            // Setup awareness handler
            awareness.on('update', (changes: any, origin: any) => {
                this.handleAwarenessUpdate(session!, changes, origin);
            });

            this.sessions.set(sessionKey, session);
        }

        return session;
    }

    private handleYDocUpdate(
        session: DocumentSession,
        update: Uint8Array,
        origin: any,
    ) {
        // Broadcast update to all connections
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeUpdate(encoder, update);
        const message = encoding.toUint8Array(encoder);

        session.conns.forEach((_, conn) => {
            this.send(session, conn, message);
        });

        // Schedule persistence
        this.schedulePersist(session);
    }

    private handleAwarenessUpdate(
        session: DocumentSession,
        changes: { added: number[]; updated: number[]; removed: number[] },
        origin: any,
    ) {
        const { added, updated, removed } = changes;
        const changedClients = added.concat(updated, removed);

        if (origin !== null && origin.conn) {
            const connControlledIDs = session.conns.get(origin.conn);
            if (connControlledIDs !== undefined) {
                added.forEach((clientID) => connControlledIDs.add(clientID));
                removed.forEach((clientID) => connControlledIDs.delete(clientID));
            }
        }

        // Broadcast awareness update
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageAwareness);
        encoding.writeVarUint8Array(
            encoder,
            awarenessProtocol.encodeAwarenessUpdate(session.awareness, changedClients),
        );
        const buff = encoding.toUint8Array(encoder);

        session.conns.forEach((_, conn) => {
            this.send(session, conn, buff);
        });
    }

    private schedulePersist(session: DocumentSession) {
        if (session.persistTimeout) {
            clearTimeout(session.persistTimeout);
        }

        session.persistTimeout = setTimeout(async () => {
            try {
                const now = Date.now();

                // Only persist if there are no active connections and enough time has passed
                if (session.conns.size === 0 || now - session.lastPersist > PERSIST_DEBOUNCE_MS) {
                    await this.persistSession(session);
                    session.lastPersist = now;
                }
            } catch (err) {
                this.logger.error(
                    `Failed to persist session ${session.documentId}: ${err}`,
                );
            }
        }, PERSIST_DEBOUNCE_MS);
    }

    private async persistSession(session: DocumentSession) {
        this.logger.debug(`Persisting session ${session.documentId}`);

        if (session.isApp) {
            this.logger.warn('App document persistence not implemented in gateway');
            return;
        }

        await this.yjsDocumentService.saveEditYDoc(
            session.documentId,
            session.yDoc,
        );

        this.logger.debug(`Successfully persisted session ${session.documentId}`);
    }

    private handleMessage(
        session: DocumentSession,
        message: Uint8Array,
        transactionOrigin: any,
    ) {
        try {
            const encoder = encoding.createEncoder();
            const decoder = decoding.createDecoder(message);
            const messageType = decoding.readVarUint(decoder);

            switch (messageType) {
                case messageSync:
                    encoding.writeVarUint(encoder, messageSync);
                    this.readSyncMessage(decoder, encoder, session, transactionOrigin);

                    if (encoding.length(encoder) > 1) {
                        this.send(session, transactionOrigin.conn, encoding.toUint8Array(encoder));
                    }
                    break;

                case messageAwareness:
                    awarenessProtocol.applyAwarenessUpdate(
                        session.awareness,
                        decoding.readVarUint8Array(decoder),
                        transactionOrigin,
                    );
                    break;

                default:
                    this.logger.warn(`Unknown message type: ${messageType}`);
            }
        } catch (err) {
            this.logger.error(`Failed to handle message: ${err}`);
        }
    }

    private readSyncMessage(
        decoder: decoding.Decoder,
        encoder: encoding.Encoder,
        session: DocumentSession,
        transactionOrigin: any,
    ): number {
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
            case syncProtocol.messageYjsSyncStep1:
                this.logger.debug('Processing sync step 1');
                syncProtocol.readSyncStep1(decoder, encoder, session.yDoc);
                break;

            case syncProtocol.messageYjsSyncStep2:
                this.logger.debug('Processing sync step 2');

                // Check write permissions for viewers
                if (transactionOrigin.role === UserWorkspaceRole.VIEWER) {
                    this.logger.warn('Viewer attempted to write, rejecting');
                    this.closeConnection(session, transactionOrigin.conn);
                    return messageType;
                }

                syncProtocol.readSyncStep2(decoder, session.yDoc, transactionOrigin);
                break;

            case syncProtocol.messageYjsUpdate:
                this.logger.debug('Processing update');

                // Check write permissions
                if (transactionOrigin.role === UserWorkspaceRole.VIEWER) {
                    this.logger.warn('Viewer attempted to write, rejecting');
                    this.closeConnection(session, transactionOrigin.conn);
                    return messageType;
                }

                syncProtocol.readUpdate(decoder, session.yDoc, transactionOrigin);
                break;

            default:
                throw new Error(`Unknown sync message type: ${messageType}`);
        }

        return messageType;
    }

    private async sendInitialState(session: DocumentSession, client: WebSocket) {
        this.logger.debug('Sending sync step 1');
        const syncEncoder = encoding.createEncoder();
        encoding.writeVarUint(syncEncoder, messageSync);
        syncProtocol.writeSyncStep1(syncEncoder, session.yDoc);
        this.send(session, client, encoding.toUint8Array(syncEncoder));

        // Send awareness states
        const awarenessStates = session.awareness.getStates();
        if (awarenessStates.size > 0) {
            this.logger.debug(`Sending ${awarenessStates.size} awareness states`);
            const awarenessEncoder = encoding.createEncoder();
            encoding.writeVarUint(awarenessEncoder, messageAwareness);
            encoding.writeVarUint8Array(
                awarenessEncoder,
                awarenessProtocol.encodeAwarenessUpdate(
                    session.awareness,
                    Array.from(awarenessStates.keys()),
                ),
            );
            this.send(session, client, encoding.toUint8Array(awarenessEncoder));
        }
    }

    private setupPingPong(
        session: DocumentSession,
        client: WebSocket,
        userId: string,
    ) {
        let pongReceived = true;

        const pingInterval = setInterval(() => {
            if (!pongReceived) {
                if (session.conns.has(client)) {
                    this.logger.warn(`Client ${userId} did not respond to ping`);
                    this.closeConnection(session, client);
                }
                clearInterval(pingInterval);
            } else if (session.conns.has(client)) {
                pongReceived = false;
                try {
                    client.ping();
                } catch (err) {
                    this.logger.error(`Failed to ping client: ${err}`);
                    this.closeConnection(session, client);
                    clearInterval(pingInterval);
                }
            }
        }, pingTimeout);

        client.on('pong', () => {
            pongReceived = true;
        });

        // Clean up interval on close
        client.once('close', () => {
            clearInterval(pingInterval);
        });
    }

    private send(session: DocumentSession, conn: WebSocket, message: Uint8Array) {
        if (
            conn.readyState !== wsReadyStateConnecting &&
            conn.readyState !== wsReadyStateOpen
        ) {
            this.closeConnection(session, conn);
            return;
        }

        try {
            conn.send(message, (err) => {
                if (!err) return;

                this.closeConnection(session, conn);

                const isEPIPE = (err as any).code === 'EPIPE';
                if (!isEPIPE) {
                    this.logger.error(`Failed to send message: ${err.message}`);
                }
            });
        } catch (err) {
            this.closeConnection(session, conn);

            const isEPIPE = (err as any).code === 'EPIPE';
            if (!isEPIPE) {
                this.logger.error(`Failed to send message: ${err}`);
            }
        }
    }

    private closeConnection(session: DocumentSession, conn: WebSocket) {
        const controlledIds = session.conns.get(conn);

        if (controlledIds !== undefined) {
            session.conns.delete(conn);

            awarenessProtocol.removeAwarenessStates(
                session.awareness,
                Array.from(controlledIds),
                null,
            );
        }

        try {
            conn.close();
        } catch (err) {
            this.logger.debug(`Error closing connection: ${err}`);
        }
    }

    private async getRequestData(
        req: http.IncomingMessage,
    ): Promise<RequestData | null> {
        try {
            const cookiesHeader = req.headers.cookie;
            const cookies = cookie.parse(cookiesHeader ?? '');
            const query = qs.parse(req.url?.split('?')[1] ?? '');

            const docId = query['documentId'];
            const clock = parseInt((query['clock'] ?? '').toString());
            const isApp = query['isApp'] === 'true';
            const userId = query['userId']?.toString() ?? null;

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

            const session = await this.sessionService.validateSessionFromCookies(cookies);

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

    private async validateAndFixClock(
        session: DocumentSession,
        document: DocumentEntity,
        user: any,
        clock: number,
    ): Promise<boolean> {
        try {
            // Reload from database
            const loadResult = session.isApp && session.userId
                ? await this.yjsDocumentService.loadAppYDoc(session.documentId, session.userId)
                : await this.yjsDocumentService.loadEditYDoc(session.documentId);

            if (loadResult.clock === clock) {
                this.logger.warn(`Fixing session clock from ${session.clock} to ${clock}`);
                session.clock = clock;
                return true;
            }

            this.logger.error(
                `Clock mismatch: user=${clock}, session=${session.clock}, db=${loadResult.clock}`,
            );
            return false;
        } catch (err) {
            this.logger.error(`Failed to validate clock: ${err}`);
            return false;
        }
    }

    private async getUserRole(
        userId: string,
        workspaceId: string,
    ): Promise<UserWorkspaceRole | null> {
        try {
            // TODO: Implement actual role lookup
            return UserWorkspaceRole.EDITOR;
        } catch (err) {
            this.logger.error(`Failed to get user role: ${err}`);
            return null;
        }
    }

    private getSessionKey(
        documentId: string,
        isApp: boolean,
        userId: string | null,
    ): string {
        if (isApp && userId) {
            return `${documentId}:app:${userId}`;
        }
        if (isApp) {
            return `${documentId}:app:published`;
        }
        return `${documentId}:edit`;
    }

    private startSessionCleanup() {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

            for (const [key, session] of this.sessions.entries()) {
                // Remove sessions with no connections that haven't been active recently
                if (
                    session.conns.size === 0 &&
                    now - session.lastPersist > IDLE_TIMEOUT
                ) {
                    this.logger.debug(`Cleaning up idle session ${key}`);

                    // Final persist
                    this.persistSession(session).catch((err) => {
                        this.logger.error(`Failed to persist on cleanup: ${err.message}`);
                    });

                    // Cleanup
                    if (session.persistTimeout) {
                        clearTimeout(session.persistTimeout);
                    }
                    session.yDoc.destroy();
                    session.awareness.destroy();
                    this.sessions.delete(key);
                }
            }
        }, 60000); // Check every minute
    }

    async onModuleDestroy() {
        this.logger.log('Shutting down YJS Gateway');

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        // Persist and cleanup all sessions
        const persistPromises = Array.from(this.sessions.values()).map((session) =>
            this.persistSession(session).catch((err) => {
                this.logger.error(
                    `Failed to persist session ${session.documentId}: ${err.message}`,
                );
            }),
        );

        await Promise.all(persistPromises);

        // Destroy all sessions
        for (const session of this.sessions.values()) {
            if (session.persistTimeout) {
                clearTimeout(session.persistTimeout);
            }
            session.yDoc.destroy();
            session.awareness.destroy();
        }

        this.sessions.clear();
        this.logger.log('YJS Gateway shutdown complete');
    }
}