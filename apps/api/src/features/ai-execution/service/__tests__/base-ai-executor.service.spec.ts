import * as Y from 'yjs';
import { BaseAiExecutorService } from '../base-ai-executor.service';
import { BlockActionEventNames } from '@/core/events/block-action.events';
import { GeneratorContext } from '@/infrastructure/ai/types/generator.types';

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
  const eventEmitter = { emit: jest.fn() } as any;

  const service = new TestAiExecutorService(yjsDocumentService, persistorFactory, eventEmitter);
  return { service, yjsDocumentService, persistorFactory, eventEmitter };
}

const ctx: GeneratorContext = {
  user_id: 'user-1',
  workspace_id: 'ws-1',
  document_id: 'doc-1',
  chat_id: 'chat-1',
};

// Y.XmlElement attributes only round-trip once the element is integrated
// into a doc (a detached element silently no-ops setAttribute/getAttribute).
function makeAttachedBlock(): Y.XmlElement {
  const doc = new Y.Doc();
  const fragment = doc.getXmlFragment('blocks');
  const block = new Y.XmlElement('block');
  fragment.insert(0, [block]);
  return block;
}

describe('BaseAiExecutorService', () => {
  describe('emitBlockAction', () => {
    it('emits a BLOCK_ACTION event built from the block attributes and context', () => {
      const { service, eventEmitter } = makeService();
      const block = makeAttachedBlock();
      block.setAttribute('id', 'block-1');
      block.setAttribute('title', 'My Block');

      (service as any).emitBlockAction('created', 'SQL', block, ctx);

      expect(eventEmitter.emit).toHaveBeenCalledWith(BlockActionEventNames.BLOCK_ACTION, {
        action: 'created',
        blockType: 'SQL',
        blockId: 'block-1',
        blockTitle: 'My Block',
        chatId: 'chat-1',
      });
    });

    it('falls back to empty strings when the block has no id/title attributes', () => {
      const { service, eventEmitter } = makeService();
      const block = makeAttachedBlock();

      (service as any).emitBlockAction('edited', 'Python', block, ctx);

      expect(eventEmitter.emit).toHaveBeenCalledWith(BlockActionEventNames.BLOCK_ACTION, {
        action: 'edited',
        blockType: 'Python',
        blockId: '',
        blockTitle: '',
        chatId: 'chat-1',
      });
    });
  });

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
