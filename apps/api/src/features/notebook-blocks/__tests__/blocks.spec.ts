import * as Y from 'yjs';
import { BadRequestException } from '@nestjs/common';
import { getBlocks, getLayout } from '@sandworm/editor';
import { addBlocks } from '../../collaboration/yjs/shared-doc/ai-blocks';
import type { BlockInput, BlockKind } from '../blocks/block-definition';
import { getDefinition, summarizeBlock } from '../blocks/registry';

type Input = BlockInput & { kind: BlockKind };

const create = (doc: Y.Doc, inputs: Input[], position?: number) =>
  addBlocks(doc, inputs.map(({ kind, ...input }) => getDefinition(kind).toSpec(input)), position);

describe('notebook block definitions', () => {
  it('creates blocks of each kind and summarizes them', () => {
    const doc = new Y.Doc();
    const ids = create(doc, [
      { kind: 'markdown', title: 'Intro', source: '# Hello' },
      { kind: 'sql', title: 'Daily txs', source: 'select 1', dataSource: 'dune', dataframeName: 'daily' },
      { kind: 'python', source: 'print(1)' },
    ]);
    const blocks = getBlocks(doc);

    expect(ids).toHaveLength(3);
    expect(ids.map(id => summarizeBlock(blocks.get(id)!, blocks))).toEqual([
      { id: ids[0], kind: 'markdown', title: 'Intro' },
      { id: ids[1], kind: 'sql', title: 'Daily txs', dataframeName: 'daily', dataSourceId: 'dune-datasource' },
      { id: ids[2], kind: 'python', title: '' },
    ]);
  });

  it('inserts at the given position and clamps past the end', () => {
    const doc = new Y.Doc();
    const [first, second] = create(doc, [{ kind: 'python' }, { kind: 'python' }]);
    const [inserted] = create(doc, [{ kind: 'markdown' }], 1);
    const [appended] = create(doc, [{ kind: 'markdown' }], 99);

    const order = getLayout(doc).toArray().map(group => group.getAttribute('current')?.getAttribute('id'));
    expect(order).toEqual([first, inserted, second, appended]);
  });

  it('rejects an unknown data source', () => {
    expect(() => getDefinition('sql').toSpec({ dataSource: 'postgres' })).toThrow(BadRequestException);
  });
});
