// YjsDocumentService transitively drags in DocumentExecutorService -> the
// visualization block executor -> an ESM-only dependency; stub it via an
// explicit factory so jest never loads the real module chain.
jest.mock('@/features/collaboration/yjs/yjs-document.service', () => ({
  YjsDocumentService: jest.fn(),
}));

import * as Y from 'yjs';
import { writeDocTitle } from '@sandworm/editor';
import { TitleAiExecutorService } from '../title-ai-executor.service';

function makeService(ydoc: Y.Doc) {
  const yjsDocumentService = {
    getDocId: jest.fn(() => 'doc-1-null'),
    getYDocForUpdateAsync: jest.fn().mockResolvedValue({ ydoc }),
  } as any;
  const persistorFactory = { createDocumentPersistor: jest.fn() } as any;
  const eventEmitter = { emit: jest.fn() } as any;

  const service = new TitleAiExecutorService(yjsDocumentService, persistorFactory, eventEmitter);
  return { service, yjsDocumentService, persistorFactory, eventEmitter };
}

describe('TitleAiExecutorService', () => {
  describe('getTitle', () => {
    it('reads back a title previously written with writeDocTitle', async () => {
      const ydoc = new Y.Doc();
      writeDocTitle(ydoc, 'My Doc');
      const { service } = makeService(ydoc);

      await expect(service.getTitle('doc-1', 'ws-1')).resolves.toBe('My Doc');
    });

    it('returns an empty string when the document has no title fragment yet', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);

      await expect(service.getTitle('doc-1', 'ws-1')).resolves.toBe('');
    });

    it('returns an empty string when the title element exists but is empty', async () => {
      const ydoc = new Y.Doc();
      const fragment = ydoc.getXmlFragment('title');
      const titleEl = new Y.XmlElement('doc-title');
      fragment.insert(0, [titleEl]);
      const { service } = makeService(ydoc);

      await expect(service.getTitle('doc-1', 'ws-1')).resolves.toBe('');
    });
  });

  describe('updateTitle', () => {
    it('writes the title into the shared doc inside a transaction', async () => {
      const ydoc = new Y.Doc();
      const { service } = makeService(ydoc);

      await service.updateTitle('doc-1', 'ws-1', 'New Title');

      const fragment = ydoc.getXmlFragment('title');
      expect(fragment.length).toBe(1);
      expect((fragment.get(0) as Y.XmlElement).toString()).toContain('New Title');
    });

    it('overwrites a previously written title rather than appending to it', async () => {
      const ydoc = new Y.Doc();
      writeDocTitle(ydoc, 'Old Title');
      const { service } = makeService(ydoc);

      await service.updateTitle('doc-1', 'ws-1', 'New Title');

      const fragment = ydoc.getXmlFragment('title');
      expect(fragment.length).toBe(1);
      expect((fragment.get(0) as Y.XmlElement).toString()).toContain('New Title');
      expect((fragment.get(0) as Y.XmlElement).toString()).not.toContain('Old Title');
    });

    it('logs and swallows errors instead of throwing', async () => {
      const ydoc = new Y.Doc();
      const { service, yjsDocumentService } = makeService(ydoc);
      yjsDocumentService.getYDocForUpdateAsync.mockRejectedValue(new Error('boom'));
      const errorSpy = jest.spyOn((service as any).logger, 'error').mockImplementation(() => {});

      await expect(service.updateTitle('doc-1', 'ws-1', 'x')).resolves.toBeUndefined();

      expect(errorSpy).toHaveBeenCalledWith('updateTitle failed', expect.any(Error));
    });
  });
});
