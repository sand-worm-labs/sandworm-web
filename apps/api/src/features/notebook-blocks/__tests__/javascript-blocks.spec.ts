// NotebookDocService transitively drags in an ESM-only dependency jest can't
// load (see notebook-run.service.spec.ts); the tests hand the service a fake.
jest.mock('../notebook-doc.service', () => ({ NotebookDocService: jest.fn() }));

import * as Y from 'yjs';
import { BadRequestException } from '@nestjs/common';
import { BlockType, getBlocks, isJavaScriptBlock } from '@sandworm/editor';
import { addBlocks } from '../../collaboration/yjs/shared-doc/ai-blocks';
import { getDefinition, summarizeBlock } from '../blocks/registry';
import { NotebookBlocksService } from '../notebook-blocks.service';

const REF = { userId: 'user', workspaceId: 'workspace', documentId: 'document' };

// The service over a notebook that does, or doesn't, run in the browser. The
// fake answers assertRunsInBrowser the way NotebookDocService does.
function serviceFor(notebook: { runsInBrowser: boolean }) {
  const ydoc = new Y.Doc();
  const docs = {
    use: jest.fn((_ref, _access, work) => Promise.resolve(work({ ydoc }))),
    assertRunsInBrowser: jest.fn(async () => {
      if (!notebook.runsInBrowser) throw new BadRequestException('JavaScript cells only run in the browser');
    }),
  };
  const service = new NotebookBlocksService(docs as any, { getTools: async () => [] } as any);
  return { service, ydoc, docs };
}

describe('javascript cells', () => {
  it('are created with their source and summarized as javascript', () => {
    const doc = new Y.Doc();
    const [id] = addBlocks(doc, [getDefinition('javascript').toSpec({ title: 'Candles', source: 'sw.root.textContent = "hi"' })]);
    const blocks = getBlocks(doc);
    const block = blocks.get(id!)!;

    expect(block.getAttribute('type')).toBe(BlockType.JavaScript);
    expect(isJavaScriptBlock(block)).toBe(true);
    expect(String(block.getAttribute('source' as never))).toBe('sw.root.textContent = "hi"');
    expect(summarizeBlock(block, blocks)).toEqual({ id, kind: 'javascript', title: 'Candles' });
  });

  it('take a new title and source, and nothing else', () => {
    const doc = new Y.Doc();
    const [id] = addBlocks(doc, [getDefinition('javascript').toSpec({ source: 'let a = 1' })]);
    const blocks = getBlocks(doc);
    const block = blocks.get(id!)!;

    getDefinition('javascript').update(block, blocks, { title: 'Chart', source: 'let a = 2' });
    expect(String(block.getAttribute('source' as never))).toBe('let a = 2');
    expect(block.getAttribute('title')).toBe('Chart');

    expect(() => getDefinition('javascript').update(block, blocks, { dataSource: 'dune' })).toThrow(BadRequestException);
  });

  it('can be added to a notebook that runs in the browser', async () => {
    const { service, ydoc } = serviceFor({ runsInBrowser: true });

    const [cell] = await service.createBlocks(REF, { blocks: [{ kind: 'javascript', source: 'sw.root' }] });

    expect(cell!.kind).toBe('javascript');
    expect(getBlocks(ydoc).size).toBe(1);
  });

  it('are refused in a cloud notebook, and nothing in the request is added', async () => {
    const { service, ydoc, docs } = serviceFor({ runsInBrowser: false });

    await expect(
      service.createBlocks(REF, {
        blocks: [
          { kind: 'python', source: 'x = 1' },
          { kind: 'javascript', source: 'sw.root' },
        ],
      }),
    ).rejects.toThrow(/JavaScript cells only run in the browser/);
    expect(getBlocks(ydoc).size).toBe(0);
    expect(docs.use).not.toHaveBeenCalled();
  });

  it('do not stop other cells being added to a cloud notebook', async () => {
    const { service, ydoc, docs } = serviceFor({ runsInBrowser: false });

    await service.createBlocks(REF, { blocks: [{ kind: 'python', source: 'x = 1' }] });

    expect(getBlocks(ydoc).size).toBe(1);
    expect(docs.assertRunsInBrowser).not.toHaveBeenCalled();
  });
});
