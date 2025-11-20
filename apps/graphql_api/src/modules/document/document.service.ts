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
import { DeleteDocumentInput, DuplicateDocumentInput, RestoreDocumentInput, UpdateDocumentInput } from './dto/document.dto';

@Injectable()
export class DocumentService {
  [x: string]: any;
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) {}


  private toGraphQLDocument(entity: DocumentEntity): Document {
    return toGraphQLDocumentUtils(entity);
  }

  async getDocument(documentId: string, workspaceId: string): Promise<Document> {
    const entity = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!entity) {
      throw new ValidationException(ErrorCode.E003, `Document ${documentId} not found`);
    }

    return this.toGraphQLDocument(entity);
  }

  async getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
    const entity = await this.documentRepository.find({
      where: { workspaceId },
    });
    let documents =  entity.map(doc => this.toGraphQLDocument(doc));
    return documents
  }

  async updateDocument(
    documentId: string,
    workspaceId: string,
    input: UpdateDocumentInput,
  ): Promise<Document> {

    const entity = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });
  
    if (!entity) {
      throw new ValidationException(ErrorCode.E003);
    }
  
    entity.title = input.title ?? "";
  
    if (input.relations) {
      entity.parentId = input.relations.parentId ?? null;
      entity.orderIndex = input.relations.orderIndex;
    }
  
    await this.documentRepository.save(entity);
    return this.toGraphQLDocument(entity);
  }
  
  async deleteDocument(
   input : DeleteDocumentInput
  ): Promise<Document> {
    const {documentId, workspaceId, isPermanent} = input;

    const entity = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId },
    });

    if (!entity) {
      throw new ValidationException(ErrorCode.E003);
    }

    if (isPermanent) {
      await this.documentRepository.softRemove(entity);
    } else {
      entity.deletedAt = new Date();
      await this.documentRepository.save(entity);
    }

    return this.toGraphQLDocument(entity);
  }


  async restoreDocument(
    input: RestoreDocumentInput
  ): Promise<Document> {
    const { documentId, workspaceId} = input;
    const entity = await this.documentRepository.findOne({
      where: { id: documentId, workspaceId, deletedAt: Not(null) },
      withDeleted: true,
    });

    if (!entity) {
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
}
