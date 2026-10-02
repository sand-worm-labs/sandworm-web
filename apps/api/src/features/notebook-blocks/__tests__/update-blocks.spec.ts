// NotebookDocService transitively drags in YjsDocumentService -> the document
// executors -> an ESM-only dependency (aggregate-error); stub it so jest never
// loads that chain. The tests hand the service a fake of it anyway.
jest.mock('../notebook-doc.service', () => ({ NotebookDocService: jest.fn() }));

import * as Y from 'yjs';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import {
  ExecutionQueue,
  addDashboardItemToYDashboard,
  getBlocks,
  getDashboard,
  getDataframes,
  getDateInputAttributes,
  getDropdownInputAttributes,
  getInputAttributes,
  getLayout,
  getPowerToolboxAttributes,
  getPythonAttributes,
  getSQLAttributes,
  getTabsFromBlockGroup,
  getVisualizationV2Attributes,
  groupBlocks,
  type YBlock,
} from '@sandworm/editor';
import { addBlocks } from '../../collaboration/yjs/shared-doc/ai-blocks';
import type { BlockInput, BlockKind, BlockPatch } from '../blocks/block-definition';
import { getDefinition, getDefinitionFor } from '../blocks/registry';
import { NotebookBlocksService } from '../notebook-blocks.service';

type Input = BlockInput & { kind: BlockKind };

const ref = { userId: 'user', workspaceId: 'workspace', documentId: 'document' };
const MISSING = '5f0c6f2e-4a0b-4d0e-9a53-0d6a1f1f7c10';

function setup(inputs: Input[]) {
  const ydoc = new Y.Doc();
  const ids = addBlocks(ydoc, inputs.map(({ kind, ...input }) => getDefinition(kind).toSpec(input)));
  const docs = { use: jest.fn((_ref, _access, work) => Promise.resolve(work({ ydoc }))) };
  const tools = {
    getTools: jest.fn(async () => [
      { toolId: 'defi.tvl', params: [{ key: 'chain', label: 'Chain', type: 'chain', required: true }] },
    ]),
  };
  const service = new NotebookBlocksService(docs as any, tools as any);
  const block = (index: number) => getBlocks(ydoc).get(ids[index]!)! as Y.XmlElement<any>;
  return { ydoc, ids, docs, tools, service, block };
}

const patch = (block: YBlock, change: BlockPatch) => getDefinitionFor(block)!.update(block, block.doc!.getMap('blocks'), change);
const order = (ydoc: Y.Doc) => getLayout(ydoc).toArray().map(group => group.getAttribute('current')?.getAttribute('id'));

describe('block definitions: update', () => {
  it('rewrites the text of code and markdown cells and keeps what was not sent', () => {
    const { block } = setup([
      { kind: 'python', title: 'Load', source: 'x = 1' },
      { kind: 'markdown', source: '# Old' },
    ]);

    patch(block(0), { source: 'x = 2\nprint(x)' });
    patch(block(1), { title: 'Intro', source: '# New' });

    expect(getPythonAttributes(block(0)).source.toString()).toBe('x = 2\nprint(x)');
    expect(block(0).getAttribute('title')).toBe('Load');
    expect(block(1).getAttribute('source').toString()).toBe('# New');
    expect(block(1).getAttribute('title')).toBe('Intro');
  });

  it('can empty a cell', () => {
    const { block } = setup([{ kind: 'python', source: 'x = 1' }]);

    patch(block(0), { source: '' });

    expect(getPythonAttributes(block(0)).source.toString()).toBe('');
  });

  it('rebuilds rich text from the new content', () => {
    const { block } = setup([{ kind: 'rich_text', source: '# Heading\nfirst' }]);

    patch(block(0), { source: 'second' });

    const text = block(0).getAttribute('content').toString();
    expect(text).toContain('second');
    expect(text).not.toContain('first');
    expect(text).not.toContain('Heading');
  });

  it('changes a SQL cell\'s query and data source', () => {
    const { block, ydoc } = setup([{ kind: 'sql', source: 'select 1', dataSource: 'dune', dataframeName: 'daily' }]);

    patch(block(0), { source: 'select 2', dataSource: 'duckdb' });

    const attrs = getSQLAttributes(block(0), getBlocks(ydoc));
    expect(attrs.source.toString()).toBe('select 2');
    expect(attrs.dataSourceId).toBe('duckdb');
    expect(attrs.dataframeName.value).toBe('daily');
  });

  it('resets a SQL cell\'s result when its dataframe is renamed', () => {
    const { block, ydoc, ids } = setup([{ kind: 'sql', source: 'select 1', dataframeName: 'daily' }]);
    block(0).setAttribute('result', { type: 'success', columns: [], rows: [], count: 0 });
    getDataframes(ydoc).set('daily', { id: ids[0]!, name: 'daily', columns: [], blockId: ids[0]!, updatedAt: '' } as any);

    patch(block(0), { dataframeName: 'weekly' });

    const attrs = getSQLAttributes(block(0), getBlocks(ydoc));
    expect(attrs.dataframeName).toEqual({ value: 'weekly', newValue: 'weekly' });
    expect(attrs.result).toBeNull();
    expect(getDataframes(ydoc).has('daily')).toBe(false);
  });

  it('keeps a SQL cell\'s result when the name sent is the one it has', () => {
    const { block, ydoc } = setup([{ kind: 'sql', source: 'select 1', dataframeName: 'daily' }]);
    block(0).setAttribute('result', { type: 'success', columns: [], rows: [], count: 0 });

    patch(block(0), { dataframeName: 'daily' });

    expect(getSQLAttributes(block(0), getBlocks(ydoc)).result).not.toBeNull();
  });

  it('rejects a dataframe name that is taken or not a valid variable name', () => {
    const { block } = setup([
      { kind: 'sql', dataframeName: 'daily' },
      { kind: 'sql', dataframeName: 'weekly' },
    ]);

    expect(() => patch(block(0), { dataframeName: 'weekly' })).toThrow(/already stores its result as "weekly"/);
    expect(() => patch(block(0), { dataframeName: '2fast' })).toThrow(/not a valid dataframe name/);
  });

  it('changes nothing when part of a SQL patch is invalid', () => {
    const { block, ydoc } = setup([{ kind: 'sql', title: 'Old', source: 'select 1', dataframeName: 'daily' }]);

    expect(() => patch(block(0), { title: 'New', source: 'select 2', dataSource: 'postgres' })).toThrow(BadRequestException);

    const attrs = getSQLAttributes(block(0), getBlocks(ydoc));
    expect(attrs.source.toString()).toBe('select 1');
    expect(block(0).getAttribute('title')).toBe('Old');
  });

  it('rebinds charts and pivot tables to another dataframe', () => {
    const { block } = setup([
      { kind: 'visualization', dataframeName: 'daily' },
      { kind: 'pivot_table', dataframeName: 'daily' },
    ]);

    patch(block(0), { dataframeName: 'weekly' });
    patch(block(1), { dataframeName: 'weekly' });

    expect(getVisualizationV2Attributes(block(0)).input.dataframeName).toBe('weekly');
    expect(block(1).getAttribute('dataframeName')).toBe('weekly');
  });

  it('sets the label and value of inputs', () => {
    const { block, ydoc } = setup([
      { kind: 'input', title: 'Wallet', source: '0xabc' },
      { kind: 'dropdown_input', title: 'Chain', source: 'base\nethereum' },
      { kind: 'date_input', title: 'Since', source: '2025/03/01' },
    ]);
    const blocks = getBlocks(ydoc);

    patch(block(0), { title: 'Address', source: ' 0xdef ' });
    patch(block(1), { source: 'ethereum\nsolana' });
    patch(block(2), { title: 'From', source: '2026/01/15' });

    const input = getInputAttributes(block(0), blocks);
    expect(input.label).toBe('Address');
    expect(input.value).toMatchObject({ value: '0xdef', newValue: '0xdef' });

    const dropdown = getDropdownInputAttributes(block(1), blocks);
    expect(dropdown.options).toEqual(['ethereum', 'solana']);
    // "base" was selected and is gone, so the first remaining option takes over.
    expect(dropdown.value.newValue).toBe('ethereum');

    const date = getDateInputAttributes(block(2), blocks);
    expect(date.value).toMatchObject({ year: 2026, month: 1, day: 15 });
    expect(date.label.toString()).toBe('From');
  });

  it('keeps a dropdown selection that is still among the options', () => {
    const { block, ydoc } = setup([{ kind: 'dropdown_input', source: 'base\nethereum' }]);

    patch(block(0), { source: 'solana\nbase' });

    expect(getDropdownInputAttributes(block(0), getBlocks(ydoc)).value.newValue).toBe('base');
  });

  it('rejects input values it cannot use, without changing the label', () => {
    const { block, ydoc } = setup([
      { kind: 'dropdown_input', title: 'Chain', source: 'base' },
      { kind: 'date_input', title: 'Since', source: '2025/03/01' },
    ]);

    expect(() => patch(block(0), { title: 'Network', source: ' \n ' })).toThrow(/at least one option/);
    expect(() => patch(block(1), { title: 'From', source: 'tomorrow' })).toThrow(/use YYYY\/MM\/DD/);

    expect(getDropdownInputAttributes(block(0), getBlocks(ydoc)).label).toBe('Chain');
    expect(getDateInputAttributes(block(1), getBlocks(ydoc)).label.toString()).toBe('Since');
  });

  it('rejects fields a kind has no use for', () => {
    const { block } = setup([{ kind: 'python' }, { kind: 'visualization' }]);

    expect(() => patch(block(0), { dataSource: 'dune' })).toThrow('python cells have no dataSource to change. They accept: title, source');
    expect(() => patch(block(1), { source: 'x' })).toThrow(/visualization cells have no source/);
  });
});

describe('NotebookBlocksService.updateBlock', () => {
  it('applies the patch as an editor and returns the block', async () => {
    const { service, ids, docs, block } = setup([{ kind: 'python', title: 'Load', source: 'x = 1' }]);

    const summary = await service.updateBlock(ref, ids[0]!, { source: 'x = 2' });

    expect(docs.use).toHaveBeenCalledWith(ref, 'editor', expect.any(Function));
    expect(summary).toEqual({ id: ids[0], kind: 'python', title: 'Load' });
    expect(getPythonAttributes(block(0)).source.toString()).toBe('x = 2');
  });

  it('refuses an empty patch before touching the notebook', async () => {
    const { service, ids, docs } = setup([{ kind: 'python' }]);

    await expect(service.updateBlock(ref, ids[0]!, {})).rejects.toThrow(/Nothing to change/);
    expect(docs.use).not.toHaveBeenCalled();
  });

  it('answers 404 for a cell that is not in the notebook', async () => {
    const { service } = setup([{ kind: 'python' }]);

    await expect(service.updateBlock(ref, MISSING, { source: 'x' })).rejects.toThrow(NotFoundException);
  });

  it('refuses to change a cell that is queued or running', async () => {
    const { service, ids, ydoc, block } = setup([{ kind: 'python', source: 'x = 1' }]);
    const queue = ExecutionQueue.fromYjs(ydoc);
    queue.enqueueBlocks([ids[0]!], null);

    await expect(service.updateBlock(ref, ids[0]!, { source: 'x = 2' })).rejects.toThrow(
      new ConflictException('This cell is queued to run. Wait for the run to finish first'),
    );
    [...queue.getCurrentBatch()!][0]!.setRunning();
    await expect(service.updateBlock(ref, ids[0]!, { source: 'x = 2' })).rejects.toThrow(/This cell is running/);

    expect(getPythonAttributes(block(0)).source.toString()).toBe('x = 1');
  });

  it('checks power toolbox inputs against the tool before storing them', async () => {
    const { service, ids, block } = setup([{ kind: 'power_toolbox', toolId: 'defi.tvl', inputs: { chain: 'base' } }]);

    await expect(service.updateBlock(ref, ids[0]!, { inputs: { bogus: 1 } })).rejects.toThrow(/no input\(s\) bogus/);
    expect(getPowerToolboxAttributes(block(0)).inputs).toEqual({ chain: 'base' });

    await service.updateBlock(ref, ids[0]!, { inputs: { chain: 'ethereum' } });
    expect(getPowerToolboxAttributes(block(0)).inputs).toEqual({ chain: 'ethereum' });
  });
});

describe('NotebookBlocksService.deleteBlock', () => {
  it('removes the cell and leaves the others in order', async () => {
    const { service, ids, ydoc, docs } = setup([{ kind: 'python' }, { kind: 'markdown' }, { kind: 'python' }]);

    await service.deleteBlock(ref, ids[1]!, false);

    expect(docs.use).toHaveBeenCalledWith(ref, 'editor', expect.any(Function));
    expect(order(ydoc)).toEqual([ids[0], ids[2]]);
    expect(getBlocks(ydoc).has(ids[1]!)).toBe(false);
  });

  it('takes a cell out of a group it shares with other tabs', async () => {
    const { service, ids, ydoc } = setup([{ kind: 'python' }, { kind: 'python' }]);
    const blocks = getBlocks(ydoc);
    const layout = getLayout(ydoc);
    // Move the second cell into the first cell's group, as dragging it onto a tab does.
    groupBlocks(layout, layout.get(1).getAttribute('id')!, ids[1]!, layout.get(0).getAttribute('id')!);
    expect(layout.length).toBe(1);

    await service.deleteBlock(ref, ids[0]!, false);

    expect(layout.length).toBe(1);
    expect(getTabsFromBlockGroup(layout.get(0), blocks).map(tab => tab.blockId)).toEqual([ids[1]]);
    expect(blocks.has(ids[0]!)).toBe(false);
  });

  it('only removes a cell shown on the dashboard when told to', async () => {
    const { service, ids, ydoc } = setup([{ kind: 'python' }]);
    addDashboardItemToYDashboard(getDashboard(ydoc), { id: 'item', blockId: ids[0]!, x: 0, y: 0, w: 1, h: 1 } as any);

    await expect(service.deleteBlock(ref, ids[0]!, false)).rejects.toThrow(/shown on the dashboard/);
    expect(getBlocks(ydoc).has(ids[0]!)).toBe(true);

    await service.deleteBlock(ref, ids[0]!, true);
    expect(getBlocks(ydoc).has(ids[0]!)).toBe(false);
    expect(getDashboard(ydoc).size).toBe(0);
  });

  it('answers 404 for a cell that is not in the notebook', async () => {
    const { service, ydoc, ids } = setup([{ kind: 'python' }]);

    await expect(service.deleteBlock(ref, MISSING, false)).rejects.toThrow(NotFoundException);
    expect(order(ydoc)).toEqual([ids[0]]);
  });

  it('refuses to delete a cell that is queued or running', async () => {
    const { service, ids, ydoc } = setup([{ kind: 'python' }]);
    ExecutionQueue.fromYjs(ydoc).enqueueBlocks([ids[0]!], null);

    await expect(service.deleteBlock(ref, ids[0]!, false)).rejects.toThrow(ConflictException);
    expect(getBlocks(ydoc).has(ids[0]!)).toBe(true);
  });
});
