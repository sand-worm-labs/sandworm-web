import {
  DASHBOARD_COLUMNS,
  DASHBOARD_REFERENCE_VIEWPORT,
  DASHBOARD_TITLE_STRIP_PX,
  BlockType,
  dashboardTileHasOwnTitle,
  dashboardTilePixels,
  getBlocks,
  getDashboard,
  getLayout,
  getPythonBlockResult,
  getResultStatus,
  getTabsFromBlockGroup,
  yDashboardToRecord,
  type DashboardCellInfo,
  type DashboardItem,
  type YBlock,
} from '@sandworm/editor';
import type * as Y from 'yjs';
import { summarizeBlock } from '../blocks/registry';

export type TileSummary = {
  cellId: string;
  title: string;
  kind: string;
  x: number;
  width: number;
  height: number;
  // Rough size on a 1300px screen, to size a chart's figure against.
  approxPixels: { width: number; height: number };
};

export type RowSummary = {
  y: number;
  height: number;
  heading?: string;
  tiles?: TileSummary[];
};

export type DashboardLayout = {
  columns: number;
  referenceScreenWidth: number;
  totalRows: number;
  rows: RowSummary[];
  warnings: string[];
};

// Ids of the blocks in the notebook itself, as opposed to the dashboard-only
// ones such as headings.
export function notebookCellIds(ydoc: Y.Doc): Set<string> {
  const blocks = getBlocks(ydoc);
  return new Set(
    getLayout(ydoc)
      .toArray()
      .flatMap(group => getTabsFromBlockGroup(group, blocks).map(tab => tab.blockId)),
  );
}

// Blocks differ in what they carry beyond the base attributes, which the
// YBlock union does not expose to a caller that handles them all.
const attr = (block: YBlock, name: string): unknown => (block as Y.XmlElement<Record<string, unknown>>).getAttribute(name);

const firstLine = (text: string) => text.split('\n').find(line => line.trim())?.trim().replace(/^#+\s*/, '') ?? '';

// What a person would call the cell: inputs have a label, markdown no title at all.
export function cellTitle(block: YBlock): string {
  const title = String(block.getAttribute('title') ?? '').trim();
  if (title) return title;
  const label = String(attr(block, 'label') ?? '').trim();
  if (label) return label;
  return firstLine(String(attr(block, 'source') ?? '')).slice(0, 60);
}

export function cellInfo(block: YBlock | undefined): DashboardCellInfo | undefined {
  if (!block) return undefined;
  return { type: block.getAttribute('type') as BlockType, title: cellTitle(block) };
}

// Plotly redraws a figure at the size of its tile and scales its text by how
// much smaller the tile is than the size the figure was made at (700x450 unless
// the code says otherwise), so a small tile gets small text.
const MIN_READABLE_SCALE = 0.75;
const BASE_FONT_PX = 12;
const DEFAULT_FIGURE = { width: 700, height: 450 };
// The tile leaves this much under the title strip, as in DashboardPlotOutput.
const PLOT_INSET_PX = 6;

function chartSizeWarning(block: YBlock, title: string, item: DashboardItem): string | undefined {
  if (block.getAttribute('type') !== BlockType.Python) return undefined;
  const figure = getPythonBlockResult(block as Y.XmlElement<any>).find(output => output.type === 'plotly');
  const layout = figure && 'layout' in figure ? (figure.layout as { width?: number; height?: number; font?: unknown } | null) : null;
  if (!figure || layout?.font) return undefined;

  const tile = dashboardTilePixels(item.w, item.h);
  const width = tile.width;
  const height = tile.height - (title && !dashboardTileHasOwnTitle(BlockType.Python) ? DASHBOARD_TITLE_STRIP_PX : 0) - PLOT_INSET_PX;
  const madeAt = { width: layout?.width ?? DEFAULT_FIGURE.width, height: layout?.height ?? DEFAULT_FIGURE.height };
  const scale = Math.min(width / madeAt.width, height / madeAt.height, 1);
  if (scale >= MIN_READABLE_SCALE) return undefined;

  return (
    `"${title || 'Untitled'}" is a chart made at ${madeAt.width}x${madeAt.height}px in a tile of about ${width}x${Math.round(height)}px, ` +
    `so it is drawn at ${Math.round(scale * 100)}% with text about ${Math.round(BASE_FONT_PX * scale)}px. ` +
    `Give the tile more room, or set the figure's size in the cell: fig.update_layout(width=${width}, height=${Math.round(height)})`
  );
}

function notRunWarning(block: YBlock, blocks: Y.Map<YBlock>, title: string): string | undefined {
  switch (block.getAttribute('type')) {
    case BlockType.Python:
    case BlockType.SQL:
    case BlockType.PivotTable:
      return getResultStatus(block, blocks) === 'idle'
        ? `"${title || 'Untitled'}" has not been run, so its tile is empty until run_notebook runs it`
        : undefined;
    default:
      return undefined;
  }
}

export function describeDashboard(ydoc: Y.Doc): DashboardLayout {
  const blocks = getBlocks(ydoc);
  const items = Object.values(yDashboardToRecord(getDashboard(ydoc))).sort((a, b) => a.y - b.y || a.x - b.x);
  const warnings: string[] = [];

  const byRow = new Map<number, RowSummary>();
  for (const item of items) {
    const block = blocks.get(item.blockId);
    if (!block) {
      warnings.push(`A tile at column ${item.x}, row ${item.y} shows a cell that no longer exists`);
      continue;
    }

    const row = byRow.get(item.y) ?? { y: item.y, height: 0 };
    byRow.set(item.y, row);
    row.height = Math.max(row.height, item.h);

    if (block.getAttribute('type') === BlockType.DashboardHeader) {
      row.heading = String(attr(block, 'content') ?? '');
      continue;
    }

    const title = cellTitle(block);
    const warning = notRunWarning(block, blocks, title) ?? chartSizeWarning(block, title, item);
    if (warning) warnings.push(warning);

    row.tiles = [
      ...(row.tiles ?? []),
      {
        cellId: item.blockId,
        title,
        kind: summarizeBlock(block, blocks).kind,
        x: item.x,
        width: item.w,
        height: item.h,
        approxPixels: dashboardTilePixels(item.w, item.h),
      },
    ];
  }

  const rows = [...byRow.values()];
  return {
    columns: DASHBOARD_COLUMNS,
    referenceScreenWidth: DASHBOARD_REFERENCE_VIEWPORT,
    totalRows: rows.reduce((max, row) => Math.max(max, row.y + row.height), 0),
    rows,
    warnings,
  };
}
