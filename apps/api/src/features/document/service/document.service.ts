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
import { Doc, encodeStateAsUpdate } from 'yjs';
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
    const document = await this.documentTreeService.createDocument(
      workspaceId,
      userId,
      input.title ?? '',
      input.parentId ?? null,
      input.orderIndex ?? -1,
      1,
    );

    return Document.fromEntity(document);
  }

  // ========================================
  // UPDATE - Uses tree service for position changes
  // ========================================
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
        // USE TREE SERVICE FOR MOVE
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
      // USE TREE SERVICE FOR TITLE UPDATE
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
    return Document.fromEntity(updatedDocument);
  }

  // ========================================
  // DELETE - Uses tree service
  // ========================================
  async deleteDocument(input: DeleteDocumentInput): Promise<Document> {
    const { documentId, workspaceId, isPermanent } = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    // USE TREE SERVICE (handles children + order cleanup)
    const deletedDocument = await this.documentTreeService.deleteDocument(
      documentId,
      workspaceId,
      !isPermanent, // softDelete = !isPermanent
    );

    return Document.fromEntity(deletedDocument);
  }

  // ========================================
  // RESTORE - Uses tree service
  // ========================================
  async restoreDocument(input: RestoreDocumentInput): Promise<Document> {
    const { documentId, workspaceId } = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: Not(null) },
      withDeleted: true,
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    // USE TREE SERVICE (handles children restoration)
    const restoredDocument = await this.documentTreeService.restoreDocument(
      documentId,
      workspaceId,
    );

    return Document.fromEntity(restoredDocument);
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

    // USE TREE SERVICE (handles children + YJS duplication)
    const duplicatedDocument = await this.documentTreeService.duplicateDocument(
      documentId,
      workspaceId,
    );

    return Document.fromEntity(duplicatedDocument);
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

    return Document.fromEntity(document);
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

    return Document.fromEntity(document);
  }
}