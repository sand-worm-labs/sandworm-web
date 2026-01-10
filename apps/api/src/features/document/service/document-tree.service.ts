import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity, YjsDocumentEntity } from '@sandworm/postgresql-typeorm';
import PQueue from 'p-queue';
import * as dfns from 'date-fns';

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
        return queue.add(fn).catch(() => null);
    }

    async upsertDocument(
        id: string,
        title: string,
        workspaceId: string,
        parentId: string | null,
        orderIndex: number,
        version: number,
    ): Promise<{ created: boolean; document: DocumentEntity }> {
        return this.wrapInQueue(workspaceId, async () => {
            // Count children
            const childrenCount = await this.documentRepository.count({
                where: { workspaceId, parentId, deletedAt: null },
            });

            // Find last child
            const lastChild = await this.documentRepository.findOne({
                where: { workspaceId, parentId, deletedAt: null },
                order: { orderIndex: 'DESC' },
                select: ['orderIndex'],
            });

            // Calculate final order index
            const finalOrderIndex =
                orderIndex === -1 || orderIndex > childrenCount
                    ? (lastChild?.orderIndex ?? childrenCount - 1) + 1
                    : orderIndex;

            // Shift existing documents
            await this.documentRepository
                .createQueryBuilder()
                .update(DocumentEntity)
                .set({ orderIndex: () => '"orderIndex" + 1' })
                .where('workspaceId = :workspaceId', { workspaceId })
                .andWhere(
                    parentId !== null ? 'parentId = :parentId' : 'parentId IS NULL',
                    parentId !== null ? { parentId } : {},
                )
                .andWhere('orderIndex >= :finalOrderIndex', { finalOrderIndex })
                .execute();

            // Check if document exists
            const existing = await this.documentRepository.findOne({
                where: { id, workspaceId },
            });

            let document: DocumentEntity;

            if (existing) {
                // Update existing
                existing.title = title;
                existing.parentId = parentId;
                existing.orderIndex = finalOrderIndex;
                document = await this.documentRepository.save(existing);
            } else {
                // Create new
                document = this.documentRepository.create({
                    id,
                    title,
                    workspaceId,
                    parentId,
                    orderIndex: finalOrderIndex,
                    version,
                });
                document = await this.documentRepository.save(document);
            }

            return {
                created: dfns.isEqual(document.createdAt, document.updatedAt),
                document,
            };
        });
    }

    async moveDocument(
        id: string,
        workspaceId: string,
        newParentId: string | null,
        newOrderIndex: number,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const documentToUpdate = await this.documentRepository.findOne({
                where: { id, workspaceId },
            });

            if (!documentToUpdate) {
                throw new NotFoundException('Document not found');
            }

            const oldParentId = documentToUpdate.parentId;
            const oldOrderIndex = documentToUpdate.orderIndex;

            // Calculate new order index
            const childrenCount = await this.documentRepository.count({
                where: { workspaceId, parentId: newParentId, deletedAt: null },
            });

            if (newOrderIndex === -1 || newOrderIndex > childrenCount) {
                newOrderIndex = childrenCount;
            }

            // Make space in new location
            await this.documentRepository
                .createQueryBuilder()
                .update(DocumentEntity)
                .set({ orderIndex: () => '"orderIndex" + 1' })
                .where('workspaceId = :workspaceId', { workspaceId })
                .andWhere(
                    newParentId !== null ? 'parentId = :parentId' : 'parentId IS NULL',
                    newParentId !== null ? { parentId: newParentId } : {},
                )
                .andWhere('orderIndex >= :newOrderIndex', { newOrderIndex })
                .execute();

            // Update document
            documentToUpdate.parentId = newParentId;
            documentToUpdate.orderIndex = newOrderIndex;
            const document = await this.documentRepository.save(documentToUpdate);

            // Close gap in old location
            if (oldParentId !== newParentId || oldOrderIndex > newOrderIndex) {
                await this.documentRepository
                    .createQueryBuilder()
                    .update(DocumentEntity)
                    .set({ orderIndex: () => '"orderIndex" - 1' })
                    .where('workspaceId = :workspaceId', { workspaceId })
                    .andWhere(
                        oldParentId !== null
                            ? 'parentId = :parentId'
                            : 'parentId IS NULL',
                        oldParentId !== null ? { parentId: oldParentId } : {},
                    )
                    .andWhere('orderIndex > :oldOrderIndex', { oldOrderIndex })
                    .execute();
            }

            return document;
        });
    }

    private async restoreChildrenRecursive(
        parentId: string,
        workspaceId: string,
    ): Promise<void> {
        // Restore immediate children
        await this.documentRepository
            .createQueryBuilder()
            .update(DocumentEntity)
            .set({ deletedAt: null })
            .where('parentId = :parentId', { parentId })
            .andWhere('workspaceId = :workspaceId', { workspaceId })
            .execute();

        // Get children to restore their descendants
        const children = await this.documentRepository.find({
            where: { parentId, workspaceId },
            select: ['id'],
        });

        for (const child of children) {
            await this.restoreChildrenRecursive(child.id, workspaceId);
        }
    }

    async restoreDocument(
        id: string,
        workspaceId: string,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const documentToRestore = await this.documentRepository.findOne({
                where: { id, workspaceId },
                relations: ['parent'],
                withDeleted: true,
            });

            if (!documentToRestore || !documentToRestore.deletedAt) {
                throw new NotFoundException('Deleted document not found');
            }

            let parent = documentToRestore.parent;
            if (parent?.deletedAt) {
                parent = null;
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

            // Restore document
            documentToRestore.parentId = parent?.id ?? null;
            documentToRestore.deletedAt = null;
            documentToRestore.orderIndex = newOrderIndex;
            const document = await this.documentRepository.save(documentToRestore);

            // Restore children
            await this.restoreChildrenRecursive(document.id, workspaceId);

            return document;
        });
    }

    private async softDeleteChildrenRecursive(
        parentId: string,
        workspaceId: string,
        deletedAt: Date,
    ): Promise<void> {
        // Soft delete immediate children
        await this.documentRepository
            .createQueryBuilder()
            .update(DocumentEntity)
            .set({ deletedAt })
            .where('parentId = :parentId', { parentId })
            .andWhere('workspaceId = :workspaceId', { workspaceId })
            .execute();

        // Get children to soft delete their descendants
        const children = await this.documentRepository.find({
            where: { parentId, workspaceId },
            select: ['id'],
        });

        for (const child of children) {
            await this.softDeleteChildrenRecursive(child.id, workspaceId, deletedAt);
        }
    }

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

            if (!softDelete) {
                // Hard delete
                if (!document.deletedAt) {
                    // Adjust sibling order indices
                    await this.documentRepository
                        .createQueryBuilder()
                        .update(DocumentEntity)
                        .set({ orderIndex: () => '"orderIndex" - 1' })
                        .where(
                            document.parentId !== null
                                ? 'parentId = :parentId'
                                : 'parentId IS NULL',
                            document.parentId !== null
                                ? { parentId: document.parentId }
                                : {},
                        )
                        .andWhere('orderIndex > :orderIndex', {
                            orderIndex: document.orderIndex,
                        })
                        .andWhere('workspaceId = :workspaceId', { workspaceId })
                        .execute();
                }

                await this.documentRepository.remove(document);
                return document;
            }

            // Soft delete
            const deletedAt = new Date();
            document.deletedAt = deletedAt;
            await this.documentRepository.save(document);

            // Soft delete children
            await this.softDeleteChildrenRecursive(id, workspaceId, deletedAt);

            // Adjust sibling order indices
            await this.documentRepository
                .createQueryBuilder()
                .update(DocumentEntity)
                .set({ orderIndex: () => '"orderIndex" - 1' })
                .where(
                    document.parentId !== null
                        ? 'parentId = :parentId'
                        : 'parentId IS NULL',
                    document.parentId !== null ? { parentId: document.parentId } : {},
                )
                .andWhere('orderIndex > :orderIndex', {
                    orderIndex: document.orderIndex,
                })
                .andWhere('workspaceId = :workspaceId', { workspaceId })
                .execute();

            return document;
        });
    }

    private getDuplicatedTitle(prevTitle: string): string {
        return prevTitle === '' ? '' : `${prevTitle} copy`;
    }

    async duplicateDocument(
        id: string,
        workspaceId: string,
    ): Promise<DocumentEntity> {
        return this.wrapInQueue(workspaceId, async () => {
            const documentToDuplicate = await this.documentRepository.findOne({
                where: { id, workspaceId },
            });

            if (!documentToDuplicate) {
                throw new NotFoundException('Document not found');
            }

            const orderIndex = documentToDuplicate.orderIndex + 1;

            // Make space for duplicated document
            await this.documentRepository
                .createQueryBuilder()
                .update(DocumentEntity)
                .set({ orderIndex: () => '"orderIndex" + 1' })
                .where(
                    documentToDuplicate.parentId !== null
                        ? 'parentId = :parentId'
                        : 'parentId IS NULL',
                    documentToDuplicate.parentId !== null
                        ? { parentId: documentToDuplicate.parentId }
                        : {},
                )
                .andWhere('workspaceId = :workspaceId', { workspaceId })
                .andWhere('orderIndex >= :orderIndex', { orderIndex })
                .execute();

            // Create duplicated document
            const duplicatedTitle = this.getDuplicatedTitle(
                documentToDuplicate.title,
            );
            const duplicatedDocument = this.documentRepository.create({
                title: duplicatedTitle,
                workspaceId,
                parentId: documentToDuplicate.parentId,
                version: documentToDuplicate.version,
                orderIndex
            });
            await this.documentRepository.save(duplicatedDocument);

            // Duplicate children recursively
            const parentsToDuplicateChildren: {
                old: DocumentEntity;
                new: DocumentEntity;
            }[] = [{ old: documentToDuplicate, new: duplicatedDocument }];

            while (parentsToDuplicateChildren.length > 0) {
                const currentParent = parentsToDuplicateChildren.pop()!;

                const children = await this.documentRepository.find({
                    where: { parentId: currentParent.old.id, workspaceId },
                });

                for (const child of children) {
                    const duplicatedChild = this.documentRepository.create({
                        title: child.title,
                        workspaceId: child.workspaceId,
                        parentId: currentParent.new.id,
                        orderIndex: child.orderIndex,
                        version: child.version,
                    });
                    await this.documentRepository.save(duplicatedChild);
                    parentsToDuplicateChildren.push({
                        old: child,
                        new: duplicatedChild,
                    });
                }

                // Duplicate YJS document content
                await this.duplicateYjsDocumentContent(currentParent.old, currentParent.new);
            }

            return duplicatedDocument;
        });
    }

    private async duplicateYjsDocumentContent(
        oldDoc: DocumentEntity,
        newDoc: DocumentEntity,
    ): Promise<void> {
        const oldYjsDoc = await this.yjsDocumentRepository.findOne({
            where: { documentId: oldDoc.id },
        });

        if (oldYjsDoc) {
            const newYjsDoc = this.yjsDocumentRepository.create({
                documentId: newDoc.id,
                state: oldYjsDoc.state,
                clock: 0,
                clockUpdatedAt: new Date(),
            });
            await this.yjsDocumentRepository.save(newYjsDoc);
        }
    }
}