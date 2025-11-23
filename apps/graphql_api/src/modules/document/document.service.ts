import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import {
  DocumentEntity,
  FavoriteEntity
} from '@sandworm/postgresql-typeorm';
import { Not, Repository } from 'typeorm';
import { Document } from './model/document.model';
import { DeleteDocumentInput, DuplicateDocumentInput, FavoriteDocumentInput, RestoreDocumentInput, UpdateDocumentInput, CreateDocumentInput } from './dto/document.dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(FavoriteEntity)
    private readonly favoriteRepository: Repository<FavoriteEntity>,
  ) {}


  private toGraphQLDocument(entity: DocumentEntity): Document {
    return {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      authorId: entity.authorId,
      workspaceId: entity.workspaceId,
      parentId: entity.parentId ?? null,
      runUnexecutedBlocks: entity.runUnexecutedBlocks,
      runSQLSelection: entity.runSQLSelection,
      shareLinksWithoutSidebar: entity.shareLinksWithoutSidebar,
    }
  }

  async getDocument(documentId: string, workspaceId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003, `Document ${documentId} not found`);
    }

    return this.toGraphQLDocument(document);
  }

  async getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
    const  documents_list = await this.documentRepository.find({
      where: { workspaceId },
    });
    let documents =  documents_list.map(doc => this.toGraphQLDocument(doc));
    return documents
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
  
    document.title = input.title ?? "";
  
    if (input.relations) {
      document.parentId = input.relations.parentId ?? null;
      document.orderIndex = input.relations.orderIndex;
    }
  
    await this.documentRepository.save(document);
    return this.toGraphQLDocument(document);
  }
  
  async deleteDocument(
   input : DeleteDocumentInput
  ): Promise<Document> {
    const {documentId, workspaceId, isPermanent} = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    if (isPermanent) {
      await this.documentRepository.softRemove(document);
    } else {
      document.deletedAt = new Date();
      await this.documentRepository.save(document);
    }

    return this.toGraphQLDocument(document);
  }


  async restoreDocument(
    input: RestoreDocumentInput
  ): Promise<Document> {
    const { documentId, workspaceId} = input;
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: Not(null) },
      withDeleted: true,
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    document.deletedAt = null;
    await this.documentRepository.save(document);

    return this.toGraphQLDocument(document);
  }

  async duplicateDocument(
      userId: string,
     input: DuplicateDocumentInput
  ): Promise<Document> {
    const {documentId, workspaceId} = input;
    const original = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: null },
    });

    if (!original) {
      throw new ValidationException(ErrorCode.E003);
    }

    const duplicate = this.documentRepository.create({
      ...original,
      id: undefined,
      authorId: userId,
      title: `${original.title} Fork`,
    });

    await this.documentRepository.save(duplicate);

    return this.toGraphQLDocument(duplicate);
  }

  async createDocument(
    workspaceId: string,
    userId: string,
    input: CreateDocumentInput
  ): Promise<Document> {
    const document = this.documentRepository.create({
      ...input,
      workspaceId,
      authorId: userId,
    });
    try {
      await this.documentRepository.save(document);
    } catch (err) {
      throw new ValidationException(ErrorCode.E005);
    }
    return this.toGraphQLDocument(document);
  }

  async addFavoriteDocument(
      userId: string,
      input: FavoriteDocumentInput
  ): Promise<Document> {
    const {documentId, workspaceId} = input;
    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: null },
    });
    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    const favoriteDocument =  this.favoriteRepository.create({
      userId,
      documentId,
    });

    await this.favoriteRepository.save(favoriteDocument);
    return this.toGraphQLDocument(document);
  }

  async removeFavoriteDocument(
    userId: string,
    input: FavoriteDocumentInput
  ): Promise<Document> {
    const { documentId, workspaceId } = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: null },
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }
    let favoriteDocument = await this.favoriteRepository.findOne({
      where: {
        userId,
        documentId,
      },
    });

    if (!favoriteDocument) {
      throw new ValidationException(ErrorCode.E003);
    }

    await this.favoriteRepository.delete({
      userId,
      documentId,
    });

    return this.toGraphQLDocument(document);
  }

  async getChildren(
    parentId: string
  ): Promise<Document[]> {
    const documents = await this.documentRepository.find({
      where: { parentId, deletedAt: null },
    });
    return  documents.map(document => this.toGraphQLDocument(document));
  }
}
