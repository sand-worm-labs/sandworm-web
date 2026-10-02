import * as Y from 'yjs';
import { BadRequestException } from '@nestjs/common';
import { getBlocks, getLayout, type ParamDefinition } from '@sandworm/editor';
import { addBlocks } from '../../collaboration/yjs/shared-doc/ai-blocks';
import type { BlockInput, BlockKind } from '../blocks/block-definition';
import { validatePowerToolInputs } from '../blocks/power-toolbox.block';
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

  it('creates every other kind', () => {
    const doc = new Y.Doc();
    const ids = create(doc, [
      { kind: 'rich_text', title: 'Notes', source: '# Heading' },
      { kind: 'visualization', title: 'Chart', dataframeName: 'daily' },
      { kind: 'pivot_table', title: 'Pivot', dataframeName: 'daily' },
      { kind: 'input', title: 'Wallet', source: '0xabc' },
      { kind: 'dropdown_input', title: 'Chain', source: 'base\nethereum' },
      { kind: 'date_input', title: 'Since', source: '2025/03/01' },
      { kind: 'power_toolbox', title: 'Tool', toolId: 'some_tool', inputs: { chain: 'base' } },
    ]);
    const blocks = getBlocks(doc);
    const kinds = ids.map(id => summarizeBlock(blocks.get(id)!, blocks).kind);

    expect(kinds).toEqual(['rich_text', 'visualization', 'pivot_table', 'input', 'dropdown_input', 'date_input', 'power_toolbox']);
    expect(summarizeBlock(blocks.get(ids[6]!)!, blocks)).toMatchObject({ toolId: 'some_tool' });
  });

  it('requires a toolId for power toolbox blocks', () => {
    expect(() => getDefinition('power_toolbox').toSpec({})).toThrow(BadRequestException);
  });
});

describe('validatePowerToolInputs', () => {
  const params = [
    { key: 'chain', label: 'Chain', type: 'chain', required: true },
    { key: 'limit', label: 'Limit', type: 'number', required: true, default: 10 },
    { key: 'note', label: 'Note', type: 'text', required: false },
  ] as ParamDefinition[];

  it('accepts inputs that cover every required param without a default', () => {
    expect(() => validatePowerToolInputs('t', params, { chain: 'base' })).not.toThrow();
  });

  it('rejects a missing required input', () => {
    expect(() => validatePowerToolInputs('t', params, {})).toThrow(/missing required input\(s\): chain/);
  });

  it('rejects an input the tool does not declare', () => {
    expect(() => validatePowerToolInputs('t', params, { chain: 'base', bogus: 1 })).toThrow(/no input\(s\) bogus/);
  });
});
