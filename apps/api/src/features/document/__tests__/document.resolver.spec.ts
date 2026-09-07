// YjsDocumentService (via DocumentService) transitively drags in the
// code-execution/visualization stack and an ESM-only package
// (aggregate-error) — stub it via an explicit factory so jest never loads
// the real module chain.
jest.mock('@/features/collaboration/yjs/yjs-document.service', () => ({
  YjsDocumentService: jest.fn(),
}));

import { DocumentResolver } from '../document.resolver';
import { Document } from '../model/document.model';

function makeServices() {
  const userService = { findById: jest.fn() } as any;
  const documentService = {
    getDocument: jest.fn(),
    getDocumentState: jest.fn(),
    getFavoriteDocuments: jest.fn(),
    getExploreDocuments: jest.fn(),
    getFeaturedDocuments: jest.fn(),
    getFavoriteExploreDocuments: jest.fn(),
    getForkedDocuments: jest.fn(),
    getTrendingPublishedDocuments: jest.fn(),
    getUserPublicDocuments: jest.fn(),
    getPublishedDocumentBySlug: jest.fn(),
    getPublishedDocumentState: jest.fn(),
    createDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
    emptyTrash: jest.fn(),
    restoreDocument: jest.fn(),
    forkDocument: jest.fn(),
    duplicateDocument: jest.fn(),
    addFavoriteDocument: jest.fn(),
    removeFavoriteDocument: jest.fn(),
    publishDocument: jest.fn(),
    unpublishDocument: jest.fn(),
    setDocumentLinkVisibility: jest.fn(),
    getChildren: jest.fn(),
    getDocumentForkCount: jest.fn(),
    getDocumentFavoriteCount: jest.fn(),
    isFavoriteDocument: jest.fn(),
  } as any;
  const documentTreeService = {
    getWorkspaceDocuments: jest.fn(),
  } as any;

  return { userService, documentService, documentTreeService };
}

function makeResolver() {
  const services = makeServices();
  const resolver = new DocumentResolver(services.userService, services.documentService, services.documentTreeService);
  return { resolver, ...services };
}

const WORKSPACE_ID = 'ws-1';
const DOCUMENT_ID = 'doc-1';
const USER_ID = 'user-1';

function makeDoc(overrides: Partial<Document> = {}): Document {
  return { id: DOCUMENT_ID, workspaceId: WORKSPACE_ID, authorId: USER_ID, parentId: null, ...overrides } as Document;
}

describe('DocumentResolver', () => {
  it('getDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const doc = makeDoc();
    documentService.getDocument.mockResolvedValue(doc);

    const result = await resolver.getDocument(DOCUMENT_ID, WORKSPACE_ID);

    expect(documentService.getDocument).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID);
    expect(result).toBe(doc);
  });

  it('getDocumentState delegates to service with current user', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getDocumentState.mockResolvedValue('state');

    const result = await resolver.getDocumentState(DOCUMENT_ID, WORKSPACE_ID, USER_ID);

    expect(documentService.getDocumentState).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID, USER_ID);
    expect(result).toBe('state');
  });

  it('getFavoriteDocuments delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getFavoriteDocuments.mockResolvedValue([makeDoc()]);

    const result = await resolver.getFavoriteDocuments(WORKSPACE_ID, USER_ID);

    expect(documentService.getFavoriteDocuments).toHaveBeenCalledWith(USER_ID, WORKSPACE_ID);
    expect(result).toHaveLength(1);
  });

  it('getWorkspaceDocuments delegates to documentTreeService', async () => {
    const { resolver, documentTreeService } = makeResolver();
    documentTreeService.getWorkspaceDocuments.mockResolvedValue([makeDoc()]);

    const result = await resolver.getWorkspaceDocuments(WORKSPACE_ID);

    expect(documentTreeService.getWorkspaceDocuments).toHaveBeenCalledWith(WORKSPACE_ID);
    expect(result).toHaveLength(1);
  });

  it('getExplorerDocuments delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getExploreDocuments.mockResolvedValue([]);

    await resolver.getExplorerDocuments(10, 5);

    expect(documentService.getExploreDocuments).toHaveBeenCalledWith(10, 5);
  });

  it('getFeaturedDocuments delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getFeaturedDocuments.mockResolvedValue([]);

    await resolver.getFeaturedDocuments(4);

    expect(documentService.getFeaturedDocuments).toHaveBeenCalledWith(4);
  });

  it('favoritePublicDocuments delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getFavoriteExploreDocuments.mockResolvedValue([]);

    await resolver.favoritePublicDocuments(USER_ID);

    expect(documentService.getFavoriteExploreDocuments).toHaveBeenCalledWith(USER_ID);
  });

  it('getForkedDocuments delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getForkedDocuments.mockResolvedValue([]);

    await resolver.getForkedDocuments(USER_ID);

    expect(documentService.getForkedDocuments).toHaveBeenCalledWith(USER_ID);
  });

  it('getTrendingPublishedDocuments delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getTrendingPublishedDocuments.mockResolvedValue([]);

    await resolver.getTrendingPublishedDocuments(20, 0);

    expect(documentService.getTrendingPublishedDocuments).toHaveBeenCalledWith(20, 0);
  });

  it('getUserPublicDocuments delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getUserPublicDocuments.mockResolvedValue([]);

    await resolver.getUserPublicDocuments(USER_ID, 20, 0);

    expect(documentService.getUserPublicDocuments).toHaveBeenCalledWith(USER_ID, 20, 0);
  });

  it('getPublishedDocumentBySlug delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const doc = makeDoc({ slug: 'slug' } as any);
    documentService.getPublishedDocumentBySlug.mockResolvedValue(doc);

    const result = await resolver.getPublishedDocumentBySlug('slug');

    expect(documentService.getPublishedDocumentBySlug).toHaveBeenCalledWith('slug');
    expect(result).toBe(doc);
  });

  it('getPublishedDocumentState delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.getPublishedDocumentState.mockResolvedValue('state');

    const result = await resolver.getPublishedDocumentState('slug');

    expect(documentService.getPublishedDocumentState).toHaveBeenCalledWith('slug');
    expect(result).toBe('state');
  });

  it('createDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { title: 'New' } as any;
    documentService.createDocument.mockResolvedValue(makeDoc());

    await resolver.createDocument(WORKSPACE_ID, input, USER_ID);

    expect(documentService.createDocument).toHaveBeenCalledWith(WORKSPACE_ID, USER_ID, input);
  });

  it('updateDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { title: 'New' } as any;
    documentService.updateDocument.mockResolvedValue(makeDoc());

    await resolver.updateDocument(DOCUMENT_ID, WORKSPACE_ID, input);

    expect(documentService.updateDocument).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID, input);
  });

  it('deleteDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { documentId: DOCUMENT_ID, workspaceId: WORKSPACE_ID } as any;
    documentService.deleteDocument.mockResolvedValue(true);

    const result = await resolver.deleteDocument(input);

    expect(documentService.deleteDocument).toHaveBeenCalledWith(input);
    expect(result).toBe(true);
  });

  it('emptyTrash delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.emptyTrash.mockResolvedValue(true);

    const result = await resolver.emptyTrash(WORKSPACE_ID);

    expect(documentService.emptyTrash).toHaveBeenCalledWith(WORKSPACE_ID);
    expect(result).toBe(true);
  });

  it('restoreDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { documentId: DOCUMENT_ID, workspaceId: WORKSPACE_ID } as any;
    documentService.restoreDocument.mockResolvedValue(makeDoc());

    await resolver.restoreDocument(input);

    expect(documentService.restoreDocument).toHaveBeenCalledWith(input);
  });

  it('forkDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { documentId: DOCUMENT_ID, targetWorkspaceId: WORKSPACE_ID } as any;
    documentService.forkDocument.mockResolvedValue(makeDoc());

    await resolver.forkDocument(input, USER_ID);

    expect(documentService.forkDocument).toHaveBeenCalledWith(USER_ID, input);
  });

  it('duplicateDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { documentId: DOCUMENT_ID, workspaceId: WORKSPACE_ID } as any;
    documentService.duplicateDocument.mockResolvedValue(makeDoc());

    await resolver.duplicateDocument(input, USER_ID);

    expect(documentService.duplicateDocument).toHaveBeenCalledWith(USER_ID, input);
  });

  it('addWorkspaceFavoriteDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { documentId: DOCUMENT_ID, workspaceId: WORKSPACE_ID } as any;
    documentService.addFavoriteDocument.mockResolvedValue(makeDoc());

    await resolver.addWorkspaceFavoriteDocument(input, USER_ID);

    expect(documentService.addFavoriteDocument).toHaveBeenCalledWith(USER_ID, DOCUMENT_ID, WORKSPACE_ID);
  });

  it('addPublicFavoriteDocument delegates to service without workspaceId', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { documentId: DOCUMENT_ID } as any;
    documentService.addFavoriteDocument.mockResolvedValue(makeDoc());

    await resolver.addPublicFavoriteDocument(input, USER_ID);

    expect(documentService.addFavoriteDocument).toHaveBeenCalledWith(USER_ID, DOCUMENT_ID);
  });

  it('removeWorkspaceFavoriteDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { documentId: DOCUMENT_ID, workspaceId: WORKSPACE_ID } as any;
    documentService.removeFavoriteDocument.mockResolvedValue(makeDoc());

    await resolver.removeWorkspaceFavoriteDocument(input, USER_ID);

    expect(documentService.removeFavoriteDocument).toHaveBeenCalledWith(USER_ID, DOCUMENT_ID, WORKSPACE_ID);
  });

  it('removePublicFavoriteDocument delegates to service without workspaceId', async () => {
    const { resolver, documentService } = makeResolver();
    const input = { documentId: DOCUMENT_ID } as any;
    documentService.removeFavoriteDocument.mockResolvedValue(makeDoc());

    await resolver.removePublicFavoriteDocument(input, USER_ID);

    expect(documentService.removeFavoriteDocument).toHaveBeenCalledWith(USER_ID, DOCUMENT_ID);
  });

  it('publishDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.publishDocument.mockResolvedValue(makeDoc());

    await resolver.publishDocument(WORKSPACE_ID, DOCUMENT_ID);

    expect(documentService.publishDocument).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID);
  });

  it('unpublishDocument delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.unpublishDocument.mockResolvedValue(makeDoc());

    await resolver.unpublishDocument(WORKSPACE_ID, DOCUMENT_ID);

    expect(documentService.unpublishDocument).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID);
  });

  it('setDocumentLinkVisibility delegates to service', async () => {
    const { resolver, documentService } = makeResolver();
    documentService.setDocumentLinkVisibility.mockResolvedValue(makeDoc());

    await resolver.setDocumentLinkVisibility(WORKSPACE_ID, DOCUMENT_ID);

    expect(documentService.setDocumentLinkVisibility).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID);
  });

  describe('field resolvers', () => {
    it('children delegates to service with parent id', async () => {
      const { resolver, documentService } = makeResolver();
      documentService.getChildren.mockResolvedValue([]);
      const parent = makeDoc();

      await resolver.children(parent);

      expect(documentService.getChildren).toHaveBeenCalledWith(parent.id);
    });

    it('parent returns null when doc has no parentId', async () => {
      const { resolver, documentService } = makeResolver();
      const doc = makeDoc({ parentId: null });

      const result = await resolver.parent(doc);

      expect(result).toBeNull();
      expect(documentService.getDocument).not.toHaveBeenCalled();
    });

    it('parent fetches the parent document when parentId is set', async () => {
      const { resolver, documentService } = makeResolver();
      const parentDoc = makeDoc({ id: 'parent-1' });
      const doc = makeDoc({ parentId: 'parent-1' });
      documentService.getDocument.mockResolvedValue(parentDoc);

      const result = await resolver.parent(doc);

      expect(documentService.getDocument).toHaveBeenCalledWith('parent-1', doc.workspaceId);
      expect(result).toBe(parentDoc);
    });

    it('author returns null when doc has no authorId', async () => {
      const { resolver, userService } = makeResolver();
      const doc = makeDoc({ authorId: null as any });

      const result = await resolver.author(doc);

      expect(result).toBeNull();
      expect(userService.findById).not.toHaveBeenCalled();
    });

    it('author fetches the author when authorId is set', async () => {
      const { resolver, userService } = makeResolver();
      const author = { id: USER_ID } as any;
      userService.findById.mockResolvedValue(author);
      const doc = makeDoc();

      const result = await resolver.author(doc);

      expect(userService.findById).toHaveBeenCalledWith(USER_ID);
      expect(result).toBe(author);
    });

    it('forkCount delegates to service', async () => {
      const { resolver, documentService } = makeResolver();
      documentService.getDocumentForkCount.mockResolvedValue(2);
      const doc = makeDoc();

      const result = await resolver.forkCount(doc);

      expect(documentService.getDocumentForkCount).toHaveBeenCalledWith(doc.id);
      expect(result).toBe(2);
    });

    it('favoriteCount delegates to service', async () => {
      const { resolver, documentService } = makeResolver();
      documentService.getDocumentFavoriteCount.mockResolvedValue(5);
      const doc = makeDoc();

      const result = await resolver.favoriteCount(doc);

      expect(documentService.getDocumentFavoriteCount).toHaveBeenCalledWith(doc.id);
      expect(result).toBe(5);
    });

    it('isFavorite delegates to service with current user', async () => {
      const { resolver, documentService } = makeResolver();
      documentService.isFavoriteDocument.mockResolvedValue(true);
      const doc = makeDoc();

      const result = await resolver.isFavorite(doc, USER_ID);

      expect(documentService.isFavoriteDocument).toHaveBeenCalledWith(USER_ID, doc.id);
      expect(result).toBe(true);
    });
  });
});
