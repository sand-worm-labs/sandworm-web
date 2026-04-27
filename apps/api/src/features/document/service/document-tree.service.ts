import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { DocumentEntity, YjsDocumentEntity } from '@sandworm/postgresql-typeorm';
import PQueue from 'p-queue';
import { Doc, encodeStateAsUpdate } from 'yjs';
import { EventEmitter2, EventEmitterReadinessWatcher } from '@nestjs/event-emitter';
import {
    WorkspaceDocumentsEvent,
    DocumentUpdateEvent,
    EventNames,
} from '@/core/events/document.events';
import { Document } from '../model/document.model';

const queues = new Map<string, PQueue>();

@Injectable()
export class DocumentTreeService {
    private readonly logger = new Logger(DocumentTreeService.name);

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        @InjectRepository(YjsDocumentEntity)
        private readonly yjsDocumentRepository: Repository<YjsDocumentEntity>,
        private readonly eventEmitter: EventEmitter2,
        private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
    ) { }

    private async wrapInQueue<T>(
        workspaceId: string,
        fn: () => Promise<T>,
    ): Promise<T> {
        let queue = queues.get(workspaceId);
        if (!queue) {
            queue = new PQueue({ concurrency: 1 });
            queues.set(workspaceId, queue);
        }

        return new Promise<T>((resolve, reject) => {
            queue!.add(async () => {
                try {
                    resolve(await fn());
                } catch (error) {
                    reject(error);
                }
            }).catch(reject);
        });
    }

    private docRepo(manager?: EntityManager): Repository<DocumentEntity> {
        return manager ? manager.getRepository(DocumentEntity) : this.documentRepository;
    }

    private yjsRepo(manager?: EntityManager): Repository<YjsDocumentEntity> {
        return manager ? manager.getRepository(YjsDocumentEntity) : this.yjsDocumentRepository;
    }

    private async shiftDocumentsDown(
        workspaceId: string,
        parentId: string | null,
        fromIndex: number,
        manager?: EntityManager,
    ): Promise<void> {
        await this.docRepo(manager)
            .createQueryBuilder()
            .update(DocumentEntity)
            .set({ orderIndex: () => '"order_index" + 1' })
            .where('workspaceId = :workspaceId', { workspaceId })
            .andWhere(
                parentId !== null ? 'parentId = :parentId' : 'parentId IS NULL',
                parentId !== null ? { parentId } : {},
            )
            .andWhere('orderIndex >= :fromIndex', { fromIndex })
            .execute();
    }

    private async shiftDocumentsUp(
        workspaceId: string,
        parentId: string | null,
        fromIndex: number,
        manager?: EntityManager,
    ): Promise<void> {
        await this.docRepo(manager)
            .createQueryBuilder()
            .update(DocumentEntity)
            .set({ orderIndex: () => '"order_index" - 1' })
            .where('workspaceId = :workspaceId', { workspaceId })
            .andWhere(
                parentId !== null ? 'parentId = :parentId' : 'parentId IS NULL',
                parentId !== null ? { parentId } : {},
            )
            .andWhere('orderIndex > :fromIndex', { fromIndex })
            .execute();
    }

    private async calculateOrderIndex(
        workspaceId: string,
        parentId: string | null,
        requestedIndex: number,
        manager?: EntityManager,
    ): Promise<number> {
        const repo = this.docRepo(manager);

        const childrenCount = await repo.count({
            where: { workspaceId, parentId, deletedAt: null },
        });

        if (requestedIndex === -1 || requestedIndex > childrenCount) {
            const lastChild = await repo.findOne({
                where: { workspaceId, parentId, deletedAt: null },
                order: { orderIndex: 'DESC' },
                select: ['orderIndex'],
            });

            return (lastChild?.orderIndex ?? childrenCount - 1) + 1;
        }

        return requestedIndex;
    }

    async createDocument(
        workspaceId: string,
        authorId: string,
        title: string,
        parentId: string | null = null,
        orderIndex: number = 0,
        version: number = 1,
        manager?: EntityManager,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const run = async (m: EntityManager) => {
                const docRepo = m.getRepository(DocumentEntity);
                const yjsRepo = m.getRepository(YjsDocumentEntity);

                const finalOrderIndex = await this.calculateOrderIndex(workspaceId, parentId, orderIndex, m);
                await this.shiftDocumentsDown(workspaceId, parentId, finalOrderIndex, m);

                const document = await docRepo.save(docRepo.create({
                    title,
                    workspaceId,
                    parentId,
                    orderIndex: finalOrderIndex,
                    version,
                    authorId,
                }));

                try {
                    const yDoc = new Doc();
                    const initialState = encodeStateAsUpdate(yDoc);

                    await yjsRepo.save(yjsRepo.create({
                        documentId: document.id,
                        state: Buffer.from(initialState),
                        clock: 0,
                        clockUpdatedAt: new Date(),
                    }));
                } catch (err) {
                    this.logger.warn(
                        { err, workspaceId, authorId, documentId: document.id },
                        'Failed to create YJS document, continuing without it',
                    );
                }

                const reloaded = await docRepo.findOne({
                    where: { id: document.id },
                    relations: ['yjsDocuments', 'author', 'parent'],
                });

                return reloaded || document;
            };

            return manager ? run(manager) : this.dataSource.transaction(run);
        });
    }

    async updateDocumentTitle(
        id: string,
        workspaceId: string,
        title: string,
        manager?: EntityManager,
    ): Promise<DocumentEntity> {
        const repo = this.docRepo(manager);

        const document = await repo.findOne({ where: { id, workspaceId } });
        if (!document) throw new NotFoundException('Document not found');

        document.title = title;
        await repo.save(document);
        await this.emitDocumentUpdate(workspaceId, Document.fromEntity(document));

        return document;
    }

    async moveDocument(
        id: string,
        workspaceId: string,
        newParentId: string | null,
        newOrderIndex: number,
        manager?: EntityManager,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const run = async (m: EntityManager) => {
                const repo = m.getRepository(DocumentEntity);

                const document = await repo.findOne({ where: { id, workspaceId } });
                if (!document) throw new NotFoundException('Document not found');

                const oldParentId = document.parentId;
                const oldOrderIndex = document.orderIndex;

                const finalOrderIndex = await this.calculateOrderIndex(workspaceId, newParentId, newOrderIndex, m);

                await this.shiftDocumentsDown(workspaceId, newParentId, finalOrderIndex, m);

                document.parentId = newParentId;
                document.orderIndex = finalOrderIndex;
                await repo.save(document);

                if (oldParentId !== newParentId || oldOrderIndex > finalOrderIndex) {
                    await this.shiftDocumentsUp(workspaceId, oldParentId, oldOrderIndex, m);
                }

                return document;
            };

            return manager ? run(manager) : this.dataSource.transaction(run);
        });
    }


    private async restoreChildrenRecursive(
        parentId: string,
        workspaceId: string,
        manager?: EntityManager,
    ): Promise<void> {
        const repo = this.docRepo(manager);

        await repo
            .createQueryBuilder()
            .update(DocumentEntity)
            .set({ deletedAt: null })
            .where('parentId = :parentId', { parentId })
            .andWhere('workspaceId = :workspaceId', { workspaceId })
            .execute();

        const children = await repo.find({
            where: { parentId, workspaceId },
            select: ['id'],
        });

        for (const child of children) {
            await this.restoreChildrenRecursive(child.id, workspaceId, manager);
        }
    }

    async restoreDocument(
        id: string,
        workspaceId: string,
        manager?: EntityManager,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const run = async (m: EntityManager) => {
                const repo = m.getRepository(DocumentEntity);

                const document = await repo.findOne({
                    where: { id, workspaceId },
                    relations: ['parent'],
                    withDeleted: true,
                });

                if (!document || !document.deletedAt) {
                    throw new NotFoundException('Deleted document not found');
                }

                let parent = document.parent;
                if (parent?.deletedAt) parent = null;

                const maxOrderResult = await repo
                    .createQueryBuilder('doc')
                    .select('MAX(doc.orderIndex)', 'max')
                    .where('doc.workspaceId = :workspaceId', { workspaceId })
                    .andWhere(
                        parent?.id ? 'doc.parentId = :parentId' : 'doc.parentId IS NULL',
                        parent?.id ? { parentId: parent.id } : {},
                    )
                    .andWhere('doc.deletedAt IS NULL')
                    .getRawOne();

                document.parentId = parent?.id ?? null;
                document.deletedAt = null;
                document.orderIndex = (maxOrderResult?.max ?? 0) + 1;
                await repo.save(document);

                await this.restoreChildrenRecursive(document.id, workspaceId, m);

                return document;
            };

            return manager ? run(manager) : this.dataSource.transaction(run);
        });
    }

    private async softDeleteChildrenRecursive(
        parentId: string,
        workspaceId: string,
        deletedAt: Date,
        manager?: EntityManager,
    ): Promise<void> {
        const repo = this.docRepo(manager);

        await repo
            .createQueryBuilder()
            .update(DocumentEntity)
            .set({ deletedAt })
            .where('parentId = :parentId', { parentId })
            .andWhere('workspaceId = :workspaceId', { workspaceId })
            .execute();

        const children = await repo.find({
            where: { parentId, workspaceId },
            select: ['id'],
        });

        for (const child of children) {
            await this.softDeleteChildrenRecursive(child.id, workspaceId, deletedAt, manager);
        }
    }

    async deleteDocument(
        id: string,
        workspaceId: string,
        softDelete: boolean,
        manager?: EntityManager,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const run = async (m: EntityManager) => {
                const repo = m.getRepository(DocumentEntity);

                const document = await repo.findOne({ where: { id, workspaceId } });
                if (!document) throw new NotFoundException('Document not found');

                const wasDeleted = !!document.deletedAt;

                if (softDelete) {
                    const deletedAt = new Date();
                    document.deletedAt = deletedAt;
                    await repo.save(document);
                    await this.softDeleteChildrenRecursive(id, workspaceId, deletedAt, m);
                } else {
                    await repo.remove(document);
                }

                if (!wasDeleted) {
                    await this.shiftDocumentsUp(workspaceId, document.parentId, document.orderIndex, m);
                }

                return document;
            };

            return manager ? run(manager) : this.dataSource.transaction(run);
        });
    }

    private async duplicateChildren(
        oldParentId: string,
        newParentId: string,
        workspaceId: string,
        userId: string,
        manager?: EntityManager,
    ): Promise<void> {
        const repo = this.docRepo(manager);

        const children = await repo.find({
            where: { parentId: oldParentId, workspaceId },
            order: { orderIndex: 'ASC' },
        });

        for (const child of children) {
            const duplicatedChild = await repo.save(repo.create({
                title: child.title,
                workspaceId: child.workspaceId,
                parentId: newParentId,
                orderIndex: child.orderIndex,
                version: child.version,
                authorId: userId,
            }));

            await this.duplicateChildren(child.id, duplicatedChild.id, workspaceId, userId, manager);
            await this.duplicateYjsContent(child.id, duplicatedChild.id, manager);
        }
    }

    private async duplicateYjsContent(
        oldDocId: string,
        newDocId: string,
        manager?: EntityManager,
    ): Promise<void> {
        const repo = this.yjsRepo(manager);

        const oldYjsDoc = await repo.findOne({ where: { documentId: oldDocId } });
        if (!oldYjsDoc) return;

        await repo.save(repo.create({
            documentId: newDocId,
            state: oldYjsDoc.state,
            clock: 0,
            clockUpdatedAt: new Date(),
        }));
    }

    async duplicateDocument(
        id: string,
        workspaceId: string,
        userId: string,
        manager?: EntityManager,
        sameWorkspace: boolean = true
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const run = async (m: EntityManager) => {
                const docRepo = m.getRepository(DocumentEntity);

                // ── fetch original ─────────────────────────────────────────
                const original = await docRepo.findOne({
                    where: sameWorkspace
                        ? { id, workspaceId }
                        : { id },
                });
                if (!original) throw new NotFoundException('Document not found');
                let orderIndex: number = 0;

                if (sameWorkspace) {
                    orderIndex = original.orderIndex + 1;
                    await this.shiftDocumentsDown(workspaceId, original.parentId, orderIndex, m);
                }

                // ── create duplicate ───────────────────────────────────────
                const duplicate = await docRepo.save(docRepo.create({
                    title: original.title === '' ? '' : `${original.title} copy`,
                    workspaceId,
                    parentId: sameWorkspace ? original.parentId : null,
                    version: original.version,
                    orderIndex,
                    authorId: userId,
                }));
                if (sameWorkspace) await this.duplicateChildren(original.id, duplicate.id, workspaceId, userId, m);
                await this.duplicateYjsContent(original.id, duplicate.id, m);
                return duplicate;
            };

            return manager ? run(manager) : this.dataSource.transaction(run);
        });
    }

    async getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
        const documents = await this.documentRepository.find({ where: { workspaceId } });
        return Document.fromEntities(documents);
    }

    public async emitDocumentUpdate(workspaceId: string, document: Document): Promise<void> {
        await this.eventEmitterReadinessWatcher.waitUntilReady();
        this.eventEmitter.emit(
            EventNames.DOCUMENT_UPDATE,
            new DocumentUpdateEvent(workspaceId, document),
        );
    }

    public async emitWorkspaceDocuments(workspaceId: string): Promise<void> {
        await this.eventEmitterReadinessWatcher.waitUntilReady();
        const documents = await this.getWorkspaceDocuments(workspaceId);
        this.eventEmitter.emit(
            EventNames.WORKSPACE_DOCUMENTS,
            new WorkspaceDocumentsEvent(workspaceId, documents),
        );
    }
}