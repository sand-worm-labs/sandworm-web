import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Int
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
  ForkDocumentInput,
  FavoritePublicDocumentInput,
} from './dto/document.dto';
import { DocumentTreeService } from './service/document-tree.service';
import { Public } from '@sandworm/nest-common';
import { User } from '../user/model/graphql/user.model';
import { UserService } from '../user/user.service';

@Resolver(() => Document)
export class DocumentResolver {

  constructor(
    private readonly userService: UserService,
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

  @Query(() => [Document], {
    name: "getExplorerDocuments",
    description: "Get documents in a workspace organized as a tree for explorer view",
  })
  async getExplorerDocuments(
    @Args('limit', { nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset: number,
  ): Promise<Document[]> {
    return this.documentService.getExploreDocuments(limit, offset);
  }

  @Public()
  @Query(() => [Document], {
    name: "getFeaturedDocuments",
    description: "Get featured documents for explore page",
  })
  async getFeaturedDocuments(
    @Args('limit', { nullable: true, defaultValue: 4 }) limit: number,
  ): Promise<Document[]> {
    return this.documentService.getFeaturedDocuments(limit);
  }

  @Query(() => [Document], {
    name: 'favoritePublicDocuments',
    description: 'Get User favorite public documents',
  })
  async favoritePublicDocuments(
    @CurrentUser('id') userId: string,
  ): Promise<Document[]> {
    return this.documentService.getFavoriteExploreDocuments(userId);
  }

  @Query(() => [Document], {
    name: 'getForkedDocuments',
    description: 'Get User forked documents',
  })
  async getForkedDocuments(
    @CurrentUser('id') userId: string,
  ): Promise<Document[]> {
    return this.documentService.getForkedDocuments(userId);
  }

  @Query(() => [Document], {
    name: 'getTrendingPublishedDocuments',
    description: 'Get trending published documents across all workspaces',
  })
  async getTrendingPublishedDocuments(
    @Args('limit', { nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset: number,
  ): Promise<Document[]> {
    return this.documentService.getTrendingPublishedDocuments(limit, offset);
  }

  @Query(() => [Document], {
    name: 'getUserPublicDocuments',
    description: 'Get public documents by a specific user',
  })
  async getUserPublicDocuments(
    @Args('userId') userId: string,
    @Args('limit', { nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { nullable: true, defaultValue: 0 }) offset: number,
  ): Promise<Document[]> {
    return this.documentService.getUserPublicDocuments(userId, limit, offset);
  }

  @Public()
  @Query(() => Document, {
    name: 'getPublishedDocumentBySlug',
    description: 'Get a published document by its public slug (unauthenticated)',
  })
  async getPublishedDocumentBySlug(
    @Args('slug') slug: string,
  ): Promise<Document> {
    return this.documentService.getPublishedDocumentBySlug(slug);
  }

  @Public()
  @Query(() => String, {
    name: 'getPublishedDocumentState',
    description: 'Get the base64-encoded Yjs state of a published document by its public slug (unauthenticated)',
  })
  async getPublishedDocumentState(
    @Args('slug') slug: string,
  ): Promise<string> {
    return this.documentService.getPublishedDocumentState(slug);
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

  @Mutation(() => Boolean, {
    name: 'emptyTrash',
    description: 'Permanently delete all trashed documents in a workspace',
  })
  async emptyTrash(
    @Args('workspaceId') workspaceId: string,
  ): Promise<Boolean> {
    return this.documentService.emptyTrash(workspaceId);
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
    name: "forkDocument",
    description: "Fork a documents"
  })
  async forkDocument(
    @Args("input") input: ForkDocumentInput,
    @CurrentUser("id") userId: string
  ) {
    return this.documentService.forkDocument(userId, input)
  }

  @Mutation(() => Document, {
    name: 'duplicateDocument',
    description: 'Create a duplicate of a document in the same workspace',
  })
  async duplicateDocument(
    @Args('input') input: DuplicateDocumentInput,
    @CurrentUser('id') userId: string,
  ): Promise<Document> {
    return this.documentService.duplicateDocument(userId, input);
  }

  @Mutation(() => Document, {
    name: 'addWorkspaceFavoriteDocument',
    description: 'Mark a document as a favorite in workspace',
  })
  async addWorkspaceFavoriteDocument(
    @Args('input') input: FavoriteDocumentInput,
    @CurrentUser('id') userId: string,
  ): Promise<Document> {
    return this.documentService.addFavoriteDocument(userId, input.documentId, input.workspaceId);
  }

  @Mutation(() => Document, {
    name: 'addPublicFavoriteDocument',
    description: 'Mark a public document as a favorite',
  })
  async addPublicFavoriteDocument(
    @Args('input') input: FavoritePublicDocumentInput,
    @CurrentUser('id') userId: string,
  ): Promise<Document> {
    return this.documentService.addFavoriteDocument(userId, input.documentId);
  }

  @Mutation(() => Document, {
    name: 'removeWorkspaceFavoriteDocument',
    description: 'Unmark a document as a favorite',
  })
  async removeWorkspaceFavoriteDocument(
    @Args('input') input: FavoriteDocumentInput,
    @CurrentUser('id') userId: string
  ): Promise<Document> {
    return this.documentService.removeFavoriteDocument(userId, input.documentId, input.workspaceId);
  }

  @Mutation(() => Document, {
    name: 'removePublicFavoriteDocument',
    description: 'Unmark a document as a favorite',
  })
  async removePublicFavoriteDocument(
    @Args('input') input: FavoritePublicDocumentInput,
    @CurrentUser('id') userId: string,
  ): Promise<Document> {
    return this.documentService.removeFavoriteDocument(userId, input.documentId);
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

  @Mutation(() => Document, {
    name: 'setDocumentLinkVisibility',
    description: 'Let any authenticated user with the link view this document read-only, without publishing it to the community',
  })
  async setDocumentLinkVisibility(
    @Args('workspaceId') workspaceId: string,
    @Args('documentId') documentId: string,
  ): Promise<Document> {
    return this.documentService.setDocumentLinkVisibility(documentId, workspaceId);
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

  @ResolveField(() => User, {
    name: 'author',
    nullable: true,
  })
  async author(@Parent() doc: Document): Promise<User | null> {
    if (!doc.authorId) return null;
    return this.userService.findById(doc.authorId);
  }

  @ResolveField(() => Int)
  async forkCount(@Parent() document: Document): Promise<number> {
    return this.documentService.getDocumentForkCount(document.id);
  }

  @ResolveField(() => Int)
  async favoriteCount(@Parent() document: Document): Promise<number> {
    return this.documentService.getDocumentFavoriteCount(document.id);
  }

  @ResolveField(() => Boolean)
  async isFavorite(@Parent() document: Document, @CurrentUser('id') userId: string): Promise<boolean> {
    return this.documentService.isFavoriteDocument(userId, document.id);
  }
}