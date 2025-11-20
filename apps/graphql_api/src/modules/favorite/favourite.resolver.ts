import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';

import { DocumentService } from './document.service';
import { Document } from './model/document.model';
import {
  UpdateDocumentInput,
  CreateDocumentInput,
  DeleteDocumentInput,
  RestoreDocumentInput,
  DuplicateDocumentInput,
} from './dto/document.dto';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(private readonly documentService: DocumentService) {}

  @Query(() => Document, {
    name: 'getDocument',
    description: 'Get a single document by ID',
  })
  async getDocument(
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
  ): Promise<Document> {
    return this.documentService.getDocument(documentId, workspaceId);
  }

  @Query(() => [Document], {
    name: 'getWorkspaceDocuments',
    description: 'Get all documents in a workspace',
  })
  async getWorkspaceDocuments(
    @Args('workspaceId') workspaceId: string,
  ): Promise<Document[]> {
    return this.documentService.getWorkspaceDocuments(workspaceId);
  }

  @Mutation(() => Document, {
    name: 'createDocument',
    description: 'Create a new document in a workspace',
  })
  async createDocument(
    @Args('workspaceId') workspaceId: string,
    @Args('input') input: CreateDocumentInput,
    @CurrentUser('id') userId: string,
  ): Promise<Document> {
    return this.documentService.createDocument(workspaceId, userId, input);
  }

  @Mutation(() => Document, {
    name: 'updateDocument',
    description: 'Update document metadata',
  })
  async updateDocument(
    @Args('documentId') documentId: string,
    @Args('workspaceId') workspaceId: string,
    @Args('input') input: UpdateDocumentInput,
  ): Promise<Document> {
    return this.documentService.updateDocument(documentId, workspaceId, input);
  }

  @Mutation(() => Document, {
    name: 'deleteDocument',
    description: 'Soft delete or permanently delete a document',
  })
  async deleteDocument(
    @Args('input') input: DeleteDocumentInput,
  ): Promise<Document> {
    return this.documentService.deleteDocument(input);
  }

  @Mutation(() => Document, {
    name: 'restoreDocument',
    description: 'Restore a previously deleted document',
  })
  async restoreDocument(
    @Args('input') input: RestoreDocumentInput,
  ): Promise<Document> {
    return this.documentService.restoreDocument(input);
  }

  @Mutation(() => Document, {
    name: 'duplicateDocument',
    description: 'Create a fork/duplicate of a document',
  })
  async duplicateDocument(
    @Args('input') input: DuplicateDocumentInput,
  ): Promise<Document> {
    return this.documentService.duplicateDocument(input);
  }

  @ResolveField(() => [Document], {
    name: 'children',
  })
  async children(@Parent() parent: Document): Promise<Document[]> {
    return this.documentService.getChildren(parent.id);
  }

  @ResolveField(() => Document, {
    name: 'parent',
    nullable: true,
  })
  async parent(@Parent() doc: Document): Promise<Document | null> {
    if (!doc.parentId) return null;
    return this.documentService.getDocument(doc.parentId, doc.workspaceId);
  }
}
