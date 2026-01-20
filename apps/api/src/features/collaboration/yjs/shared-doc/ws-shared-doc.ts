import { Logger } from '@nestjs/common';
import * as Y from 'yjs';
import { WebSocket } from 'ws';
import * as awarenessProtocol from 'y-protocols/awareness';
import { encoding, decoding } from 'lib0';
import * as syncProtocol from 'y-protocols/sync';
import PQueue from 'p-queue';
import {
    getBlocks,
    getDashboard,
    getDataframes,
    getLayout,
} from '@sandworm/editor';
import { WSSharedDoc, TransactionOrigin, Persistor } from '../interfaces';
import { PubSubService } from '@/infrastructure/pubsub/service/pubsub.service';

const messageSync = 0;
const messageAwareness = 1;

export class WSSharedDocV2 implements WSSharedDoc {
    public id: string;
    public documentId: string;
    public workspaceId: string;
    public conns: Map<WebSocket, Set<number>>;
    public ydoc: Y.Doc;
    public awareness: awarenessProtocol.Awareness;
    public clock: number;

    private readonly logger = new Logger(WSSharedDocV2.name);
    private title = '';
    private byteLength = 0;
    private hasUpdatesToPersist = false;
    private persistUpdatesQueue: PQueue;
    private updating = 0;

    // Executors - will be injected
    private executor?: any;
    private aiExecutor?: any;
    private pubSubProvider?: PubSubProvider;

    private constructor(
        id: string,
        documentId: string,
        workspaceId: string,
        loadStateResult: any,
        private readonly persistor: Persistor,
        private readonly onTitleChange?: (title: string) => Promise<void>
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
            this.executor?.isIdle() &&
            this.aiExecutor?.isIdle()
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

    public readSyncStep1(decoder: decoding.Decoder, encoder: encoding.Encoder): void {
        this.logger.debug(`Reading sync step 1 for ${this.id}`);
        syncProtocol.readSyncStep1(decoder, encoder, this.ydoc);
    }

    public readSyncStep2(
        decoder: decoding.Decoder,
        transactionOrigin: TransactionOrigin
    ): void {
        this.logger.debug(`Reading sync step 2 for ${this.id}`);
        syncProtocol.readSyncStep2(decoder, this.ydoc, transactionOrigin);
    }

    public readUpdate(
        decoder: decoding.Decoder,
        transactionOrigin: TransactionOrigin
    ): void {
        this.logger.debug(`Reading update for ${this.id}`);
        if (this.canWrite(decoder, transactionOrigin)) {
            syncProtocol.readUpdate(decoder, this.ydoc, transactionOrigin);
        } else {
            this.logger.error(`Unauthorized update attempt on ${this.id}`);
            // Disconnect the client
            this.closeConn(transactionOrigin.conn);
        }
    }

    public async init(): Promise<void> {
        this.ydoc.on('update', this.updateHandler);
        this.awareness.on('update', this.awarenessHandler);

        // Initialize executors (will be set externally)
        // this.executor?.start();
        // this.aiExecutor?.start();

        // Initialize pubsub
        await this.pubSubProvider?.connect();
    }

    public async destroy(): Promise<void> {
        await Promise.all([
            this.executor?.stop(),
            this.aiExecutor?.stop(),
        ]);

        this.ydoc.off('update', this.updateHandler);
        await this.persistUpdatesQueue.onIdle();

        await this.persistor.persist(this);
        await this.pubSubProvider?.disconnect();

        this.awareness.destroy();
        this.ydoc.destroy();
    }

    private async reset(newYDoc: Y.Doc, newClock: number, newByteLength: number): Promise<void> {
        await Promise.all([this.executor?.stop(), this.aiExecutor?.stop()]);

        this.ydoc.off('update', this.updateHandler);
        this.ydoc.destroy();

        this.awareness.off('update', this.awarenessHandler);
        await this.persistUpdatesQueue.onIdle();
        this.awareness.destroy();

        this.ydoc = newYDoc;
        this.clock = newClock;
        this.byteLength = newByteLength;
        this.title = this.getTitleFromDoc();

        this.awareness = this.configAwareness();
        this.ydoc.on('update', this.updateHandler);

        await this.pubSubProvider?.reset(newYDoc, newClock);

        // Restart executors
        // this.executor = createExecutor();
        // this.aiExecutor = createAIExecutor();
        // this.executor?.start();
        // this.aiExecutor?.start();
    }

    private configAwareness(): awarenessProtocol.Awareness {
        const awareness = new awarenessProtocol.Awareness(this.ydoc);
        awareness.setLocalState(null);
        return awareness;
    }

    private updateHandler = async (
        update: Uint8Array,
        _origin: any,
        _doc: Y.Doc,
        tr: Y.Transaction
    ) => {
        this.hasUpdatesToPersist = true;

        // Broadcast to connections
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeUpdate(encoder, update);
        const message = encoding.toUint8Array(encoder);

        this.conns.forEach((_, conn) => this.send(conn, message));

        // Handle title updates
        const titleChanged = await this.handleTitleUpdate();
        if (titleChanged && this.onTitleChange) {
            await this.onTitleChange(this.title);
        }

        // Don't persist while duplicating
        if ((tr.origin as any)?.isDuplicating) {
            return;
        }

        // Queue persistence
        this.persistUpdatesQueue.add(async () => {
            this.persistUpdatesQueue.clear();
            if (this.hasUpdatesToPersist) {
                this.hasUpdatesToPersist = false;
                await this.persistor.persist(this);
            }
        });
    };

    private awarenessHandler = (
        { added, updated, removed }: {
            added: number[];
            updated: number[];
            removed: number[];
        },
        transactionOrigin: TransactionOrigin | null
    ) => {
        const changedClients = added.concat(updated, removed);

        if (transactionOrigin !== null) {
            const connControlledIDs = this.conns.get(transactionOrigin.conn);
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
            awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
        );
        const buff = encoding.toUint8Array(encoder);

        this.conns.forEach((_, c) => this.send(c, buff));
    };

    private async handleTitleUpdate(): Promise<boolean> {
        const nextTitle = this.getTitleFromDoc();

        if (this.title !== nextTitle) {
            this.title = nextTitle;
            return true;
        }

        return false;
    }

    private send(conn: WebSocket, message: Uint8Array): void {
        if (conn.readyState !== 1) { // WebSocket.OPEN
            this.closeConn(conn);
            return;
        }

        try {
            conn.send(message, (err) => {
                if (err) {
                    this.closeConn(conn);
                    if ((err as any).code !== 'EPIPE') {
                        this.logger.error(`Failed to send message: ${err.message}`);
                    }
                }
            });
        } catch (err) {
            this.closeConn(conn);
            if ((err as any).code !== 'EPIPE') {
                this.logger.error(`Failed to send message: ${err}`);
            }
        }
    }

    private closeConn(conn: WebSocket): void {
        const controlledIds = this.conns.get(conn);
        if (controlledIds !== undefined) {
            this.conns.delete(conn);
            awarenessProtocol.removeAwarenessStates(
                this.awareness,
                Array.from(controlledIds),
                null
            );
        }
        conn.close();
    }

    public setExecutor(executor: any): void {
        this.executor = executor;
    }

    public setAIExecutor(aiExecutor: any): void {
        this.aiExecutor = aiExecutor;
    }

    public setPubSubProvider(provider: PubSubProvider): void {
        this.pubSubProvider = provider;
    }

    public static async make(
        id: string,
        documentId: string,
        workspaceId: string,
        persistor: Persistor,
        onTitleChange?: (title: string) => Promise<void>
    ): Promise<WSSharedDocV2> {
        const loadStateResult = await persistor.load();

        const doc = new WSSharedDocV2(
            id,
            documentId,
            workspaceId,
            loadStateResult,
            persistor,
            onTitleChange
        );

        await doc.init();

        // Check if we need to remove history
        if (
            loadStateResult.applyUpdateLatency > 1000 &&
            Date.now() - loadStateResult.clockUpdatedAt.getTime() > 1000 * 60 * 60 * 24
        ) {
            Logger.log(
                `Removing history from YDoc ${id} to improve performance`,
                'WSSharedDocV2'
            );
            // await doc.removeHistory();
        }

        return doc;
    }
}