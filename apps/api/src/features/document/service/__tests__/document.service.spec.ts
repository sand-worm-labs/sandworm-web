// YjsDocumentService transitively drags in the code-execution/visualization
// stack and an ESM-only package (aggregate-error) — stub it via an explicit
// factory so jest never loads the real module chain.
jest.mock('@/features/collaboration/yjs/yjs-document.service', () => ({
  YjsDocumentService: jest.fn(),
}));

import { DocumentVisibility } from '@sandworm/postgresql-typeorm';
import { DocumentService } from '../document.service';

function makeService() {
  const dataSource = {
    transaction: jest.fn(),
  } as any;
  const documentRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  } as any;
  const favoriteRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  } as any;
  const forkRepository = {
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn((v) => v),
    save: jest.fn(),
  } as any;
  const yjsDocumentRepository = {
    findOne: jest.fn(),
  } as any;
  const userRepository = {
    findOneBy: jest.fn(),
  } as any;
  const documentTreeService = {
    createDocument: jest.fn(),
    emitDocumentUpdate: jest.fn(),
    moveDocument: jest.fn(),
    updateDocumentTitle: jest.fn(),
    deleteDocument: jest.fn(),
    emitWorkspaceDocuments: jest.fn(),
    emptyTrash: jest.fn(),
    restoreDocument: jest.fn(),
    duplicateDocument: jest.fn(),
  } as any;
  const yjsDocumentService = {
    getYDocState: jest.fn(),
    publishDocument: jest.fn(),
  } as any;
  const workspaceMembershipService = {
    assertActiveMember: jest.fn(),
  } as any;

  const service = new DocumentService(
    dataSource,
    documentRepository,
    favoriteRepository,
    forkRepository,
    yjsDocumentRepository,
    userRepository,
    documentTreeService,
    yjsDocumentService,
    workspaceMembershipService,
  );

  return {
    service,
    dataSource,
    documentRepository,
    favoriteRepository,
    forkRepository,
    yjsDocumentRepository,
    userRepository,
    documentTreeService,
    yjsDocumentService,
    workspaceMembershipService,
  };
}

const WORKSPACE_ID = 'ws-1';
const DOCUMENT_ID = 'doc-1';
const USER_ID = 'user-1';

function makeDocumentEntity(overrides: Record<string, unknown> = {}) {
  return {
    id: DOCUMENT_ID,
    slug: null,
    title: 'Untitled',
    authorId: USER_ID,
    workspaceId: WORKSPACE_ID,
    parentId: null,
    runUnexecutedBlocks: false,
    runSQLSelection: false,
    shareLinksWithoutSidebar: false,
    orderIndex: 0,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    publishedAt: null,
    visibility: DocumentVisibility.WORKSPACE,
    author: null,
    ...overrides,
  };
}

describe('DocumentService', () => {
  describe('getDocument', () => {
    it('returns the document when found', async () => {
      const { service, documentRepository } = makeService();
      const entity = makeDocumentEntity();
      documentRepository.findOne.mockResolvedValue(entity);

      const result = await service.getDocument(DOCUMENT_ID, WORKSPACE_ID);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: DOCUMENT_ID, workspaceId: WORKSPACE_ID },
      });
      expect(result.id).toBe(DOCUMENT_ID);
    });

    it('throws when the document is not found', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.getDocument(DOCUMENT_ID, WORKSPACE_ID)).rejects.toThrow();
    });
  });

  describe('getDocumentState', () => {
    it('asserts active membership before reading state', async () => {
      const { service, documentRepository, workspaceMembershipService, yjsDocumentService } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());
      yjsDocumentService.getYDocState.mockResolvedValue('base64state');

      const result = await service.getDocumentState(DOCUMENT_ID, WORKSPACE_ID, USER_ID);

      expect(workspaceMembershipService.assertActiveMember).toHaveBeenCalledWith(WORKSPACE_ID, USER_ID);
      expect(result).toBe('base64state');
    });

    it('throws when the document is not found', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.getDocumentState(DOCUMENT_ID, WORKSPACE_ID, USER_ID)).rejects.toThrow();
    });

    it('throws when the yjs state is empty', async () => {
      const { service, documentRepository, yjsDocumentService } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());
      yjsDocumentService.getYDocState.mockResolvedValue(null);

      await expect(service.getDocumentState(DOCUMENT_ID, WORKSPACE_ID, USER_ID)).rejects.toThrow();
    });
  });

  describe('getChildren', () => {
    it('returns mapped children ordered by orderIndex', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.find.mockResolvedValue([makeDocumentEntity()]);

      const result = await service.getChildren('parent-1');

      expect(documentRepository.find).toHaveBeenCalledWith({
        where: { parentId: 'parent-1', deletedAt: null },
        order: { orderIndex: 'ASC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('createDocument', () => {
    it('delegates to documentTreeService and emits an update', async () => {
      const { service, documentTreeService } = makeService();
      documentTreeService.createDocument.mockResolvedValue(makeDocumentEntity());

      const result = await service.createDocument(WORKSPACE_ID, USER_ID, {
        title: 'New doc',
        version: 1,
        orderIndex: -1,
      } as any);

      expect(documentTreeService.createDocument).toHaveBeenCalledWith(
        WORKSPACE_ID,
        USER_ID,
        'New doc',
        null,
        -1,
        1,
      );
      expect(documentTreeService.emitDocumentUpdate).toHaveBeenCalled();
      expect(result.id).toBe(DOCUMENT_ID);
    });

    it('defaults title and parentId when not provided', async () => {
      const { service, documentTreeService } = makeService();
      documentTreeService.createDocument.mockResolvedValue(makeDocumentEntity());

      await service.createDocument(WORKSPACE_ID, USER_ID, {} as any);

      expect(documentTreeService.createDocument).toHaveBeenCalledWith(
        WORKSPACE_ID,
        USER_ID,
        '',
        null,
        -1,
        1,
      );
    });
  });

  describe('updateDocument', () => {
    it('throws when the document is not found', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateDocument(DOCUMENT_ID, WORKSPACE_ID, { orderIndex: 0 } as any),
      ).rejects.toThrow();
    });

    it('moves the document when parentId or orderIndex changed', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      const entity = makeDocumentEntity({ parentId: 'old-parent', orderIndex: 0 });
      documentRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(makeDocumentEntity({ parentId: 'new-parent', orderIndex: 2 }));

      await service.updateDocument(DOCUMENT_ID, WORKSPACE_ID, {
        parentId: 'new-parent',
        orderIndex: 2,
      } as any);

      expect(documentTreeService.moveDocument).toHaveBeenCalledWith(
        DOCUMENT_ID,
        WORKSPACE_ID,
        'new-parent',
        2,
      );
    });

    it('does not move when parentId/orderIndex are unchanged', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      const entity = makeDocumentEntity({ parentId: 'p', orderIndex: 0 });
      documentRepository.findOne.mockResolvedValueOnce(entity).mockResolvedValueOnce(entity);

      await service.updateDocument(DOCUMENT_ID, WORKSPACE_ID, {
        parentId: 'p',
        orderIndex: 0,
      } as any);

      expect(documentTreeService.moveDocument).not.toHaveBeenCalled();
    });

    it('updates title when changed', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      const entity = makeDocumentEntity({ title: 'Old' });
      documentRepository.findOne
        .mockResolvedValueOnce(entity)
        .mockResolvedValueOnce(makeDocumentEntity({ title: 'New' }));

      await service.updateDocument(DOCUMENT_ID, WORKSPACE_ID, { title: 'New' } as any);

      expect(documentTreeService.updateDocumentTitle).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID, 'New');
    });

    it('does not update title when unchanged', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      const entity = makeDocumentEntity({ title: 'Same' });
      documentRepository.findOne.mockResolvedValueOnce(entity).mockResolvedValueOnce(entity);

      await service.updateDocument(DOCUMENT_ID, WORKSPACE_ID, { title: 'Same' } as any);

      expect(documentTreeService.updateDocumentTitle).not.toHaveBeenCalled();
    });

    it('throws when the reloaded document disappears', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValueOnce(makeDocumentEntity()).mockResolvedValueOnce(null);

      await expect(
        service.updateDocument(DOCUMENT_ID, WORKSPACE_ID, { orderIndex: 0 } as any),
      ).rejects.toThrow();
    });

    it('applies boolean flag updates and saves', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      const entity = makeDocumentEntity();
      const reloaded = makeDocumentEntity();
      documentRepository.findOne.mockResolvedValueOnce(entity).mockResolvedValueOnce(reloaded);

      const result = await service.updateDocument(DOCUMENT_ID, WORKSPACE_ID, {
        orderIndex: 0,
        runUnexecutedBlocks: true,
        runSQLSelection: true,
        shareLinksWithoutSidebar: true,
      } as any);

      expect(reloaded.runUnexecutedBlocks).toBe(true);
      expect(reloaded.runSQLSelection).toBe(true);
      expect(reloaded.shareLinksWithoutSidebar).toBe(true);
      expect(documentRepository.save).toHaveBeenCalledWith(reloaded);
      expect(documentTreeService.emitDocumentUpdate).toHaveBeenCalled();
      expect(result.id).toBe(DOCUMENT_ID);
    });
  });

  describe('deleteDocument', () => {
    it('throws when the document is not found', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteDocument({ documentId: DOCUMENT_ID, workspaceId: WORKSPACE_ID } as any),
      ).rejects.toThrow();
    });

    it('soft deletes when isPermanent is falsy', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());

      const result = await service.deleteDocument({
        documentId: DOCUMENT_ID,
        workspaceId: WORKSPACE_ID,
        isPermanent: false,
      } as any);

      expect(documentTreeService.deleteDocument).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID, true);
      expect(documentTreeService.emitWorkspaceDocuments).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(result).toBe(true);
    });

    it('hard deletes when isPermanent is true', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());

      await service.deleteDocument({
        documentId: DOCUMENT_ID,
        workspaceId: WORKSPACE_ID,
        isPermanent: true,
      } as any);

      expect(documentTreeService.deleteDocument).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID, false);
    });
  });

  describe('emptyTrash', () => {
    it('empties the trash and emits workspace documents', async () => {
      const { service, documentTreeService } = makeService();

      const result = await service.emptyTrash(WORKSPACE_ID);

      expect(documentTreeService.emptyTrash).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(documentTreeService.emitWorkspaceDocuments).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(result).toBe(true);
    });
  });

  describe('restoreDocument', () => {
    it('throws when the document is not found (even with deleted)', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(
        service.restoreDocument({ documentId: DOCUMENT_ID, workspaceId: WORKSPACE_ID } as any),
      ).rejects.toThrow();
    });

    it('restores the document and emits workspace documents', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity({ deletedAt: new Date() }));
      documentTreeService.restoreDocument.mockResolvedValue(makeDocumentEntity({ deletedAt: null }));

      const result = await service.restoreDocument({
        documentId: DOCUMENT_ID,
        workspaceId: WORKSPACE_ID,
      } as any);

      expect(documentTreeService.restoreDocument).toHaveBeenCalledWith(DOCUMENT_ID, WORKSPACE_ID);
      expect(documentTreeService.emitWorkspaceDocuments).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(result.id).toBe(DOCUMENT_ID);
    });
  });

  describe('duplicateDocument', () => {
    it('throws inside the transaction when the original is not found', async () => {
      const { service, dataSource } = makeService();
      const manager = { getRepository: jest.fn(() => ({ findOne: jest.fn().mockResolvedValue(null) })) };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));

      await expect(
        service.duplicateDocument(USER_ID, { documentId: DOCUMENT_ID, workspaceId: WORKSPACE_ID } as any),
      ).rejects.toThrow();
    });

    it('duplicates the document and emits workspace documents', async () => {
      const { service, dataSource, documentTreeService } = makeService();
      const manager = {
        getRepository: jest.fn(() => ({ findOne: jest.fn().mockResolvedValue(makeDocumentEntity()) })),
      };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));
      documentTreeService.duplicateDocument.mockResolvedValue(makeDocumentEntity({ id: 'doc-2' }));

      const result = await service.duplicateDocument(USER_ID, {
        documentId: DOCUMENT_ID,
        workspaceId: WORKSPACE_ID,
      } as any);

      expect(documentTreeService.duplicateDocument).toHaveBeenCalledWith(
        DOCUMENT_ID,
        WORKSPACE_ID,
        USER_ID,
        manager,
      );
      expect(documentTreeService.emitWorkspaceDocuments).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(result.id).toBe('doc-2');
    });
  });

  describe('addFavoriteDocument', () => {
    function makeQb() {
      const qb: any = {};
      qb.insert = jest.fn(() => qb);
      qb.values = jest.fn(() => qb);
      qb.orIgnore = jest.fn(() => qb);
      qb.execute = jest.fn().mockResolvedValue(undefined);
      return qb;
    }

    it('throws when document is not found for workspace scope', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.addFavoriteDocument(USER_ID, DOCUMENT_ID, WORKSPACE_ID)).rejects.toThrow();
    });

    it('scopes lookup by workspaceId when provided', async () => {
      const { service, documentRepository, favoriteRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());
      const qb = makeQb();
      favoriteRepository.createQueryBuilder.mockReturnValue(qb);

      await service.addFavoriteDocument(USER_ID, DOCUMENT_ID, WORKSPACE_ID);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: DOCUMENT_ID, deletedAt: null, workspaceId: WORKSPACE_ID },
      });
      expect(qb.values).toHaveBeenCalledWith({ userId: USER_ID, documentId: DOCUMENT_ID });
    });

    it('scopes lookup by PUBLIC visibility when workspaceId is omitted', async () => {
      const { service, documentRepository, favoriteRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());
      favoriteRepository.createQueryBuilder.mockReturnValue(makeQb());

      await service.addFavoriteDocument(USER_ID, DOCUMENT_ID);

      expect(documentRepository.findOne).toHaveBeenCalledWith({
        where: { id: DOCUMENT_ID, deletedAt: null, visibility: DocumentVisibility.PUBLIC },
      });
    });
  });

  describe('removeFavoriteDocument', () => {
    it('throws when document is not found', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.removeFavoriteDocument(USER_ID, DOCUMENT_ID, WORKSPACE_ID)).rejects.toThrow();
    });

    it('throws when nothing was deleted', async () => {
      const { service, documentRepository, favoriteRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());
      favoriteRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.removeFavoriteDocument(USER_ID, DOCUMENT_ID, WORKSPACE_ID)).rejects.toThrow();
    });

    it('removes the favorite when found', async () => {
      const { service, documentRepository, favoriteRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());
      favoriteRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.removeFavoriteDocument(USER_ID, DOCUMENT_ID, WORKSPACE_ID);

      expect(result.id).toBe(DOCUMENT_ID);
    });
  });

  describe('forkDocument', () => {
    it('throws when original document is not found', async () => {
      const { service, dataSource } = makeService();
      const manager = { getRepository: jest.fn(() => ({ findOne: jest.fn().mockResolvedValue(null) })) };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));

      await expect(
        service.forkDocument(USER_ID, { documentId: DOCUMENT_ID, targetWorkspaceId: WORKSPACE_ID } as any),
      ).rejects.toThrow();
    });

    it('throws when original document is not public', async () => {
      const { service, dataSource } = makeService();
      const manager = {
        getRepository: jest.fn(() => ({
          findOne: jest.fn().mockResolvedValue(makeDocumentEntity({ visibility: DocumentVisibility.WORKSPACE })),
        })),
      };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));

      await expect(
        service.forkDocument(USER_ID, { documentId: DOCUMENT_ID, targetWorkspaceId: WORKSPACE_ID } as any),
      ).rejects.toThrow();
    });

    it('duplicates and records a fork when original is public', async () => {
      const { service, dataSource, documentTreeService } = makeService();
      const forkRepoInTx = { create: jest.fn((v) => v), save: jest.fn().mockResolvedValue(undefined) };
      const docRepoInTx = {
        findOne: jest.fn().mockResolvedValue(makeDocumentEntity({ visibility: DocumentVisibility.PUBLIC })),
      };
      // getRepository is called twice inside the transaction: once for
      // DocumentEntity (docRepo), once for DocumentForkEntity (forkRepo).
      let call = 0;
      const manager = {
        getRepository: jest.fn(() => {
          call += 1;
          return call === 1 ? docRepoInTx : forkRepoInTx;
        }),
      };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));
      documentTreeService.duplicateDocument.mockResolvedValue(makeDocumentEntity({ id: 'doc-2' }));

      const result = await service.forkDocument(USER_ID, {
        documentId: DOCUMENT_ID,
        targetWorkspaceId: WORKSPACE_ID,
      } as any);

      expect(documentTreeService.duplicateDocument).toHaveBeenCalledWith(
        DOCUMENT_ID,
        WORKSPACE_ID,
        USER_ID,
        manager,
        false,
      );
      expect(forkRepoInTx.save).toHaveBeenCalled();
      expect(documentTreeService.emitWorkspaceDocuments).toHaveBeenCalledWith(WORKSPACE_ID);
      expect(result.id).toBe('doc-2');
    });
  });

  describe('getFavoriteDocuments', () => {
    it('returns empty array when the user has no favorites', async () => {
      const { service, favoriteRepository, documentRepository } = makeService();
      favoriteRepository.find.mockResolvedValue([]);

      const result = await service.getFavoriteDocuments(USER_ID, WORKSPACE_ID);

      expect(result).toEqual([]);
      expect(documentRepository.find).not.toHaveBeenCalled();
    });

    it('returns favorited documents scoped to the workspace', async () => {
      const { service, favoriteRepository, documentRepository } = makeService();
      favoriteRepository.find.mockResolvedValue([{ documentId: DOCUMENT_ID }]);
      documentRepository.find.mockResolvedValue([makeDocumentEntity()]);

      const result = await service.getFavoriteDocuments(USER_ID, WORKSPACE_ID);

      expect(result).toHaveLength(1);
    });
  });

  describe('publishDocument', () => {
    it('throws when document is not found', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.publishDocument(DOCUMENT_ID, WORKSPACE_ID)).rejects.toThrow();
    });

    it('throws when yjs document is not found', async () => {
      const { service, documentRepository, yjsDocumentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity());
      yjsDocumentRepository.findOne.mockResolvedValue(null);

      await expect(service.publishDocument(DOCUMENT_ID, WORKSPACE_ID)).rejects.toThrow();
    });

    it('generates a slug when missing and publishes', async () => {
      const { service, documentRepository, yjsDocumentRepository, yjsDocumentService, documentTreeService } =
        makeService();
      const entity = makeDocumentEntity({ title: 'My Doc!', slug: null });
      documentRepository.findOne.mockResolvedValue(entity);
      yjsDocumentRepository.findOne.mockResolvedValue({ documentId: DOCUMENT_ID });
      documentRepository.findOne.mockResolvedValueOnce(entity); // doc lookup
      // slug uniqueness check will also call documentRepository.findOne again
      documentRepository.findOne.mockResolvedValue(null); // no existing slug conflict, and subsequent calls return null (fine)

      const result = await service.publishDocument(DOCUMENT_ID, WORKSPACE_ID);

      expect(yjsDocumentService.publishDocument).toHaveBeenCalledWith(DOCUMENT_ID);
      expect(documentRepository.save).toHaveBeenCalled();
      expect(documentTreeService.emitDocumentUpdate).toHaveBeenCalled();
      expect(result.visibility).toBe(DocumentVisibility.PUBLIC);
    });

    it('keeps existing slug when already set', async () => {
      const { service, documentRepository, yjsDocumentRepository } = makeService();
      const entity = makeDocumentEntity({ slug: 'existing-slug' });
      documentRepository.findOne.mockResolvedValue(entity);
      yjsDocumentRepository.findOne.mockResolvedValue({ documentId: DOCUMENT_ID });

      await service.publishDocument(DOCUMENT_ID, WORKSPACE_ID);

      expect(entity.slug).toBe('existing-slug');
    });
  });

  describe('setDocumentLinkVisibility', () => {
    it('throws when document is not found', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.setDocumentLinkVisibility(DOCUMENT_ID, WORKSPACE_ID)).rejects.toThrow();
    });

    it('sets visibility to LINK and clears publishedAt', async () => {
      const { service, documentRepository, documentTreeService } = makeService();
      const entity = makeDocumentEntity({ publishedAt: new Date() });
      documentRepository.findOne.mockResolvedValue(entity);

      const result = await service.setDocumentLinkVisibility(DOCUMENT_ID, WORKSPACE_ID);

      expect(entity.publishedAt).toBeNull();
      expect(entity.visibility).toBe(DocumentVisibility.LINK);
      expect(documentTreeService.emitDocumentUpdate).toHaveBeenCalled();
      expect(result.id).toBe(DOCUMENT_ID);
    });
  });

  describe('unpublishDocument', () => {
    it('throws when document is not found', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.unpublishDocument(DOCUMENT_ID, WORKSPACE_ID)).rejects.toThrow();
    });

    it('sets visibility to WORKSPACE and clears publishedAt', async () => {
      const { service, documentRepository } = makeService();
      const entity = makeDocumentEntity({
        publishedAt: new Date(),
        visibility: DocumentVisibility.PUBLIC,
      });
      documentRepository.findOne.mockResolvedValue(entity);

      await service.unpublishDocument(DOCUMENT_ID, WORKSPACE_ID);

      expect(entity.publishedAt).toBeNull();
      expect(entity.visibility).toBe(DocumentVisibility.WORKSPACE);
    });
  });

  describe('getExploreDocuments', () => {
    it('queries public, non-deleted documents ordered by publishedAt', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.find.mockResolvedValue([makeDocumentEntity()]);

      const result = await service.getExploreDocuments(10, 5);

      expect(documentRepository.find).toHaveBeenCalledWith({
        where: { visibility: DocumentVisibility.PUBLIC, deletedAt: null },
        order: { publishedAt: 'DESC' },
        take: 10,
        skip: 5,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getFavoriteExploreDocuments', () => {
    it('returns empty array when user has no favorites', async () => {
      const { service, favoriteRepository } = makeService();
      favoriteRepository.find.mockResolvedValue([]);

      const result = await service.getFavoriteExploreDocuments(USER_ID);

      expect(result).toEqual([]);
    });

    it('returns favorited public documents', async () => {
      const { service, favoriteRepository, documentRepository } = makeService();
      favoriteRepository.find.mockResolvedValue([{ documentId: DOCUMENT_ID }]);
      documentRepository.find.mockResolvedValue([makeDocumentEntity()]);

      const result = await service.getFavoriteExploreDocuments(USER_ID);

      expect(result).toHaveLength(1);
    });
  });

  describe('getFeaturedDocuments', () => {
    it('queries featured public documents', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.find.mockResolvedValue([makeDocumentEntity()]);

      const result = await service.getFeaturedDocuments(4);

      expect(documentRepository.find).toHaveBeenCalledWith({
        where: { visibility: DocumentVisibility.PUBLIC, deletedAt: null, featuredDocument: true },
        order: { publishedAt: 'DESC' },
        take: 4,
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getForkedDocuments', () => {
    it('filters out forks whose target document was deleted or missing', async () => {
      const { service, forkRepository } = makeService();
      forkRepository.find.mockResolvedValue([
        { forkedDocument: makeDocumentEntity({ id: 'doc-a', deletedAt: null }) },
        { forkedDocument: makeDocumentEntity({ id: 'doc-b', deletedAt: new Date() }) },
        { forkedDocument: null },
      ]);

      const result = await service.getForkedDocuments(USER_ID);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('doc-a');
    });
  });

  describe('isFavoriteDocument', () => {
    it('returns true when a favorite exists', async () => {
      const { service, favoriteRepository } = makeService();
      favoriteRepository.findOne.mockResolvedValue({ id: 'fav-1' });

      expect(await service.isFavoriteDocument(USER_ID, DOCUMENT_ID)).toBe(true);
    });

    it('returns false when no favorite exists', async () => {
      const { service, favoriteRepository } = makeService();
      favoriteRepository.findOne.mockResolvedValue(null);

      expect(await service.isFavoriteDocument(USER_ID, DOCUMENT_ID)).toBe(false);
    });
  });

  describe('getTrendingPublishedDocuments', () => {
    it('builds the trending query and maps results', async () => {
      const { service, documentRepository } = makeService();
      const qb: any = {};
      qb.leftJoin = jest.fn(() => qb);
      qb.where = jest.fn(() => qb);
      qb.andWhere = jest.fn(() => qb);
      qb.addSelect = jest.fn(() => qb);
      qb.groupBy = jest.fn(() => qb);
      qb.orderBy = jest.fn(() => qb);
      qb.addOrderBy = jest.fn(() => qb);
      qb.limit = jest.fn(() => qb);
      qb.offset = jest.fn(() => qb);
      qb.getMany = jest.fn().mockResolvedValue([makeDocumentEntity()]);
      documentRepository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.getTrendingPublishedDocuments(20, 0);

      expect(qb.limit).toHaveBeenCalledWith(20);
      expect(qb.offset).toHaveBeenCalledWith(0);
      expect(result).toHaveLength(1);
    });
  });

  describe('getPublishedDocumentBySlug / getPublishedDocumentState', () => {
    it('throws when no document matches the slug', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.getPublishedDocumentBySlug('slug')).rejects.toThrow();
    });

    it('throws when document is not published', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDocumentEntity({ publishedAt: null }));

      await expect(service.getPublishedDocumentBySlug('slug')).rejects.toThrow();
    });

    it('throws when visibility reverted to WORKSPACE', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(
        makeDocumentEntity({ publishedAt: new Date(), visibility: DocumentVisibility.WORKSPACE }),
      );

      await expect(service.getPublishedDocumentBySlug('slug')).rejects.toThrow();
    });

    it('returns the document when published and public', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(
        makeDocumentEntity({ publishedAt: new Date(), visibility: DocumentVisibility.PUBLIC, slug: 'slug' }),
      );

      const result = await service.getPublishedDocumentBySlug('slug');

      expect(result.slug).toBe('slug');
    });

    it('throws getPublishedDocumentState when yjs state is empty', async () => {
      const { service, documentRepository, yjsDocumentService } = makeService();
      documentRepository.findOne.mockResolvedValue(
        makeDocumentEntity({ publishedAt: new Date(), visibility: DocumentVisibility.PUBLIC }),
      );
      yjsDocumentService.getYDocState.mockResolvedValue(null);

      await expect(service.getPublishedDocumentState('slug')).rejects.toThrow();
    });

    it('returns state when found', async () => {
      const { service, documentRepository, yjsDocumentService } = makeService();
      documentRepository.findOne.mockResolvedValue(
        makeDocumentEntity({ publishedAt: new Date(), visibility: DocumentVisibility.PUBLIC }),
      );
      yjsDocumentService.getYDocState.mockResolvedValue('state');

      const result = await service.getPublishedDocumentState('slug');

      expect(result).toBe('state');
      expect(yjsDocumentService.getYDocState).toHaveBeenCalledWith(DOCUMENT_ID, true);
    });
  });

  describe('getDocumentForkCount / getDocumentFavoriteCount', () => {
    it('counts forks by source document', async () => {
      const { service, forkRepository } = makeService();
      forkRepository.count.mockResolvedValue(3);

      expect(await service.getDocumentForkCount(DOCUMENT_ID)).toBe(3);
      expect(forkRepository.count).toHaveBeenCalledWith({ where: { sourceDocumentId: DOCUMENT_ID } });
    });

    it('counts favorites by document', async () => {
      const { service, favoriteRepository } = makeService();
      favoriteRepository.count.mockResolvedValue(5);

      expect(await service.getDocumentFavoriteCount(DOCUMENT_ID)).toBe(5);
      expect(favoriteRepository.count).toHaveBeenCalledWith({ where: { documentId: DOCUMENT_ID } });
    });
  });

  describe('getUserPublicDocuments', () => {
    it('throws when the user is not found', async () => {
      const { service, userRepository } = makeService();
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getUserPublicDocuments(USER_ID, 10, 0)).rejects.toThrow();
    });

    it('returns public documents authored by the user', async () => {
      const { service, userRepository, documentRepository } = makeService();
      userRepository.findOneBy.mockResolvedValue({ id: USER_ID });
      documentRepository.find.mockResolvedValue([makeDocumentEntity()]);

      const result = await service.getUserPublicDocuments(USER_ID, 10, 0);

      expect(result).toHaveLength(1);
    });
  });
});
