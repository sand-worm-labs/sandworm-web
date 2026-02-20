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
import { PubSubProviderFactory } from '@/infrastructure/pubsub/pubsub-provider.factory';
import { PubSubProvider } from '@/infrastructure/pubsub/pubsub.provider';


export class SharedDoc implements WSSharedDoc {

    public id: string;
    public documentId: string;
    public workspaceId: string;
    public conns: Map<WebSocket, Set<number>>;
    public ydoc: Y.Doc;
    public awareness: awarenessProtocol.Awareness;
    public clock: number;

    private readonly logger = new Logger(SharedDoc.name);
    private byteLength = 0;
    private updating = 0;
    private executor?: any;
    private pubSubProvider?: PubSubProvider;
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