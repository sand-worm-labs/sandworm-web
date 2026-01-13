import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity, YjsDocumentEntity } from '@sandworm/postgresql-typeorm';
import PQueue from 'p-queue';
import { ValidationException } from '@sandworm/graphql';
import { Doc, encodeStateAsUpdate } from 'yjs';
import { ErrorCode } from '@/core/constants/error-code.constant';

const queues = new Map<string, PQueue>();

@Injectable()
export class DocumentTreeService {
    private readonly logger = new Logger(DocumentTreeService.name);

    constructor(
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        @InjectRepository(YjsDocumentEntity)
        private readonly yjsDocumentRepository: Repository<YjsDocumentEntity>,
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
                    const result = await fn();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }).catch(reject);
        });
    }

    // ========================================
    // ORDER INDEX MANAGEMENT
    // ========================================

    // Shift documents down (increment order) to make space
    // Example: [0,1,2] -> insert at 1 -> [0,_,2,3]
    private async shiftDocumentsDown(
        workspaceId: string,
        parentId: string | null,
        fromIndex: number,
    ): Promise<void> {
        await this.documentRepository
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

    // Shift documents up (decrement order) to close gap
    // Example: [0,1,2,3] -> delete 1 -> [0,1,2]
    private async shiftDocumentsUp(
        workspaceId: string,
        parentId: string | null,
        fromIndex: number,
    ): Promise<void> {
        await this.documentRepository
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

    // Calculate where to actually put the document
    // -1 or too large = append to end
    private async calculateOrderIndex(
        workspaceId: string,
        parentId: string | null,
        requestedIndex: number,
    ): Promise<number> {
        const childrenCount = await this.documentRepository.count({
            where: { workspaceId, parentId, deletedAt: null },
        });

        if (requestedIndex === -1 || requestedIndex > childrenCount) {
            const lastChild = await this.documentRepository.findOne({
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
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            // --- STEP 1: Calculate order index and shift siblings
            const finalOrderIndex = await this.calculateOrderIndex(
                workspaceId,
                parentId,
                orderIndex,
            );
            await this.shiftDocumentsDown(workspaceId, parentId, finalOrderIndex);

            // --- STEP 2: Create document entity
            const document = this.documentRepository.create({
                title,
                workspaceId,
                parentId,
                orderIndex: finalOrderIndex,
                version,
                authorId,
            });

            await this.documentRepository.save(document);
            this.logger.log(`Created document ${document.id} in workspace ${workspaceId}`);

            // --- STEP 3: Attempt to create YJS document, but do not fail main creation
            try {
                const yDoc = new Doc();
                const initialState = encodeStateAsUpdate(yDoc);

                const yjsDocument = this.yjsDocumentRepository.create({
                    documentId: document.id,
                    state: Buffer.from(initialState),
                    clock: 0,
                    clockUpdatedAt: new Date(),
                });

                await this.yjsDocumentRepository.save(yjsDocument);
                this.logger.log(`Created YJS document for document ${document.id}`);
            } catch (err) {
                this.logger.warn(
                    { err, workspaceId, authorId, documentId: document.id },
                    'Failed to create YJS document, continuing without it',
                );
                // Do NOT delete the main document
            }

            // --- STEP 4: Reload with relations (GraphQL-ready)
            const reloaded = await this.documentRepository.findOne({
                where: { id: document.id },
                relations: ['yjsDocuments', 'author', 'parent'],
            });

            return reloaded || document;
        });
    }

    async updateDocument(
        id: string,
        workspaceId: string,
        title: string,
    ): Promise<DocumentEntity> {
        const document = await this.documentRepository.findOne({
            where: { id, workspaceId },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        document.title = title;
        await this.documentRepository.save(document);

        return document;
    }

    async moveDocument(
        id: string,
        workspaceId: string,
        newParentId: string | null,
        newOrderIndex: number,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const document = await this.documentRepository.findOne({
                where: { id, workspaceId },
            });

            if (!document) {
                throw new NotFoundException('Document not found');
            }

            const oldParentId = document.parentId;
            const oldOrderIndex = document.orderIndex;

            const finalOrderIndex = await this.calculateOrderIndex(
                workspaceId,
                newParentId,
                newOrderIndex,
            );

            // Make space in new location
            await this.shiftDocumentsDown(workspaceId, newParentId, finalOrderIndex);

            // Update document
            document.parentId = newParentId;
            document.orderIndex = finalOrderIndex;
            await this.documentRepository.save(document);

            // Close gap in old location (only if actually moved)
            if (oldParentId !== newParentId || oldOrderIndex > finalOrderIndex) {
                await this.shiftDocumentsUp(workspaceId, oldParentId, oldOrderIndex);
            }

            return document;
        });
    }

    private async restoreChildrenRecursive(
        parentId: string,
        workspaceId: string,
    ): Promise<void> {
        await this.documentRepository
            .createQueryBuilder()
            .update(DocumentEntity)
            .set({ deletedAt: null })
            .where('parentId = :parentId', { parentId })
            .andWhere('workspaceId = :workspaceId', { workspaceId })
            .execute();

        const children = await this.documentRepository.find({
            where: { parentId, workspaceId },
            select: ['id'],
        });

        for (const child of children) {
            await this.restoreChildrenRecursive(child.id, workspaceId);
        }
    }

    // Restore deleted document (undelete)
    // If parent is also deleted, restores to root
    // Appends to end of sibling list
    async restoreDocument(
        id: string,
        workspaceId: string,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const document = await this.documentRepository.findOne({
                where: { id, workspaceId },
                relations: ['parent'],
                withDeleted: true,
            });

            if (!document || !document.deletedAt) {
                throw new NotFoundException('Deleted document not found');
            }

            let parent = document.parent;
            if (parent?.deletedAt) {
                parent = null; // Parent deleted, restore to root
            }

            // Find max order index among siblings
            const maxOrderResult = await this.documentRepository
                .createQueryBuilder('doc')
                .select('MAX(doc.orderIndex)', 'max')
                .where('doc.workspaceId = :workspaceId', { workspaceId })
                .andWhere(
                    parent?.id ? 'doc.parentId = :parentId' : 'doc.parentId IS NULL',
                    parent?.id ? { parentId: parent.id } : {},
                )
                .andWhere('doc.deletedAt IS NULL')
                .getRawOne();

            const newOrderIndex = (maxOrderResult?.max ?? 0) + 1;

            document.parentId = parent?.id ?? null;
            document.deletedAt = null;
            document.orderIndex = newOrderIndex;
            await this.documentRepository.save(document);

            await this.restoreChildrenRecursive(document.id, workspaceId);

            return document;
        });
    }

    // ========================================
    // DELETE DOCUMENT
    // ========================================

    // Recursively soft-delete all children
    private async softDeleteChildrenRecursive(
        parentId: string,
        workspaceId: string,
        deletedAt: Date,
    ): Promise<void> {
        await this.documentRepository
            .createQueryBuilder()
            .update(DocumentEntity)
            .set({ deletedAt })
            .where('parentId = :parentId', { parentId })
            .andWhere('workspaceId = :workspaceId', { workspaceId })
            .execute();

        const children = await this.documentRepository.find({
            where: { parentId, workspaceId },
            select: ['id'],
        });

        for (const child of children) {
            await this.softDeleteChildrenRecursive(child.id, workspaceId, deletedAt);
        }
    }

    // Delete document (soft or hard)
    // Soft delete: marks as deleted, keeps in DB
    // Hard delete: removes from DB permanently
    // Both close the gap in sibling order
    async deleteDocument(
        id: string,
        workspaceId: string,
        softDelete: boolean,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const document = await this.documentRepository.findOne({
                where: { id, workspaceId },
            });

            if (!document) {
                throw new NotFoundException('Document not found');
            }

            const wasDeleted = !!document.deletedAt;

            if (softDelete) {
                const deletedAt = new Date();
                document.deletedAt = deletedAt;
                await this.documentRepository.save(document);
                await this.softDeleteChildrenRecursive(id, workspaceId, deletedAt);
            } else {
                await this.documentRepository.remove(document);
            }

            // Only shift siblings if wasn't already deleted
            if (!wasDeleted) {
                await this.shiftDocumentsUp(
                    workspaceId,
                    document.parentId,
                    document.orderIndex,
                );
            }

            return document;
        });
    }

    // ========================================
    // DUPLICATE DOCUMENT
    // ========================================

    // Recursively duplicate children
    private async duplicateChildren(
        oldParentId: string,
        newParentId: string,
        workspaceId: string,
    ): Promise<void> {
        const children = await this.documentRepository.find({
            where: { parentId: oldParentId, workspaceId },
            order: { orderIndex: 'ASC' },
        });

        for (const child of children) {
            const duplicatedChild = this.documentRepository.create({
                title: child.title,
                workspaceId: child.workspaceId,
                parentId: newParentId,
                orderIndex: child.orderIndex,
                version: child.version,
                authorId: child.authorId,
            });
            await this.documentRepository.save(duplicatedChild);

            await this.duplicateChildren(child.id, duplicatedChild.id, workspaceId);
            await this.duplicateYjsContent(child.id, duplicatedChild.id);
        }
    }

    // Copy YJS collaborative editing data
    private async duplicateYjsContent(
        oldDocId: string,
        newDocId: string,
    ): Promise<void> {
        const oldYjsDoc = await this.yjsDocumentRepository.findOne({
            where: { documentId: oldDocId },
        });

        if (oldYjsDoc) {
            const newYjsDoc = this.yjsDocumentRepository.create({
                documentId: newDocId,
                state: oldYjsDoc.state,
                clock: 0,
                clockUpdatedAt: new Date(),
            });
            await this.yjsDocumentRepository.save(newYjsDoc);
        }
    }

    // Duplicate document and all its children
    // Inserts right after original
    // Adds " copy" to title
    async duplicateDocument(
        id: string,
        workspaceId: string,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const original = await this.documentRepository.findOne({
                where: { id, workspaceId },
            });

            if (!original) {
                throw new NotFoundException('Document not found');
            }

            const orderIndex = original.orderIndex + 1;

            await this.shiftDocumentsDown(workspaceId, original.parentId, orderIndex);

            const duplicatedTitle = original.title === ''
                ? ''
                : `${original.title} copy`;

            const duplicate = this.documentRepository.create({
                title: duplicatedTitle,
                workspaceId,
                parentId: original.parentId,
                version: original.version,
                orderIndex,
                authorId: original.authorId,
            });
            await this.documentRepository.save(duplicate);

            // Duplicate entire tree
            await this.duplicateChildren(original.id, duplicate.id, workspaceId);

            // Copy content
            await this.duplicateYjsContent(original.id, duplicate.id);

            return duplicate;
        });
    }
}