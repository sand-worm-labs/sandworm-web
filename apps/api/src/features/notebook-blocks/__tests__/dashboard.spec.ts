// See update-blocks.spec.ts: the doc service drags in an ESM-only chain, and
// the tests hand the service a fake of it anyway.
jest.mock('../notebook-doc.service', () => ({ NotebookDocService: jest.fn() }));

import * as Y from 'yjs';
import { BadRequestException } from '@nestjs/common';
import { BlockType, getBlocks, getDashboard, getLayout, yDashboardToRecord } from '@sandworm/editor';
import { addBlocks } from '../../collaboration/yjs/shared-doc/ai-blocks';
import type { BlockInput, BlockKind } from '../blocks/block-definition';
import { getDefinition } from '../blocks/registry';
import { NotebookDashboardService } from '../notebook-dashboard.service';

type Input = BlockInput & { kind: BlockKind };

const ref = { userId: 'user', workspaceId: 'workspace', documentId: 'document' };

function setup(inputs: Input[]) {
  const ydoc = new Y.Doc();
  const ids = addBlocks(ydoc, inputs.map(({ kind, ...input }) => getDefinition(kind).toSpec(input)));
  // Async like the real one, so a throw inside `work` is a rejection.
  const docs = { use: jest.fn(async (_ref, _access, work) => work({ ydoc })) };
  const service = new NotebookDashboardService(docs as any);
  const markRun = (id: string, result: unknown[] = []) => {
    const block = getBlocks(ydoc).get(id)! as Y.XmlElement<any>;
    block.setAttribute('lastQueryTime', '2026-10-05T00:00:00Z');
    block.setAttribute('result', result as any);
  };
  return { ydoc, ids, docs, service, markRun };
}

const CELLS: Input[] = [
  { kind: 'python', title: 'Total TVL' },
  { kind: 'python', title: 'TVL by chain' },
  { kind: 'python', title: 'Share by category' },
  { kind: 'markdown', source: '## Notes\nSources below' },
  { kind: 'visualization', title: 'Builder chart' },
];

describe('NotebookDashboardService.setDashboard', () => {
  it('lays rows out on the grid and describes what it drew', async () => {
    const { service, ids, markRun } = setup(CELLS);
    ids.slice(0, 3).forEach(id => markRun(id));

    const layout = await service.setDashboard(ref, {
      rows: [
        { height: 5, tiles: [{ cellId: ids[0]! }] },
        { height: 8, tiles: [{ cellId: ids[1]!, width: 14 }, { cellId: ids[2]!, width: 10 }] },
      ],
    });

    expect(layout.totalRows).toBe(13);
    expect(layout.rows.map(r => [r.y, r.height, r.tiles?.map(t => [t.title, t.x, t.width])])).toEqual([
      [0, 5, [['Total TVL', 0, 24]]],
      [5, 8, [['TVL by chain', 0, 14], ['Share by category', 14, 10]]],
    ]);
    expect(layout.rows[1]!.tiles![0]).toMatchObject({ kind: 'python', approxPixels: { width: 670, height: 442 } });
    expect(layout.warnings).toEqual([]);
  });

  it('writes items the editor reads back, with the block minimums', async () => {
    const { service, ydoc, ids } = setup(CELLS);

    await service.setDashboard(ref, { rows: [{ tiles: [{ cellId: ids[0]! }, { cellId: ids[3]! }] }] });

    const items = Object.values(yDashboardToRecord(getDashboard(ydoc))).sort((a, b) => a.x - b.x);
    expect(items.map(i => [i.blockId, i.x, i.y, i.w, i.h, i.minW, i.minH])).toEqual([
      [ids[0], 0, 0, 12, 8, 3, 2],
      [ids[3], 12, 0, 12, 8, 2, 2],
    ]);
  });

  it('replaces the dashboard: cells left out leave it but stay in the notebook', async () => {
    const { service, ydoc, ids } = setup(CELLS);
    await service.setDashboard(ref, { rows: [{ tiles: [{ cellId: ids[0]! }, { cellId: ids[1]! }] }] });
    const before = Object.values(yDashboardToRecord(getDashboard(ydoc)));

    await service.setDashboard(ref, { rows: [{ tiles: [{ cellId: ids[1]! }] }] });

    const after = Object.values(yDashboardToRecord(getDashboard(ydoc)));
    expect(after.map(i => i.blockId)).toEqual([ids[1]]);
    expect(after[0]!.id).toBe(before.find(i => i.blockId === ids[1])!.id);
    expect(getBlocks(ydoc).has(ids[0]!)).toBe(true);
    expect(getLayout(ydoc).length).toBe(CELLS.length);
  });

  it('an empty layout clears the dashboard', async () => {
    const { service, ydoc, ids } = setup(CELLS);
    await service.setDashboard(ref, { rows: [{ tiles: [{ cellId: ids[0]! }] }] });

    const layout = await service.setDashboard(ref, { rows: [] });

    expect(getDashboard(ydoc).size).toBe(0);
    expect(layout).toMatchObject({ rows: [], totalRows: 0 });
  });

  describe('headings', () => {
    it('are dashboard-only heading blocks, not notebook cells', async () => {
      const { service, ydoc, ids } = setup(CELLS);

      const layout = await service.setDashboard(ref, {
        rows: [{ heading: 'Overview', tiles: [{ cellId: ids[0]! }] }],
      });

      expect(layout.rows.map(r => [r.y, r.height, r.heading, r.tiles?.length])).toEqual([
        [0, 1, 'Overview', undefined],
        [1, 8, undefined, 1],
      ]);
      const headings = [...getBlocks(ydoc).values()].filter(b => b.getAttribute('type') === BlockType.DashboardHeader);
      expect(headings).toHaveLength(1);
      expect((headings[0] as Y.XmlElement<any>).getAttribute('content')).toBe('Overview');
      expect(getLayout(ydoc).length).toBe(CELLS.length);
    });

    it('are deleted when a later layout drops them, rather than piling up', async () => {
      const { service, ydoc, ids } = setup(CELLS);
      await service.setDashboard(ref, { rows: [{ heading: 'Old', tiles: [{ cellId: ids[0]! }] }] });

      await service.setDashboard(ref, { rows: [{ heading: 'New', tiles: [{ cellId: ids[0]! }] }] });

      const contents = [...getBlocks(ydoc).values()]
        .filter(b => b.getAttribute('type') === BlockType.DashboardHeader)
        .map(b => (b as Y.XmlElement<any>).getAttribute('content'));
      expect(contents).toEqual(['New']);
    });
  });

  describe('a layout that cannot be drawn', () => {
    it('is refused whole, naming every problem, and leaves the dashboard as it was', async () => {
      const { service, ydoc, ids } = setup(CELLS);
      await service.setDashboard(ref, { rows: [{ tiles: [{ cellId: ids[0]! }] }] });

      const bad = service.setDashboard(ref, {
        rows: [
          { tiles: [{ cellId: ids[1]!, width: 10 }, { cellId: ids[2]!, width: 8 }] },
          { tiles: [{ cellId: ids[4]! }] },
        ],
      });

      await expect(bad).rejects.toThrow(BadRequestException);
      await expect(bad).rejects.toThrow(/Row 1: widths add up to 18[\s\S]*Row 2: "Builder chart" \(visualization\) cannot be shown/);
      expect(Object.values(yDashboardToRecord(getDashboard(ydoc))).map(i => i.blockId)).toEqual([ids[0]]);
    });

    it('is refused for a cell that is not in the notebook, even if the block exists', async () => {
      const { service, ydoc, ids } = setup(CELLS);
      await service.setDashboard(ref, { rows: [{ heading: 'Overview' }] });
      const headingId = Object.values(yDashboardToRecord(getDashboard(ydoc)))[0]!.blockId;

      await expect(service.setDashboard(ref, { rows: [{ tiles: [{ cellId: headingId }] }] })).rejects.toThrow(
        `no cell with id ${headingId}`,
      );
      await expect(service.setDashboard(ref, { rows: [{ tiles: [{ cellId: ids[0]! }] }] })).resolves.toBeDefined();
    });
  });

  it('needs edit access to the notebook', async () => {
    const { service, docs } = setup(CELLS);

    await service.setDashboard(ref, { rows: [] });
    await service.getDashboard(ref);

    expect(docs.use.mock.calls.map(call => call[1])).toEqual(['editor', 'member']);
  });
});

describe('NotebookDashboardService.getDashboard', () => {
  it('reads back the layout that was set', async () => {
    const { service, ids } = setup(CELLS);
    const set = await service.setDashboard(ref, {
      rows: [{ heading: 'Overview', tiles: [{ cellId: ids[0]! }, { cellId: ids[3]! }] }],
    });

    expect(await service.getDashboard(ref)).toEqual(set);
  });

  it('is empty for a notebook with no dashboard', async () => {
    const { service } = setup(CELLS);

    expect(await service.getDashboard(ref)).toMatchObject({ rows: [], totalRows: 0, warnings: [] });
  });
});

describe('warnings', () => {
  it('say which tiles have not been run, so they would show up empty', async () => {
    const { service, ids, markRun } = setup(CELLS);
    markRun(ids[1]!);

    const { warnings } = await service.setDashboard(ref, {
      rows: [{ tiles: [{ cellId: ids[0]! }, { cellId: ids[1]! }, { cellId: ids[3]! }] }],
    });

    expect(warnings).toEqual(['"Total TVL" has not been run, so its tile is empty until run_notebook runs it']);
  });

  it('say when a chart is in a tile so small its text would be drawn tiny', async () => {
    const { service, ids, markRun } = setup(CELLS);
    markRun(ids[0]!, [{ type: 'plotly', data: [], layout: {} }]);
    markRun(ids[1]!, [{ type: 'plotly', data: [], layout: {} }]);
    markRun(ids[2]!, [{ type: 'plotly', data: [], layout: { width: 280, height: 160 } }]);

    const { warnings } = await service.setDashboard(ref, {
      rows: [
        { height: 4, tiles: [{ cellId: ids[0]!, width: 8 }, { cellId: ids[2]!, width: 8 }, { cellId: ids[1]!, width: 8 }] },
      ],
    });

    // The two charts made at the default 700x450 are squeezed; the one made at
    // the size of its tile is not.
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toMatch(/"Total TVL" is a chart made at 700x450px in a tile of about 380x\d+px/);
    expect(warnings[0]).toMatch(/fig\.update_layout\(width=380, height=\d+\)/);
    expect(warnings[1]).toMatch(/"TVL by chain"/);
  });

  it('stay quiet for a chart that has room', async () => {
    const { service, ids, markRun } = setup(CELLS);
    markRun(ids[0]!, [{ type: 'plotly', data: [], layout: {} }]);

    const { warnings } = await service.setDashboard(ref, { rows: [{ height: 9, tiles: [{ cellId: ids[0]! }] }] });

    expect(warnings).toEqual([]);
  });
});
