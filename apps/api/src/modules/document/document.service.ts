import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import {
  DocumentEntity,
  FavoriteEntity,
} from '@sandworm/postgresql-typeorm';
import { Not, Repository } from 'typeorm';
import { Document } from './model/document.model';
import {
  DeleteDocumentInput,
  DuplicateDocumentInput,
  FavoriteDocumentInput,
  RestoreDocumentInput,
  UpdateDocumentInput,
  CreateDocumentInput,
} from './dto/document.dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    @InjectRepository(FavoriteEntity)
    private readonly favoriteRepository: Repository<FavoriteEntity>,
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
    const documentsList = await this.documentRepository.find({
      where: { workspaceId },
    });

    return Document.fromEntities(documentsList);
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

    document.title = input.title ?? '';

    if (input.relations) {
      document.parentId = input.relations.parentId ?? null;
      document.orderIndex = input.relations.orderIndex;
    }

    await this.documentRepository.save(document);
    return Document.fromEntity(document);
  }

  async deleteDocument(input: DeleteDocumentInput): Promise<Document> {
    const { documentId, workspaceId, isPermanent } = input;

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

    return Document.fromEntity(document);
  }

  async restoreDocument(input: RestoreDocumentInput): Promise<Document> {
    const { documentId, workspaceId } = input;

    const document = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: Not(null) },
      withDeleted: true,
    });

    if (!document) {
      throw new ValidationException(ErrorCode.E003);
    }

    document.deletedAt = null;
    await this.documentRepository.save(document);

    return Document.fromEntity(document);
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

    const duplicate = this.documentRepository.create({
      ...original,
      id: undefined,
      authorId: userId,
      title: `${original.title} Fork`,
    });

    await this.documentRepository.save(duplicate);

    return Document.fromEntity(duplicate);
  }

  async createDocument(
    workspaceId: string,
    userId: string,
    input: CreateDocumentInput,
  ): Promise<Document> {
    const document = this.documentRepository.create({
      ...input,
      workspaceId,
      authorId: userId,
    });

    try {
      await this.documentRepository.save(document);
    } catch (err) {
      throw new ValidationException(ErrorCode.E006);
    }

    return Document.fromEntity(document);
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
      throw new ValidationException(ErrorCode.E004); // favorite does not exist
    }

    await this.favoriteRepository.delete({ userId, documentId });

    return Document.fromEntity(document);
  }

  async getChildren(parentId: string): Promise<Document[]> {
    const documents = await this.documentRepository.find({
      where: { parentId, deletedAt: null },
    });

    return Document.fromEntities(documents);
  }
}