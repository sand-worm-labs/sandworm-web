import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, EntityManager } from "typeorm";
import * as Y from "yjs";
import {
    YjsDocumentEntity,
    YjsAppDocumentEntity,
    UserYjsAppDocumentEntity,
    DocumentEntity,
} from "@sandworm/postgresql-typeorm";
import { SharedDoc } from './shared-doc/ws-shared-doc';
import { LRUCache } from 'lru-cache';
import { PubSubProviderFactory } from '@/infrastructure/pubsub/pubsub-provider.factory';
import { LoadStateResult, Persistor } from './interfaces';
import { PersistorFactory } from "./persistors/persistor.factory";
import { MessageHandlerService } from "./services/message-handler.service";


@Injectable()
export class YjsDocumentService implements OnModuleDestroy {
    private readonly logger = new Logger(YjsDocumentService.name);
    private readonly docs = new Map<string, SharedDoc>();
    private readonly docsCache: LRUCache<string, SharedDoc>;
    private readonly creationPromises = new Map<string, Promise<SharedDoc>>();
    private cleanupInterval?: NodeJS.Timeout;

    constructor(
        @InjectRepository(YjsAppDocumentEntity)
        private readonly yjsAppDocumentRepo: Repository<YjsAppDocumentEntity>,
        @InjectRepository(UserYjsAppDocumentEntity)
        private readonly userYjsAppDocumentRepo: Repository<UserYjsAppDocumentEntity>,
        @InjectRepository(DocumentEntity)
        private readonly documentRepo: Repository<DocumentEntity>,
        private readonly pubSubProviderFactory: PubSubProviderFactory,
        private readonly persistorFactory: PersistorFactory,
        private readonly messageHandler: MessageHandlerService,
    ) {
        this.docsCache = new LRUCache<string, SharedDoc>({
            maxSize: this.getCacheSizeFromEnv(),
            sizeCalculation: (doc) => doc.getByteLength(),
            dispose: async (doc, id) => {
                if (!this.docs.has(id)) {
                    try {
                        await doc.destroy();
                        this.logger.debug(`Disposed cached YDoc: ${id}`);
                    } catch (err) {
                        this.logger.error(`Failed to dispose YDoc ${id}: ${err}`);
                    }
                }
            },
        });

        this.startDocumentCleanup();
    }

    async publishDocument(documentId: string): Promise<YjsAppDocumentEntity> {
        this.logger.log(`Publishing document: ${documentId}`);

        const editYDoc = await this.persistorFactory.createDocumentPersistor(documentId).load();
        const state = Buffer.from(Y.encodeStateAsUpdate(editYDoc.ydoc));

        let yjsAppDoc = await this.yjsAppDocumentRepo.findOne({
            where: { documentId },
            order: { createdAt: "DESC" },
        });

        if (yjsAppDoc) {
            yjsAppDoc.state = state;
            yjsAppDoc.clock += 1;
            yjsAppDoc.clockUpdatedAt = new Date();
            await this.yjsAppDocumentRepo.save(yjsAppDoc);

            await this.userYjsAppDocumentRepo.update(
                { yjsAppDocumentId: yjsAppDoc.id },
                { state, clock: yjsAppDoc.clock, clockUpdatedAt: new Date() },
            );

            this.logger.log(`Updated existing app document: ${yjsAppDoc.id}`);
        } else {
            yjsAppDoc = await this.yjsAppDocumentRepo.save({
                documentId,
                state,
                clock: 0,
                clockUpdatedAt: new Date(),
            });

            this.logger.log(`Created new app document: ${yjsAppDoc.id}`);
        }

        await this.documentRepo.update(documentId, { publishedAt: new Date() });

        return yjsAppDoc;
    }

    async getYDocState(
        documentId: string,
        isApp: boolean,
        appId?: string,
        userId?: string,
    ): Promise<string | null> {
        const persistor = isApp && userId
            ? this.persistorFactory.createAppPersistor(documentId, appId, userId)
            : this.persistorFactory.createDocumentPersistor(documentId);

        const result = await persistor.load();
        return Buffer.from(Y.encodeStateAsUpdate(result.ydoc)).toString("base64");
    }

    async getYDoc(
        id: string,
        documentId: string,
        workspaceId: string,
        persistor: Persistor,
    ): Promise<SharedDoc> {
        this.logger.debug({
            id,
            documentId,
            workspaceId,
            cacheSize: this.docsCache.calculatedSize,
            cacheCount: this.docsCache.size,
        }, 'Getting YDoc');

        let yDoc = this.docs.get(id);
        if (yDoc) return yDoc;

        yDoc = this.docsCache.get(id);
        if (yDoc) {
            this.logger.debug({ id }, 'YDoc cache hit');
            this.docs.set(id, yDoc);
            return yDoc;
        }

        this.logger.debug({ id }, 'YDoc cache miss');

        let creationPromise = this.creationPromises.get(id);

        if (!creationPromise) {
            creationPromise = this.createYDoc(id, documentId, workspaceId, persistor);
            this.creationPromises.set(id, creationPromise);

            try {
                yDoc = await creationPromise;
            } finally {
                this.creationPromises.delete(id);
            }
        } else {
            yDoc = await creationPromise;
        }

        this.logger.debug({
            id,
            cacheSize: this.docsCache.calculatedSize,
            cacheCount: this.docsCache.size,
        }, 'YDoc created/retrieved');

        return yDoc;
    }

    private async createYDoc(
        id: string,
        documentId: string,
        workspaceId: string,
        persistor: Persistor,
        tx?: EntityManager,
    ): Promise<SharedDoc> {
        const loadStateResult = await persistor.load(tx);

        const newYDoc = await SharedDoc.make(
            id,
            documentId,
            workspaceId,
            loadStateResult,
            persistor,
            this.pubSubProviderFactory,
            (update, tr) => this.messageHandler.handleYDocUpdate(tr, update, (msg) => this.broadcast(id, msg)),
            (changes, origin) => this.messageHandler.handleAwarenessUpdate(newYDoc, changes, origin, (msg) => this.broadcast(id, msg)),
        );

        this.docs.set(id, newYDoc);
        this.docsCache.set(id, newYDoc);

        return newYDoc;
    }

    async getYDocForUpdate<T>(
        id: string,
        documentId: string,
        workspaceId: string,
        persistor: Persistor,
        callback: (yDoc: SharedDoc) => T | Promise<T>,
    ): Promise<T> {
        const doc = await this.getYDoc(id, documentId, workspaceId, persistor);

        doc.incrementUpdating();

        try {
            const result = await callback(doc);
            this.logger.debug({ id }, 'YDoc update completed');
            return result;
        } catch (err) {
            this.logger.error({ id, err }, 'YDoc update failed');
            throw err;
        } finally {
            doc.decrementUpdating();
        }
    }


    private startDocumentCleanup(): void {
        const CLEANUP_INTERVAL = 20 * 1000;

        this.cleanupInterval = setInterval(async () => {
            await this.runCleanup();
        }, CLEANUP_INTERVAL);

        this.logger.log('Document cleanup started');
    }

    private async runCleanup(): Promise<void> {
        const startTime = Date.now();

        try {
            this.logger.debug({ docsCount: this.docs.size }, 'Running document cleanup');

            let collected = 0;
            const toCollect: string[] = [];

            for (const [docId, doc] of this.docs) {
                if (doc.canCollect()) {
                    toCollect.push(docId);
                }
            }

            for (const docId of toCollect) {
                const doc = this.docs.get(docId);
                if (!doc) continue;

                this.docs.delete(docId);

                if (!this.docsCache.has(docId)) {
                    try {
                        await doc.destroy();
                        collected++;
                        this.logger.debug({ docId }, 'Collected document');
                    } catch (err) {
                        this.logger.error({ docId, err }, 'Failed to destroy document during cleanup');
                    }
                }
            }

            if (collected > 0) {
                this.logger.debug({
                    collected,
                    timeMs: Date.now() - startTime,
                    remaining: this.docs.size,
                }, 'Document cleanup completed');
            }
        } catch (err) {
            this.logger.error({ err, timeMs: Date.now() - startTime }, 'Document cleanup failed');
        }
    }

    async onModuleDestroy(): Promise<void> {
        this.logger.log('Shutting down YJS Document Service');

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        const destroyPromises = Array.from(this.docs.values()).map((doc) =>
            doc.destroy().catch((err) => {
                this.logger.error(`Failed to destroy document ${doc.id}: ${err.message}`);
            }),
        );

        await Promise.all(destroyPromises);

        for (const doc of this.docsCache.values()) {
            try {
                await doc.destroy();
            } catch (err) {
                this.logger.error(`Failed to destroy cached doc: ${err}`);
            }
        }

        this.docs.clear();
        this.docsCache.clear();
        this.creationPromises.clear();

        this.logger.log('YJS Document Service shutdown complete');
    }

    private getCacheSizeFromEnv(): number {
        const envSize = process.env.YJS_DOCS_CACHE_SIZE_MB;
        if (envSize) {
            const parsed = parseInt(envSize, 10);
            if (!isNaN(parsed) && parsed > 0) {
                return parsed * 1024 * 1024;
            }
        }
        return 100 * 1024 * 1024;
    }

    getStats() {
        return {
            activeDocs: this.docs.size,
            cachedDocs: this.docsCache.size,
            cacheSize: this.docsCache.calculatedSize,
            pendingCreations: this.creationPromises.size,
        };
    }
}