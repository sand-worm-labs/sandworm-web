import { Logger } from '@nestjs/common';
import * as Y from 'yjs';
import { WebSocket } from 'ws';
import * as awarenessProtocol from 'y-protocols/awareness';
import { decoding } from 'lib0';
import PQueue from 'p-queue';
import {
    getBlocks,
    getDashboard,
    getDataframes,
    getLayout,
} from '@sandworm/editor';
import { WSSharedDoc, TransactionOrigin, Persistor, LoadStateResult } from '../interfaces';
import { PubSubProviderFactory } from '@/infrastructure/pubsub/pubsub-provider.factory'


export class SharedDoc implements WSSharedDoc {

    public id: string;
    public documentId: string;
    public workspaceId: string;
    public conns: Map<WebSocket, Set<number>>;import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
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

        if (this.wss) {import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
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

        if (this.wss) {import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
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
            this.wss.close();
        }

        this.logger.log('✅ Shutdown complete');
    }
}
            this.wss.close();
        }

        this.logger.log('✅ Shutdown complete');
    }
}
    public ydoc: Y.Doc;
    public awareness: awarenessProtocol.Awareness;
    public clock: number;

    private readonly logger = new Logger(SharedDoc.name);
    private byteLength = 0;
    private updating = 0;
    private executor?: any;
    private persistUpdatesQueue: PQueue;

    // Stored so destroy/reset can detach them
    private onUpdate?: (update: Uint8Array, tr: Y.Transaction) => void;
    private onAwareness?: (changes: any, origin: any) => void;

    private constructor(
        id: string,
        documentId: string,
        workspaceId: string,
        loadStateResult: LoadStateResult,
        private readonly persistor: Persistor,
        private readonly pubSubProviderFactory: PubSubProviderFactory,
    ) {
        this.id = id;
        this.documentId = documentId;
        this.workspaceId = workspaceId;
        this.conns = new Map();
        this.ydoc = loadStateResult.ydoc;
        this.clock = loadStateResult.clock;
        this.byteLength = loadStateResult.byteLength;
        this.awareness = this.configAwareness();
        this.persistUpdatesQueue = new PQueue({
            concurrency: 1,
            intervalCap: 1,
            interval: 500,
        });
    }
    persistTimeout?: NodeJS.Timeout;
    lastPersist: number;

    public get blocks() {
        return getBlocks(this.ydoc);
    }

    public get layout() {
        return getLayout(this.ydoc);
    }

    public get dataframes() {
        return getDataframes(this.ydoc);
    }

    public get dashboard() {
        return getDashboard(this.ydoc);
    }

    public getByteLength(): number {
        return this.byteLength;
    }

    public canCollect(): boolean {
        return (
            this.conns.size === 0 &&
            this.updating === 0 &&
            (!this.executor || this.executor.isIdle())
        );
    }

    public canWrite(
        decoder: decoding.Decoder,
        transactionOrigin: TransactionOrigin
    ): boolean {
        return this.persistor.canWrite(decoder, this, transactionOrigin);
    }

    public getTitleFromDoc(): string {
        return this.ydoc.getXmlFragment('title').toJSON().slice(7, -8);
    }

    public async replaceState(state: Buffer): Promise<void> {
        const result = await this.persistor.replaceState(this.clock, state);
        await this.reset(result.ydoc, result.clock, result.byteLength);
    }

    public incrementUpdating(): void {
        this.updating++;
    }

    public decrementUpdating(): void {
        this.updating = Math.max(this.updating - 1, 0);
    }

    public getPersistUpdatesQueue(): PQueue {
        return this.persistUpdatesQueue;
    }

    public getPersistor(): Persistor {
        return this.persistor;
    }

    public async init(
        onUpdate: (update: Uint8Array, tr: Y.Transaction) => void,
        onAwareness: (changes: any, origin: any) => void,
    ): Promise<void> {
        this.onUpdate = onUpdate;
        this.onAwareness = onAwareness;

        this.ydoc.on('update', this.onUpdate);
        this.awareness.on('update', this.onAwareness);

        this.pubSubProvider = this.pubSubProviderFactory.create(
            this.id,
            this.ydoc,
            this.clock,
            this.onNewerClock
        );
        await this.pubSubProvider.connect();

        this.logger.debug(`SharedDoc initialized for ${this.id}`);
    }

    public async destroy(): Promise<void> {
        this.logger.debug(`Destroying SharedDoc ${this.id}`);

        await Promise.all([
            this.executor?.stop()
        ]);

        if (this.onUpdate) this.ydoc.off('update', this.onUpdate);
        if (this.onAwareness) this.awareness.off('update', this.onAwareness);

        await this.persistUpdatesQueue.onIdle();
        await this.persistor.persist(this);
        await this.pubSubProvider?.disconnect();

        this.awareness.destroy();
        this.ydoc.destroy();

        this.logger.debug(`SharedDoc destroyed for ${this.id}`);
    }

    public async reset(newYDoc: Y.Doc, newClock: number, newByteLength: number): Promise<void> {
        this.logger.debug(`Resetting SharedDoc ${this.id}`);

        await Promise.all([
            this.executor?.stop()
        ]);

        if (this.onUpdate) this.ydoc.off('update', this.onUpdate);
        if (this.onAwareness) this.awareness.off('update', this.onAwareness);

        this.ydoc.destroy();
        await this.persistUpdatesQueue.onIdle();
        this.awareness.destroy();

        this.ydoc = newYDoc;
        this.clock = newClock;
        this.byteLength = newByteLength;
        this.awareness = this.configAwareness();

        if (this.onUpdate) this.ydoc.on('update', this.onUpdate);
        if (this.onAwareness) this.awareness.on('update', this.onAwareness);

        await this.pubSubProvider?.reset(newYDoc, newClock);

        this.logger.debug(`SharedDoc reset complete for ${this.id}`);
    }

    private configAwareness(): awarenessProtocol.Awareness {
        const awareness = new awarenessProtocol.Awareness(this.ydoc);
        awareness.setLocalState(null);
        return awareness;
    }

    private onNewerClock = async (newClock: number) => {
        this.logger.warn({
            id: this.id,
            currentClock: this.clock,
            newClock,
        }, 'Detected newer clock, reloading state');

        const loadResult = await this.persistor.load();
        await this.reset(loadResult.ydoc, loadResult.clock, loadResult.byteLength);
    };

    public static async make(
        id: string,
        documentId: string,
        workspaceId: string,
        loadStateResult: LoadStateResult,
        persistor: Persistor,
        pubSubProviderFactory: PubSubProviderFactory,
        onUpdate: (update: Uint8Array, tr: Y.Transaction) => void,
        onAwareness: (changes: any, origin: any) => void,
    ): Promise<SharedDoc> {
        const doc = new SharedDoc(
            id,
            documentId,
            workspaceId,
            loadStateResult,
            persistor,
            pubSubProviderFactory,
        );

        await doc.init(onUpdate, onAwareness);

        if (
            loadStateResult.applyUpdateLatency > 1000 &&
            Date.now() - loadStateResult.clockUpdatedAt.getTime() > 1000 * 60 * 60 * 24
        ) {
            Logger.log(
                `Removing history from YDoc ${id} to improve performance`,
                'SharedDoc'
            );
        }

        return doc;
    }
}