import { ErrorCode } from '@/constants/error-code.constant';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidationException } from '@sandworm/graphql';
import {
  DocumentEntity,
} from '@sandworm/postgresql-typeorm';
import { Not, Repository } from 'typeorm';
import { Document } from './model/document.model';
import { toGraphQLDocumentUtils } from '@/utils/models';
import { DeleteDocumentInput, DuplicateDocumentInput, FavoriteDocumentInput, RestoreDocumentInput, UpdateDocumentInput } from './dto/document.dto';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}


  private toGraphQLDocument(entity: DocumentEntity): Document {
    return toGraphQLDocumentUtils(entity);
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

    entity.deletedAt = null;
    await this.documentRepository.save(entity);

    return this.toGraphQLDocument(entity);
  }

  async duplicateDocument(
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
      title: `${original.title} Fork`,
    });

    await this.documentRepository.save(duplicate);

    return this.toGraphQLDocument(duplicate);
  }

  async addFavoriteDocument(
    input: FavoriteDocumentInput
 ): Promise<Document> {
  const {documentId, workspaceId} = input;
  const document = await this.documentRepository.findOne({
    where: { id: documentId, workspaceId, deletedAt: null },
  });

 }
}
