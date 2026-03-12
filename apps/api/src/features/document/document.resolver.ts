import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from '@sandworm/graphql';
import { DocumentService } from './service/document.service';
import { Document } from './model/document.model';
import {
  UpdateDocumentInput,
  CreateDocumentInput,
  DeleteDocumentInput,
  RestoreDocumentInput,
  DuplicateDocumentInput,
  FavoriteDocumentInput,
} from './dto/document.dto';
import { DocumentTreeService } from './service/document-tree.service';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService, 
    private readonly documentTreeService: DocumentTreeService
  ) { }

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
    name: 'getFavoriteDocuments',
    description: 'Get User favorite documents',
  })
  async getFavoriteDocuments(
    @Args('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ): Promise<Document[]> {
    return this.documentService.getFavoriteDocuments(userId, workspaceId);
  }

  @Query(() => [Document], {
    name: 'getWorkspaceDocuments',
    description: 'Get all documents in a workspace',
  })
  async getWorkspaceDocuments(
    @Args('workspaceId') workspaceId: string,
  ): Promise<Document[]> {
    return this.documentTreeService.getWorkspaceDocuments(workspaceId);
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

  @Mutation(() => Boolean, {
    name: 'deleteDocument',
    description: 'Soft delete or permanently delete a document',
  })
  async deleteDocument(
    @Args('input') input: DeleteDocumentInput,
  ): Promise<Boolean> {
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
    @CurrentUser('id') userId: string,
  ): Promise<Document> {
    return this.documentService.duplicateDocument(userId, input);
  }

  @Mutation(() => Document, {
    name: 'addFavoriteDocument',
    description: 'Mark a document as a favorite',
  })
  async addFavoriteDocument(
    @Args('input') input: FavoriteDocumentInput,
    @CurrentUser('id') userId: string,
  ): Promise<Document> {
    return this.documentService.addFavoriteDocument(userId, input);
  }

  @Mutation(() => Document, {
    name: 'removeFavoriteDocument',
    description: 'Unmark a document as a favorite',
  })
  async removeFavoriteDocument(
    @Args('input') input: FavoriteDocumentInput,
    @CurrentUser('id') userId: string,
  ): Promise<Document> {
    return this.documentService.removeFavoriteDocument(userId, input);
  }

  @Mutation(() => Document, {
    name: 'publishDocument',
    description: 'Publish a document',
  })
  async publishDocument(
    @Args('workspaceId') workspaceId: string,
    @Args('documentId') documentId: string,
  ): Promise<Document> {
    return this.documentService.publishDocument(documentId, workspaceId);
  }

  @Mutation(() => Document, {
    name: 'unpublishDocument',
    description: 'Unpublish a document',
  })
  async unpublishDocument(
    @Args('workspaceId') workspaceId: string,
    @Args('documentId') documentId: string,
  ): Promise<Document> {
    return this.documentService.unpublishDocument(documentId, workspaceId);
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