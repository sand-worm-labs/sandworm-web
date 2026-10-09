import * as Y from 'yjs';
import { BaseAiExecutorService } from '../base-ai-executor.service';

// BaseAiExecutorService is abstract — exercise it through a bare subclass
// that adds no behavior of its own.
class TestAiExecutorService extends BaseAiExecutorService {}

function makeService() {
  const yjsDocumentService = {
    getDocId: jest.fn((documentId: string) => `${documentId}-null`),
    getYDocForUpdateAsync: jest.fn(),
  } as any;
  const persistorFactory = {
    createDocumentPersistor: jest.fn(() => 'persistor-instance'),
  } as any;

  const service = new TestAiExecutorService(yjsDocumentService, persistorFactory);
  return { service, yjsDocumentService, persistorFactory };
}

describe('BaseAiExecutorService', () => {
  describe('getSharedDoc', () => {
    it('threads the doc id, persistor, and workspace through to getYDocForUpdateAsync', async () => {
      const { service, yjsDocumentService, persistorFactory } = makeService();
      const sharedDoc = { ydoc: new Y.Doc() };
      yjsDocumentService.getYDocForUpdateAsync.mockResolvedValue(sharedDoc);

      const result = await (service as any).getSharedDoc('doc-1', 'ws-1');

      expect(yjsDocumentService.getDocId).toHaveBeenCalledWith('doc-1', null);
      expect(persistorFactory.createDocumentPersistor).toHaveBeenCalledWith('doc-1');
      expect(yjsDocumentService.getYDocForUpdateAsync).toHaveBeenCalledWith(
        'doc-1-null',
        'doc-1',
        null,
        'ws-1',
        'persistor-instance',
      );
      expect(result).toBe(sharedDoc);
    });
  });

  describe('getXmlFragment', () => {
    it('returns the named xml fragment from the ydoc', () => {
      const { service } = makeService();
      const doc = new Y.Doc();

      const fragment = (service as any).getXmlFragment(doc, 'title');

      expect(fragment).toBe(doc.getXmlFragment('title'));
    });
  });

  describe('transact', () => {
    it('runs the callback inside a Yjs transaction', () => {
      const { service } = makeService();
      const doc = new Y.Doc();
      const transactSpy = jest.spyOn(doc, 'transact');
      const fn = jest.fn(() => {
        doc.getMap('blocks').set('a', 1);
      });

      (service as any).transact(doc, fn);

      expect(transactSpy).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(doc.getMap('blocks').get('a')).toBe(1);
    });
  });
});
