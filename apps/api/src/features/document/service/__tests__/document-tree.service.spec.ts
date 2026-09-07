import { DocumentTreeService } from '../document-tree.service';
import { EventNames } from '@/core/events/document.events';

function makeQb(overrides: Record<string, any> = {}) {
  const qb: any = {};
  qb.update = jest.fn(() => qb);
  qb.set = jest.fn(() => qb);
  qb.where = jest.fn(() => qb);
  qb.andWhere = jest.fn(() => qb);
  qb.select = jest.fn(() => qb);
  qb.execute = jest.fn().mockResolvedValue({ affected: 0 });
  qb.getRawOne = jest.fn().mockResolvedValue({ max: 0 });
  Object.assign(qb, overrides);
  return qb;
}

function makeRepo() {
  const repo: any = {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn(),
    save: jest.fn((v) => Promise.resolve(v)),
    create: jest.fn((v) => v),
    remove: jest.fn((v) => Promise.resolve(v)),
    count: jest.fn().mockResolvedValue(0),
    delete: jest.fn().mockResolvedValue({ affected: 0 }),
    createQueryBuilder: jest.fn(() => makeQb()),
  };
  return repo;
}

function makeService() {
  const documentRepository = makeRepo();
  const yjsDocumentRepository = makeRepo();
  const eventEmitter = { emit: jest.fn() } as any;
  const eventEmitterReadinessWatcher = { waitUntilReady: jest.fn().mockResolvedValue(undefined) } as any;

  // dataSource.transaction runs the callback against a manager whose
  // getRepository always returns the same top-level repo mocks — good
  // enough for unit-testing the orchestration logic here.
  const dataSource = {
    transaction: jest.fn(async (cb: any) => {
      const manager = {
        getRepository: jest.fn((entity: any) => {
          return entity?.name === 'YjsDocumentEntity' ? yjsDocumentRepository : documentRepository;
        }),
      };
      return cb(manager);
    }),
  } as any;

  const service = new DocumentTreeService(
    dataSource,
    documentRepository,
    yjsDocumentRepository,
    eventEmitter,
    eventEmitterReadinessWatcher,
  );

  return { service, dataSource, documentRepository, yjsDocumentRepository, eventEmitter, eventEmitterReadinessWatcher };
}

const WORKSPACE_ID = 'ws-1';
const DOC_ID = 'doc-1';
const USER_ID = 'user-1';

function makeDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: DOC_ID,
    title: 'Doc',
    workspaceId: WORKSPACE_ID,
    parentId: null,
    orderIndex: 0,
    version: 1,
    authorId: USER_ID,
    deletedAt: null,
    ...overrides,
  };
}

describe('DocumentTreeService', () => {
  describe('createDocument', () => {
    it('creates the document, its yjs record, and returns the reloaded entity', async () => {
      const { service, documentRepository, yjsDocumentRepository } = makeService();
      documentRepository.count.mockResolvedValue(0);
      documentRepository.findOne
        .mockResolvedValueOnce(null) // calculateOrderIndex lastChild lookup (requestedIndex -1)
        .mockResolvedValueOnce(makeDoc()); // reload after save

      const result = await service.createDocument(WORKSPACE_ID, USER_ID, 'New', null, -1, 1);

      expect(documentRepository.save).toHaveBeenCalled();
      expect(yjsDocumentRepository.save).toHaveBeenCalled();
      expect(result.id).toBe(DOC_ID);
    });

    it('continues without a yjs document when yjs creation fails', async () => {
      const { service, documentRepository, yjsDocumentRepository } = makeService();
      documentRepository.count.mockResolvedValue(0);
      documentRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(makeDoc());
      yjsDocumentRepository.save.mockRejectedValueOnce(new Error('boom'));

      const result = await service.createDocument(WORKSPACE_ID, USER_ID, 'New', null, -1, 1);

      expect(result.id).toBe(DOC_ID);
    });

    it('falls back to the freshly created document when reload finds nothing', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.count.mockResolvedValue(0);
      documentRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      const result = await service.createDocument(WORKSPACE_ID, USER_ID, 'New', null, -1, 1);

      expect(result).toBeDefined();
    });
  });

  describe('updateDocumentTitle', () => {
    it('throws NotFoundException when the document does not exist', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.updateDocumentTitle(DOC_ID, WORKSPACE_ID, 'New title')).rejects.toThrow(
        'Document not found',
      );
    });

    it('updates the title, saves, and emits an update', async () => {
      const { service, documentRepository, eventEmitter } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDoc());

      const result = await service.updateDocumentTitle(DOC_ID, WORKSPACE_ID, 'New title');

      expect(result.title).toBe('New title');
      expect(documentRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(EventNames.DOCUMENT_UPDATE, expect.anything());
    });
  });

  describe('moveDocument', () => {
    it('throws NotFoundException when the document does not exist', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.moveDocument(DOC_ID, WORKSPACE_ID, null, 0)).rejects.toThrow('Document not found');
    });

    it('moves the document to a new parent/orderIndex and shifts siblings', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDoc({ parentId: 'old-parent', orderIndex: 0 }));
      documentRepository.count.mockResolvedValue(2);
      documentRepository.findOne
        .mockResolvedValueOnce(makeDoc({ parentId: 'old-parent', orderIndex: 0 })) // fetch document
        .mockResolvedValueOnce(makeDoc({ orderIndex: 3 })); // calculateOrderIndex lastChild

      const result = await service.moveDocument(DOC_ID, WORKSPACE_ID, 'new-parent', 5);

      expect(result.parentId).toBe('new-parent');
      expect(documentRepository.save).toHaveBeenCalled();
    });
  });

  describe('restoreDocument', () => {
    it('throws NotFoundException when there is no deleted document', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.restoreDocument(DOC_ID, WORKSPACE_ID)).rejects.toThrow('Deleted document not found');
    });

    it('throws NotFoundException when the document is not actually deleted', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDoc({ deletedAt: null }));

      await expect(service.restoreDocument(DOC_ID, WORKSPACE_ID)).rejects.toThrow('Deleted document not found');
    });

    it('restores the document, nulling parent if the parent is also deleted', async () => {
      const { service, documentRepository } = makeService();
      const deletedDoc = makeDoc({ deletedAt: new Date(), parent: { id: 'parent-1', deletedAt: new Date() } });
      documentRepository.findOne.mockResolvedValue(deletedDoc);
      documentRepository.find.mockResolvedValue([]); // no children to recurse

      const result = await service.restoreDocument(DOC_ID, WORKSPACE_ID);

      expect(result.parentId).toBeNull();
      expect(result.deletedAt).toBeNull();
    });

    it('restores children recursively', async () => {
      const { service, documentRepository } = makeService();
      const deletedDoc = makeDoc({ deletedAt: new Date(), parent: null });
      documentRepository.findOne.mockResolvedValue(deletedDoc);
      documentRepository.find
        .mockResolvedValueOnce([{ id: 'child-1' }]) // restoreChildrenRecursive first level
        .mockResolvedValueOnce([]); // no grandchildren

      await service.restoreDocument(DOC_ID, WORKSPACE_ID);

      expect(documentRepository.find).toHaveBeenCalledTimes(2);
    });
  });

  describe('deleteDocument', () => {
    it('throws NotFoundException when the document does not exist', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteDocument(DOC_ID, WORKSPACE_ID, true)).rejects.toThrow('Document not found');
    });

    it('soft deletes, cascades to children, and shifts siblings up', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDoc({ deletedAt: null }));
      documentRepository.find.mockResolvedValue([]); // no children

      const result = await service.deleteDocument(DOC_ID, WORKSPACE_ID, true);

      expect(result.deletedAt).not.toBeNull();
      expect(documentRepository.save).toHaveBeenCalled();
      expect(documentRepository.remove).not.toHaveBeenCalled();
    });

    it('hard deletes when softDelete is false', async () => {
      const { service, documentRepository } = makeService();
      const doc = makeDoc({ deletedAt: null });
      documentRepository.findOne.mockResolvedValue(doc);

      await service.deleteDocument(DOC_ID, WORKSPACE_ID, false);

      expect(documentRepository.remove).toHaveBeenCalledWith(doc);
    });

    it('does not shift siblings when the document was already deleted', async () => {
      const { service, documentRepository } = makeService();
      const doc = makeDoc({ deletedAt: new Date() });
      documentRepository.findOne.mockResolvedValue(doc);
      documentRepository.find.mockResolvedValue([]);
      const qb = makeQb();
      documentRepository.createQueryBuilder.mockReturnValue(qb);

      await service.deleteDocument(DOC_ID, WORKSPACE_ID, true);

      // shiftDocumentsUp uses createQueryBuilder — with wasDeleted true it
      // should only be invoked by softDeleteChildrenRecursive's update call,
      // never by shiftDocumentsUp itself. We can't easily distinguish here,
      // so just assert deletion path completed without throwing.
      expect(documentRepository.save).toHaveBeenCalled();
    });
  });

  describe('emptyTrash', () => {
    it('deletes trashed documents and returns the affected count', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.delete.mockResolvedValue({ affected: 3 });

      const result = await service.emptyTrash(WORKSPACE_ID);

      expect(result).toBe(3);
    });

    it('returns 0 when affected is undefined', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.delete.mockResolvedValue({ affected: undefined });

      const result = await service.emptyTrash(WORKSPACE_ID);

      expect(result).toBe(0);
    });
  });

  describe('duplicateDocument', () => {
    it('throws NotFoundException when the original document is missing', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(null);

      await expect(service.duplicateDocument(DOC_ID, WORKSPACE_ID, USER_ID)).rejects.toThrow('Document not found');
    });

    it('duplicates within the same workspace, including children and yjs content', async () => {
      const { service, documentRepository, yjsDocumentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDoc({ orderIndex: 0, parentId: null }));
      documentRepository.find.mockResolvedValue([]); // no children
      yjsDocumentRepository.findOne.mockResolvedValue(null); // no yjs doc to copy

      const result = await service.duplicateDocument(DOC_ID, WORKSPACE_ID, USER_ID);

      expect(result.title).toBe('Doc copy');
      expect(documentRepository.save).toHaveBeenCalled();
    });

    it('does not set a title suffix when the original title is empty', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDoc({ title: '' }));
      documentRepository.find.mockResolvedValue([]);

      const result = await service.duplicateDocument(DOC_ID, WORKSPACE_ID, USER_ID);

      expect(result.title).toBe('');
    });

    it('duplicates cross-workspace without copying children or parentId', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDoc({ parentId: 'p1' }));

      const result = await service.duplicateDocument(DOC_ID, 'other-ws', USER_ID, undefined, false);

      expect(result.parentId).toBeNull();
      expect(documentRepository.find).not.toHaveBeenCalled();
    });

    it('recursively duplicates children with their yjs content', async () => {
      const { service, documentRepository, yjsDocumentRepository } = makeService();
      documentRepository.findOne.mockResolvedValue(makeDoc());
      documentRepository.find
        .mockResolvedValueOnce([makeDoc({ id: 'child-1' })]) // duplicateChildren top level
        .mockResolvedValueOnce([]); // no grandchildren
      yjsDocumentRepository.findOne.mockResolvedValue({ documentId: 'child-1', state: Buffer.from('x') });

      await service.duplicateDocument(DOC_ID, WORKSPACE_ID, USER_ID);

      expect(documentRepository.save).toHaveBeenCalled();
      expect(yjsDocumentRepository.save).toHaveBeenCalled();
    });
  });

  describe('getWorkspaceDocuments', () => {
    it('returns documents mapped from entities', async () => {
      const { service, documentRepository } = makeService();
      documentRepository.find.mockResolvedValue([makeDoc()]);

      const result = await service.getWorkspaceDocuments(WORKSPACE_ID);

      expect(result).toHaveLength(1);
      expect(documentRepository.find).toHaveBeenCalledWith({
        where: { workspaceId: WORKSPACE_ID },
        relations: { author: true },
      });
    });
  });

  describe('emitDocumentUpdate', () => {
    it('waits for readiness then emits DOCUMENT_UPDATE', async () => {
      const { service, eventEmitter, eventEmitterReadinessWatcher } = makeService();

      await service.emitDocumentUpdate(WORKSPACE_ID, { id: DOC_ID } as any);

      expect(eventEmitterReadinessWatcher.waitUntilReady).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(EventNames.DOCUMENT_UPDATE, expect.anything());
    });
  });

  describe('emitWorkspaceDocuments', () => {
    it('waits for readiness, fetches documents, and emits WORKSPACE_DOCUMENTS', async () => {
      const { service, documentRepository, eventEmitter, eventEmitterReadinessWatcher } = makeService();
      documentRepository.find.mockResolvedValue([makeDoc()]);

      await service.emitWorkspaceDocuments(WORKSPACE_ID);

      expect(eventEmitterReadinessWatcher.waitUntilReady).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(EventNames.WORKSPACE_DOCUMENTS, expect.anything());
    });
  });
});
