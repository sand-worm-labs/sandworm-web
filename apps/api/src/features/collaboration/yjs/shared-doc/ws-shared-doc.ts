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
import { WSSharedDoc, TransactionOrigin, Persistor, LoadStateResult } from '../interfaces';
import { PubSubProviderFactory } from '@/infrastructure/pubsub/pubsub-provider.factory';
import { PubSubProvider } from '@/infrastructure/pubsub/pubsub.provider';
import { MESSAGE_AWARENESS, MESSAGE_SYNC } from '../types/yjs.types';


export class WSSharedDocV2 implements WSSharedDoc {

    public id: string;
    public documentId: string;
    public workspaceId: string;
    public conns: Map<WebSocket, Set<number>>;
    public ydoc: Y.Doc;
    public awareness: awarenessProtocol.Awareness;
    public clock: number;
    public isApp: boolean;
    public userId: string;
    public persistTimeout?: NodeJS.Timeout;
    public lastPersist: number;
    public appId: string;

    private readonly logger = new Logger(WSSharedDocV2.name);
    private title = '';
    private byteLength = 0;
    private hasUpdatesToPersist = false;
    private persistUpdatesQueue: PQueue;
    private updating = 0;
    private executor?: any;
    private aiExecutor?: any;
    private pubSubProvider?: PubSubProvider;

    private constructor(
        id: string,
        documentId: string,
        workspaceId: string,
        loadStateResult: LoadStateResult,
        private readonly persistor: Persistor,
        private readonly pubSubProviderFactory: PubSubProviderFactory,
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
            (!this.executor || this.executor.isIdle()) &&
            (!this.aiExecutor || this.aiExecutor.isIdle())
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


    public async init(): Promise<void> {
        this.ydoc.on('update', this.updateHandler);
        this.awareness.on('update', this.awarenessHandler);

        this.pubSubProvider = this.pubSubProviderFactory.create(
            this.id,
            this.ydoc,
            this.clock,
            this.onNewerClock
        );
        await this.pubSubProvider.connect();

        this.logger.debug(`WSSharedDocV2 initialized for ${this.id}`);
    }

    public async destroy(): Promise<void> {
        this.logger.debug(`Destroying WSSharedDocV2 ${this.id}`);

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

        this.logger.debug(`WSSharedDocV2 destroyed for ${this.id}`);
    }

    private async reset(newYDoc: Y.Doc, newClock: number, newByteLength: number): Promise<void> {
        this.logger.debug(`Resetting WSSharedDocV2 ${this.id}`);

        await Promise.all([
            this.executor?.stop(),
            this.aiExecutor?.stop()
        ]);

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

        this.logger.debug(`WSSharedDocV2 reset complete for ${this.id}`);
    }

    private configAwareness(): awarenessProtocol.Awareness {
        const awareness = new awarenessProtocol.Awareness(this.ydoc);
        awareness.setLocalState(null);
        return awareness;
    }


    private async handleTitleUpdate(): Promise<boolean> {
        const nextTitle = this.getTitleFromDoc();

        if (this.title !== nextTitle) {
            this.title = nextTitle;
            return true;
        }

        return false;
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

    public setExecutor(executor: any): void {
        this.executor = executor;
    }

    public setAIExecutor(aiExecutor: any): void {
        this.aiExecutor = aiExecutor;
    }

    public static async make(
        id: string,
        documentId: string,
        workspaceId: string,
        loadStateResult: LoadStateResult,
        persistor: Persistor,
        pubSubProviderFactory: PubSubProviderFactory,
        onTitleChange?: (title: string) => Promise<void>
    ): Promise<WSSharedDocV2> {
        const doc = new WSSharedDocV2(
            id,
            documentId,
            workspaceId,
            loadStateResult,
            persistor,
            pubSubProviderFactory,
            onTitleChange
        );

        await doc.init();

        if (
            loadStateResult.applyUpdateLatency > 1000 &&
            Date.now() - loadStateResult.clockUpdatedAt.getTime() > 1000 * 60 * 60 * 24
        ) {
            Logger.log(
                `Removing history from YDoc ${id} to improve performance`,
                'WSSharedDocV2'
            );
        }

        return doc;
    }
}