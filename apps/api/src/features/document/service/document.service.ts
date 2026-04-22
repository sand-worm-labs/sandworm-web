import { ErrorCode } from '@/constants/error-code.constant';
import {  Injectable, Logger } from '@nestjs/common';
import { ValidationException } from '@sandworm/graphql';
import {
  DocumentEntity,
  FavoriteEntity,
  YjsDocumentEntity,
  DocumentVisibility,
  DocumentForkEntity,
} from '@sandworm/postgresql-typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { YjsDocumentService } from "@/features/collaboration/yjs/yjs-document.service"
import {
  CreateDocumentInput,
  DeleteDocumentInput,
  DuplicateDocumentInput,
  FavoriteDocumentInput,
  RestoreDocumentInput,
  UpdateDocumentInput,
  ForkDocumentInput
} from '../dto/document.dto';
import { Document } from '../model/document.model';
import { DocumentTreeService } from './document-tree.service';


@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(FavoriteEntity)
    private readonly favoriteRepository: Repository<FavoriteEntity>,
    @InjectRepository(DocumentForkEntity)
    private readonly forkRepository: Repository<DocumentForkEntity>,
    @InjectRepository(YjsDocumentEntity)
    private readonly yjsDocumentRepository: Repository<YjsDocumentEntity>,
    private readonly documentTreeService: DocumentTreeService,
    private readonly yjsDocumentService: YjsDocumentService
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
    await this.documentTreeService.emitDocumentUpdate(workspaceId, document);
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
      await this.documentTreeService.updateDocumentTitle(
        documentId,
        workspaceId,
        input.title,
      );
    }
    const updatedDocument = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!updatedDocument) {
      throw new ValidationException(ErrorCode.E003);
    }

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
    await this.documentTreeService.emitDocumentUpdate(workspaceId, result);
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
    await this.documentTreeService.emitWorkspaceDocuments(workspaceId);
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
    await this.documentTreeService.emitWorkspaceDocuments(workspaceId);
    return result;
  }

  async duplicateDocument(
    userId: string,
    input: DuplicateDocumentInput,
  ): Promise<Document> {
    const { documentId, workspaceId } = input;

    const duplicated = await this.dataSource.transaction(async (m) => {
      const repo = m.getRepository(DocumentEntity);

      const original = await repo.findOne({
        where: { id: documentId, workspaceId, deletedAt: null },
      });
      if (!original) throw new ValidationException(ErrorCode.E003);

      return this.documentTreeService.duplicateDocument(documentId, workspaceId, userId, m);
    });

    const result = Document.fromEntity(duplicated);
    await this.documentTreeService.emitWorkspaceDocuments(workspaceId);
    return result;
  }

  async addFavoriteDocument(
    userId: string,
    input: FavoriteDocumentInput,
    public_document = false,
  ): Promise<Document> {
    const { documentId, workspaceId } = input;
    let document: DocumentEntity | null = null;

    if(public_document) {
      document = await this.documentRepository.findOne({
        where: { id: documentId, visibility: DocumentVisibility.PUBLIC, deletedAt: null },
      });
    }
    else {
      document = await this.documentRepository.findOne({
        where: { id: documentId, workspaceId, deletedAt: null },
      });
    }

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

  

  async forkDocument(
    userId: string,
    input: ForkDocumentInput,
  ): Promise<Document> {
    const { documentId, targetWorkspaceId } = input;

    const forked = await this.dataSource.transaction(async (m) => {
      const docRepo = m.getRepository(DocumentEntity);
      const forkRepo = m.getRepository(DocumentForkEntity);

      const original = await docRepo.findOne({
        where: { id: documentId, deletedAt: null },
      });
      if (!original) throw new ValidationException(ErrorCode.E003);

      // source must be published — you don't want a document that is not public
      if (original.visibility  !== DocumentVisibility.PUBLIC) {
        throw new ValidationException(ErrorCode.E003);
      }

      const duplicated = await this.documentTreeService.duplicateDocument(
        documentId,
        targetWorkspaceId,
        userId,
        m,
      );

      await forkRepo.save(
        forkRepo.create({
          sourceDocumentId: documentId,
          forkedDocumentId: duplicated.id,
          userId,
        }),
      );

      return duplicated;
    });

    const result = Document.fromEntity(forked);
    await this.documentTreeService.emitWorkspaceDocuments(targetWorkspaceId);
    return result;
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

  private async generateUniqueSlug(title: string, documentId: string): Promise<string> {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'notebook';

    const suffix = documentId.slice(0, 8);
    const candidate = `${base}-${suffix}`;

    const existing = await this.documentRepository.findOne({
      where: { publishedSlug: candidate },
    });

    return existing ? `${candidate}-${Date.now()}` : candidate;
  }

  async publishDocument(
    documentId: string,
    workspaceId: string,
  ): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) throw new ValidationException(ErrorCode.E003);
    const yjsDoc = await this.yjsDocumentRepository.findOne({
      where: { documentId },
    });

    if (!yjsDoc) throw new ValidationException(ErrorCode.E003);

    if (!document.publishedSlug) {
      document.publishedSlug = await this.generateUniqueSlug(document.title, documentId);
    }

    document.publishedAt = new Date();
    document.visibility = DocumentVisibility.PUBLIC;

    await this.documentRepository.save(document);

    const result = Document.fromEntity(document);
    await this.documentTreeService.emitDocumentUpdate(workspaceId, result);
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
    document.visibility = DocumentVisibility.WORKSPACE;

    await this.documentRepository.save(document);

    const result = Document.fromEntity(document);
    await this.documentTreeService.emitDocumentUpdate(workspaceId, result);
    return result;
  }

  async getExploreDocuments(limit = 20, offset = 0,): Promise<Document[]> {
    const documents = await this.documentRepository.find({
      where: {
        visibility: DocumentVisibility.PUBLIC,
        deletedAt: null,
      },
      order: { publishedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return documents.map(Document.fromEntity);
  }

  async getFavoriteExploreDocuments(userId: string, limit = 20, offset = 0): Promise<Document[]> {
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
        visibility: DocumentVisibility.PUBLIC,
        deletedAt: null,
      },
      order: { publishedAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return Document.fromEntities(documents);
  }

  async getFeaturedDocuments(limit = 4): Promise<Document[]> {
    const documents = await this.documentRepository.find({
      where: {
        visibility: DocumentVisibility.PUBLIC,
        deletedAt: null,
        featuredDocument: true,
      },
      order: { publishedAt: 'DESC' },
      take: limit,
    });

    return documents.map(Document.fromEntity);
  }

  async getForkedDocuments(userId: string, limit = 20, offset = 0): Promise<Document[]> {
      const forks = await this.forkRepository.find({
          where: { userId },
          relations: ['forkedDocument'],
          order: { createdAt: 'DESC' },
          take: limit,
          skip: offset,
      });

      return forks
          .map(f => f.forkedDocument)
          .filter(d => d && !d.deletedAt)
          .map(Document.fromEntity);
  }

  async getTrendingPublishedDocuments(limit = 20, offset = 0): Promise<Document[]> {
      const documents = await this.documentRepository
          .createQueryBuilder('doc')
          .leftJoin('doc.favorites', 'fav')
          .leftJoin(DocumentForkEntity, 'fork', 'fork.source_document_id = doc.id')
          .where('doc.visibility = :visibility', { visibility: DocumentVisibility.PUBLIC })
          .andWhere('doc.deletedAt IS NULL')
          .andWhere('doc.publishedAt IS NOT NULL')
          .addSelect('COUNT(DISTINCT fav.userId) + COUNT(DISTINCT fork.id) * 2', 'score')
          .groupBy('doc.id')
          .orderBy('score', 'DESC')
          .addOrderBy('doc.publishedAt', 'DESC')
          .limit(limit)
          .offset(offset)
          .getMany();

      return documents.map(Document.fromEntity);
  }

  async getPublishedDocumentBySlug(slug: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { publishedSlug: slug },
    });

    if (!document || !document.publishedAt) {
      throw new ValidationException(ErrorCode.E003);
    }

    if (document.visibility === DocumentVisibility.WORKSPACE) {
      throw new ValidationException("Document is not published", ErrorCode.E003);
    }

    return Document.fromEntity(document);
  }
}