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
import { PersistorFactory } from './persistors/persistor.factory';
import { PubSubProviderFactory } from '@/infrastructure/pubsub/pubsub-provider.factory';
import { Persistor } from './interfaces';
import { Server, Socket } from 'socket.io';
import { DocumentTreeService } from "@/features/document/service/document-tree.service";
import { DocumentExecutorService } from "./executor/document-executor.service";
import { addDashboardItemToYDashboard, cloneBlockGroup, duplicateBlock, getDashboard, getDashboardItem, getDataframes, getLayout, YBlock, YBlockGroup } from "@sandworm/editor";
import { v4 as uuidv4 } from 'uuid';
import { clone } from 'ramda';

export interface LoadYDocResult {
    yDoc: Y.Doc;
    state: Buffer;
    clock: number;
    clockUpdatedAt?: Date;
}

interface YDocCacheConfig {
    maxSize: number;
    ttl?: number;
}

@Injectable()
export class YjsDocumentService implements OnModuleDestroy {
    private readonly logger = new Logger(YjsDocumentService.name);
    private readonly docs = new Map<string, SharedDoc>();
    private readonly docsCache: LRUCache<string, SharedDoc>;
    private readonly creationPromises = new Map<string, Promise<SharedDoc>>();
    private cleanupInterval?: NodeJS.Timeout;

    constructor(
        @InjectRepository(YjsDocumentEntity)
        private readonly yjsDocumentRepo: Repository<YjsDocumentEntity>,
        @InjectRepository(YjsAppDocumentEntity)
        private readonly yjsAppDocumentRepo: Repository<YjsAppDocumentEntity>,
        @InjectRepository(UserYjsAppDocumentEntity)
        private readonly userYjsAppDocumentRepo: Repository<UserYjsAppDocumentEntity>,
        @InjectRepository(DocumentEntity)
        private readonly documentRepo: Repository<DocumentEntity>,
        private readonly persistorFactory: PersistorFactory,
        private readonly pubSubProviderFactory: PubSubProviderFactory,
        private readonly documentTreeService: DocumentTreeService,
        private readonly documentExecutorService: DocumentExecutorService
    ) {
        const cacheConfig: YDocCacheConfig = {
            maxSize: this.getCacheSizeFromEnv(),
        };

        this.docsCache = new LRUCache<string, SharedDoc>({
            maxSize: cacheConfig.maxSize,
            sizeCalculation: (doc) => doc.getByteLength(),
            dispose: async (doc, id) => {
                if (!this.docs.has(id)) {
                    try {
                        await doc.destroy();
                        this.logger.debug(`Disposed cached YDoc: ${id}`);
                    } catch (err) {
                        this.logger.error(
                            `Failed to dispose YDoc ${id}: ${err}`
                        );
                    }
                }
            },
        });

        this.startDocumentCleanup();
    }

    async loadEditYDoc(documentId: string): Promise<LoadYDocResult> {
        const yDoc = new Y.Doc();

        const yjsDoc = await this.yjsDocumentRepo.findOne({
            where: { documentId },
        });

        if (!yjsDoc) {
            const emptyState = Buffer.from(Y.encodeStateAsUpdate(yDoc));
            return {
                yDoc,
                state: emptyState,
                clock: 0,
                clockUpdatedAt: new Date(),
            };
        }

        Y.applyUpdate(yDoc, yjsDoc.state);

        return {
            yDoc,
            state: yjsDoc.state,
            clock: yjsDoc.clock,
            clockUpdatedAt: yjsDoc.clockUpdatedAt || new Date(),
        };
    }

    async loadAppYDoc(documentId: string, userId: string): Promise<LoadYDocResult> {
        const yDoc = new Y.Doc();

        const yjsAppDoc = await this.yjsAppDocumentRepo.findOne({
            where: { documentId },
            order: { createdAt: "DESC" },
        });

        if (!yjsAppDoc) {
            const emptyState = Buffer.from(Y.encodeStateAsUpdate(yDoc));
            return {
                yDoc,
                state: emptyState,
                clock: 0,
                clockUpdatedAt: new Date(),
            };
        }

        const userYjsAppDoc = await this.userYjsAppDocumentRepo.findOne({
            where: {
                yjsAppDocumentId: yjsAppDoc.id,
                userId,
            },
        });

        if (userYjsAppDoc) {
            Y.applyUpdate(yDoc, userYjsAppDoc.state);
            return {
                yDoc,
                state: userYjsAppDoc.state,
                clock: userYjsAppDoc.clock,
                clockUpdatedAt: userYjsAppDoc.clockUpdatedAt || new Date(),
            };
        }

        Y.applyUpdate(yDoc, yjsAppDoc.state);

        const newUserDoc = await this.userYjsAppDocumentRepo.save({
            yjsAppDocumentId: yjsAppDoc.id,
            userId,
            state: yjsAppDoc.state,
            clock: yjsAppDoc.clock,
        });

        return {
            yDoc,
            state: yjsAppDoc.state,
            clock: yjsAppDoc.clock,
            clockUpdatedAt: newUserDoc.clockUpdatedAt || new Date(),
        };
    }

    async saveEditYDoc(documentId: string, yDoc: Y.Doc): Promise<void> {
        const state = Buffer.from(Y.encodeStateAsUpdate(yDoc));

        await this.yjsDocumentRepo.upsert(
            {
                documentId,
                state,
            },
            {
                conflictPaths: ["documentId"],
                skipUpdateIfNoValuesChanged: true,
            },
        );

        this.logger.debug(`Saved edit YDoc for document: ${documentId}`);
    }

    async saveAppYDoc(
        yjsAppDocumentId: string,
        userId: string | null,
        yDoc: Y.Doc,
    ): Promise<void> {
        const state = Buffer.from(Y.encodeStateAsUpdate(yDoc));

        if (userId) {
            await this.userYjsAppDocumentRepo.upsert(
                {
                    yjsAppDocumentId,
                    userId,
                    state,
                },
                {
                    conflictPaths: ["yjsAppDocumentId", "userId"],
                    skipUpdateIfNoValuesChanged: true,
                },
            );
            this.logger.debug(
                `Saved app YDoc for user ${userId}, app: ${yjsAppDocumentId}`
            );
        } else {
            await this.yjsAppDocumentRepo.update(yjsAppDocumentId, { state });
            this.logger.debug(`Saved app YDoc: ${yjsAppDocumentId}`);
        }
    }

    async publishDocument(documentId: string): Promise<YjsAppDocumentEntity> {
        this.logger.log(`Publishing document: ${documentId}`);

        const editYDoc = await this.loadEditYDoc(documentId);
        const state = Buffer.from(Y.encodeStateAsUpdate(editYDoc.yDoc));

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
                {
                    state,
                    clock: yjsAppDoc.clock,
                    clockUpdatedAt: new Date(),
                },
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

        await this.documentRepo.update(documentId, {
            publishedAt: new Date(),
        });

        return yjsAppDoc;
    }

    async getYDocState(
        documentId: string,
        isApp: boolean,
        userId?: string,
    ): Promise<string | null> {
        if (isApp && userId) {
            const result = await this.loadAppYDoc(documentId, userId);
            return result.state.toString("base64");
        }

        const result = await this.loadEditYDoc(documentId);
        return result.state.toString("base64");
    }

    async getYDoc(
        id: string,
        documentId: string,
        workspaceId: string,
        persistor: Persistor
    ): Promise<SharedDoc> {
        this.logger.debug({
            id,
            documentId,
            workspaceId,
            cacheSize: this.docsCache.calculatedSize,
            cacheCount: this.docsCache.size,
        }, 'Getting YDoc');

        let yDoc = this.docs.get(id);

        if (!yDoc) {
            yDoc = this.docsCache.get(id);
            if (yDoc) {
                this.logger.debug({ id }, 'YDoc cache hit');
                this.docs.set(id, yDoc);
                return yDoc;
            }
            this.logger.debug({ id }, 'YDoc cache miss');
        } else {
            return yDoc;
        }

        let creationPromise = this.creationPromises.get(id);

        if (!creationPromise) {
            creationPromise = this.createYDoc(
                id,
                documentId,
                workspaceId,
                persistor
            );
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
    async updateTitleWithWorkspace(documentId: string, workspaceId: string, title: string) {
        await this.documentTreeService.updateDocumentTitle(documentId, workspaceId, title);
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
            this.documentExecutorService,
            (title: string) => this.updateTitleWithWorkspace(documentId, workspaceId, title)
        );

        this.docs.set(id, newYDoc);
        this.docsCache.set(id, newYDoc);

        return newYDoc;
    }


    async getYDocForUpdate<T>(
        id: string,
        documentId: string,
        server: Server,
        workspaceId: string,
        callback: (yDoc: SharedDoc) => T | Promise<T>,
        persistor: Persistor
    ): Promise<T> {
        const doc = await this.getYDoc(
            id,
            documentId,
            workspaceId,
            persistor
        );

        this.incrementUpdating(doc);

        try {
            const result = await callback(doc);
            this.decrementUpdating(doc);

            this.logger.debug({ id }, 'YDoc update completed');
            return result;
        } catch (err) {
            this.decrementUpdating(doc);
            this.logger.error({ id, err }, 'YDoc update failed');
            throw err;
        }
    }

    getDocId(
        documentId: string,
        app: { id: string; userId: string | null } | null,
    ): string {
        if (app) {
            return [documentId, app.id, String(app.userId)].join('-');
        }
        return [documentId, 'null'].join('-');
    }

    async duplicateYDocContent(
        prevDocumentId: string,
        prevWorkspaceId: string,
        newDocumentId: string,
        newWorkspaceId: string,
        server: Server,
        getDuplicatedTitle: (title: string) => string = (t) => `${t} copy`,
        datasourceMap?: Map<string, string>,
    ): Promise<void> {
        const prevId = this.getDocId(prevDocumentId, null);
        const newId = this.getDocId(newDocumentId, null);

        const prevPersistor = this.persistorFactory.createDocumentPersistor(prevDocumentId);
        const newPersistor = this.persistorFactory.createDocumentPersistor(newDocumentId);

        await this.getYDocForUpdate(
            prevId,
            prevDocumentId,
            server,
            prevWorkspaceId,
            async (prevSharedDoc) => {
                await this.getYDocForUpdate(
                    newId,
                    newDocumentId,
                    server,
                    newWorkspaceId,
                    async (newSharedDoc) => {
                        this.duplicateYDoc(
                            prevSharedDoc,
                            newSharedDoc.ydoc,
                            getDuplicatedTitle,
                            { keepIds: false, datasourceMap },
                        );

                        // Force flush so the copied state is persisted before the
                        // frontend can open the new doc and race the persistor.
                        await this.saveEditYDoc(newDocumentId, newSharedDoc.ydoc);
                    },
                    newPersistor,
                );
            },
            prevPersistor,
        );
    }

    duplicateYDoc(
        prevYDoc: SharedDoc,
        newYDoc: Y.Doc,
        getDuplicatedTitle: (title: string) => string,
        config: { keepIds: boolean; datasourceMap?: Map<string, string> }
    ) {
        newYDoc.transact(
            () => {
                // map of old id to new id
                const idMap = new Map<string, string>()

                // duplicate title
                const newTitle = getDuplicatedTitle(prevYDoc.getTitleFromDoc())

                const titleFrag = newYDoc.getXmlFragment('title')
                titleFrag.delete(0, titleFrag.length)
                const titleEl = new Y.XmlElement('title')
                const titleText = new Y.XmlText(newTitle)
                titleEl.insert(0, [titleText])
                titleFrag.insert(0, [titleEl])

                // duplicate blocks
                const oldBlocksMap = prevYDoc.blocks
                const newBlocksMap = newYDoc.getMap<YBlock>('blocks')
                newBlocksMap.clear()

                for (const [blockId, block] of oldBlocksMap.entries()) {
                    const newBlockId = config.keepIds ? blockId : uuidv4()
                    idMap.set(blockId, newBlockId)
                    const blockType = block.getAttribute('type')
                    if (blockType) {
                        const clonedBlock = duplicateBlock(
                            newBlockId,
                            block,
                            prevYDoc.blocks,
                            true,
                            { datasourceMap: config.datasourceMap }
                        )
                        newBlocksMap.set(newBlockId, clonedBlock)
                    }
                }

                // duplicate layout
                const prevLayout = prevYDoc.layout
                const newLayout = getLayout(newYDoc)
                newLayout.delete(0, newLayout.length)
                const newLayoutArr: YBlockGroup[] = prevLayout.map(cloneBlockGroup)
                newLayout.insert(0, newLayoutArr)

                // translate layout ids
                if (!config.keepIds) {
                    newLayout.forEach((newBlockGroup) => {
                        newBlockGroup.getAttribute('tabs')?.forEach((tab) => {
                            const oldId = tab.getAttribute('id')
                            if (oldId) {
                                const translatedId = idMap.get(oldId)
                                tab.setAttribute('id', translatedId ?? uuidv4())
                            }
                        })
                        const currentRef = newBlockGroup.getAttribute('current')
                        if (currentRef) {
                            const oldId = currentRef.getAttribute('id')
                            if (!oldId) {
                                throw new Error('Tab id not found')
                            }
                            const translatedId = idMap.get(oldId)
                            currentRef.setAttribute('id', translatedId ?? uuidv4())
                        }

                        newLayoutArr.push(newBlockGroup)
                    })
                }

                const prevDashboard = prevYDoc.dashboard

                const newDashboard = getDashboard(newYDoc)
                newDashboard.clear()

                for (const dashId of prevDashboard.keys()) {
                    const dashItem = getDashboardItem(prevDashboard, dashId)
                    if (!dashItem) {
                        continue
                    }

                    const oldId = dashItem.blockId
                    const newId = idMap.get(oldId)
                    if (!newId) {
                        continue
                    }

                    dashItem.blockId = newId
                    addDashboardItemToYDashboard(newDashboard, dashItem)
                }

                // duplicate dataframes
                const prevDataframes = prevYDoc.dataframes
                const newDataframes = getDataframes(newYDoc)
                newDataframes.clear()

                for (const [dataframeId, dataframe] of prevDataframes.entries()) {
                    newDataframes.set(dataframeId, clone(dataframe))
                }
            },
            { isDuplicating: true }
        )
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
            this.logger.debug(
                { docsCount: this.docs.size },
                'Running document cleanup'
            );

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

                this.logger.debug({ docId }, 'Collecting document');
                this.docs.delete(docId);

                if (!this.docsCache.has(docId)) {
                    try {
                        await doc.destroy();
                        collected++;
                    } catch (err) {
                        this.logger.error(
                            { docId, err },
                            'Failed to destroy document during cleanup'
                        );
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
            this.logger.error(
                { err, timeMs: Date.now() - startTime },
                'Document cleanup failed'
            );
        }
    }

    async onModuleDestroy(): Promise<void> {
        this.logger.log('Shutting down YJS Document Service');

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        const destroyPromises = Array.from(this.docs.values()).map((doc) =>
            doc.destroy().catch((err) => {
                this.logger.error(
                    `Failed to destroy document ${doc.id}: ${err.message}`,
                );
            }),
        );

        await Promise.all(destroyPromises);

        for (const doc of this.docsCache.values()) {
            try {
                await doc.destroy();
            } catch (err) {
                this.logger.error(
                    `Failed to destroy cached doc: ${err}`
                );
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

    private incrementUpdating(doc: SharedDoc): void {
        (doc as any).updating = ((doc as any).updating || 0) + 1;
    }

    private decrementUpdating(doc: SharedDoc): void {
        (doc as any).updating = Math.max(((doc as any).updating || 0) - 1, 0);
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