import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import {
  DocumentEntity,
  FavoriteEntity,
  YjsDocumentEntity,
} from '@sandworm/postgresql-typeorm';
import { Not, Repository, In } from 'typeorm';
import {
  CreateDocumentInput,
  DeleteDocumentInput,
  DuplicateDocumentInput,
  FavoriteDocumentInput,
  RestoreDocumentInput,
  UpdateDocumentInput,
} from '../dto/document.dto';
import { Document } from '../model/document.model';
import { DocumentTreeService } from './document-tree.service';
import { EventEmitter2, EventEmitterReadinessWatcher } from '@nestjs/event-emitter';
import {
  WorkspaceDocumentsEvent,
  DocumentUpdateEvent,
  EventNames
} from '@/core/events/document.events';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(FavoriteEntity)
    private readonly favoriteRepository: Repository<FavoriteEntity>,
    @InjectRepository(YjsDocumentEntity)
    private readonly yjsDocumentRepository: Repository<YjsDocumentEntity>,
    private readonly documentTreeService: DocumentTreeService,
    private readonly eventEmitter: EventEmitter2,
    private readonly eventEmitterReadinessWatcher: EventEmitterReadinessWatcher,
  ) { }

  async getDocument(
    documentId: string,
    workspaceId: string,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    return Document.fromEntity(document);
  }

  async getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
    const documents = await this.documentRepository.find({
      where: { workspaceId },
    });

    return Document.fromEntities(documents);
  }

  async getChildren(parentId: string): Promise<Document[]> {
    const documents = await this.documentRepository.find({
      where: { parentId, deletedAt: null },
      order: { orderIndex: 'ASC' },
    });

    return Document.fromEntities(documents);
  }

  async createDocument(
    workspaceId: string,
    userId: string,
    input: CreateDocumentInput,
  ): Promise<Document> {
    const documentEntity = await this.documentTreeService.createDocument(
      workspaceId,
      userId,
      input.title ?? '',
      input.parentId ?? null,
      input.orderIndex ?? -1,
      1,
    );

    const document = Document.fromEntity(documentEntity);

    // Emit events
    await this.emitDocumentUpdate(workspaceId, document);

    this.logger.log(`Document created: ${document.id} in workspace ${workspaceId}`);

    return document;
  }

  async updateDocument(
    documentId: string,
    workspaceId: string,
    input: UpdateDocumentInput,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    // Handle tree position changes
    if (input.parentId !== undefined || input.orderIndex !== undefined) {
      const newParentId = input.parentId ?? document.parentId;
      const newOrderIndex = input.orderIndex ?? document.orderIndex;

      if (newParentId !== document.parentId || newOrderIndex !== document.orderIndex) {
        await this.documentTreeService.moveDocument(
          documentId,
          workspaceId,
          newParentId,
          newOrderIndex,
        );
      }
    }

    // Handle title update
    if (input.title !== undefined && input.title !== document.title) {
      await this.documentTreeService.updateDocument(
        documentId,
        workspaceId,
        input.title,
      );
    }

    // Reload to get tree service changes
    const updatedDocument = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!updatedDocument) {
      throw new ValidationException(ErrorCode.E003);
    }

    // Update non-tree fields directly
    if (input.runUnexecutedBlocks !== undefined) {
      updatedDocument.runUnexecutedBlocks = input.runUnexecutedBlocks;
    }
    if (input.runSQLSelection !== undefined) {
      updatedDocument.runSQLSelection = input.runSQLSelection;
    }
    if (input.shareLinksWithoutSidebar !== undefined) {
      updatedDocument.shareLinksWithoutSidebar = input.shareLinksWithoutSidebar;
    }

    await this.documentRepository.save(updatedDocument);

    const result = Document.fromEntity(updatedDocument);

    // Emit events
    await this.emitDocumentUpdate(workspaceId, result);

    this.logger.log(`Document updated: ${documentId}`);

    return result;
  }

  async deleteDocument(input: DeleteDocumentInput): Promise<boolean> {
    const { documentId, workspaceId, isPermanent } = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    this.logger.log(`Document deleted: ${documentId} (permanent: ${isPermanent})`, document);

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    await this.documentTreeService.deleteDocument(
      documentId,
      workspaceId,
      !isPermanent, // softDelete = !isPermanent
    );

    // Emit events
    await this.emitWorkspaceDocuments(workspaceId);

    this.logger.log(`Document deleted: ${documentId} (permanent: ${isPermanent})`);

    return true;
  }

  async restoreDocument(input: RestoreDocumentInput): Promise<Document> {
    const { documentId, workspaceId } = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
      withDeleted: true,
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    const restoredDocument = await this.documentTreeService.restoreDocument(
      documentId,
      workspaceId,
    );

    const result = Document.fromEntity(restoredDocument);

    // Emit events
    await this.emitWorkspaceDocuments(workspaceId);

    this.logger.log(`Document restored: ${documentId}`);

    return result;
  }

  async duplicateDocument(
    userId: string,
    input: DuplicateDocumentInput,
  ): Promise<Document> {
    const { documentId, workspaceId } = input;

    const original = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: null },
    });

    if (!original) {
      throw new ValidationException(ErrorCode.E003);
    }

    const duplicatedDocument = await this.documentTreeService.duplicateDocument(
      documentId,
      workspaceId,
    );

    const result = Document.fromEntity(duplicatedDocument);

    // Emit events
    await this.emitWorkspaceDocuments(workspaceId);

    this.logger.log(`Document duplicated: ${documentId} -> ${result.id}`);

    return result;
  }

  async addFavoriteDocument(
    userId: string,
    input: FavoriteDocumentInput,
  ): Promise<Document> {
    const { documentId, workspaceId } = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: null },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    const favorite = this.favoriteRepository.create({
      userId,
      documentId,
    });

    await this.favoriteRepository.save(favorite);

    this.logger.log(`Document favorited: ${documentId} by user ${userId}`);

    return Document.fromEntity(document);
  }

  async getFavoriteDocuments(userId: string, workspaceId: string): Promise<Document[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
    });

    const documentIds = favorites.map((fav) => fav.documentId);
    if (documentIds.length === 0) {
      return [];
    }

    const documents = await this.documentRepository.find({
      where: {
        id: In(documentIds),
        workspaceId,
        deletedAt: null,
      },
    });

    return Document.fromEntities(documents);
  }

  async removeFavoriteDocument(
    userId: string,
    input: FavoriteDocumentInput,
  ): Promise<Document> {
    const { documentId, workspaceId } = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: null },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    const favorite = await this.favoriteRepository.findOne({
      where: { userId, documentId },
    });

    if (!favorite) {
      throw new ValidationException(ErrorCode.E004);
    }

    await this.favoriteRepository.delete({ userId, documentId });

    this.logger.log(`Document unfavorited: ${documentId} by user ${userId}`);

    return Document.fromEntity(document);
  }

  async publishDocument(
    documentId: string,
    workspaceId: string,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    document.publishedAt = new Date();
    await this.documentRepository.save(document);

    const result = Document.fromEntity(document);

    // Emit events
    await this.emitDocumentUpdate(workspaceId, result);

    this.logger.log(`Document published: ${documentId}`);

    return result;
  }

  async unpublishDocument(
    documentId: string,
    workspaceId: string,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    document.publishedAt = null;
    await this.documentRepository.save(document);

    const result = Document.fromEntity(document);

    // Emit events
    await this.emitDocumentUpdate(workspaceId, result);

    this.logger.log(`Document unpublished: ${documentId}`);

    return result;
  }

  // ========================================
  // Event Emission Helpers
  // ========================================
  private async emitDocumentUpdate(workspaceId: string, document: Document): Promise<void> {
    await this.eventEmitterReadinessWatcher.waitUntilReady();

    this.eventEmitter.emit(
      EventNames.DOCUMENT_UPDATE,
      new DocumentUpdateEvent(workspaceId, document),
    );
  }

  private async emitWorkspaceDocuments(workspaceId: string): Promise<void> {
    await this.eventEmitterReadinessWatcher.waitUntilReady();

    const documents = await this.getWorkspaceDocuments(workspaceId);

    this.eventEmitter.emit(
      EventNames.WORKSPACE_DOCUMENTS,
      new WorkspaceDocumentsEvent(workspaceId, documents),
    );
  }
}