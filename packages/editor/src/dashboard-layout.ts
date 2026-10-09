import { BlockType, getPrettyTitle } from "./blocks/index.js";
import type { DashboardChrome } from "./dashboard.js";

// Grid numbers shared by the web view and the API, so a layout planned on the
// server matches what the view draws.

export const DASHBOARD_COLUMNS = 24;
export const DASHBOARD_MARGIN = 6;
export const DASHBOARD_ROW_HEIGHT = 50;

// A row is a fixed 50px, whatever the screen. It used to grow with the column
// width, which made every tile taller on a wide screen and, on a phone (one
// column as wide as the screen), made each row as tall as the screen is wide.
// A fixed row keeps a banner, a KPI card or a chart the height it was laid out at.
export function dashboardCellSize(
  containerWidth: number,
  columns: number = DASHBOARD_COLUMNS
): { cellWidth: number; cellHeight: number } {
  const cellWidth =
    (containerWidth - DASHBOARD_MARGIN * (columns + 1)) / columns;
  return { cellWidth, cellHeight: DASHBOARD_ROW_HEIGHT };
}

// What a layout is sized against. DashboardView pads the page by 64px a side
// from 1024px up and 4px inside that, so a 1300px screen leaves 1164px.
export const DASHBOARD_REFERENCE_VIEWPORT = 1300;
const DASHBOARD_PAGE_PADDING = 136;

export function dashboardTilePixels(
  w: number,
  h: number,
  viewportWidth: number = DASHBOARD_REFERENCE_VIEWPORT
): { width: number; height: number } {
  const { cellWidth, cellHeight } = dashboardCellSize(
    viewportWidth - DASHBOARD_PAGE_PADDING
  );
  return {
    width: Math.round(w * cellWidth + (w - 1) * DASHBOARD_MARGIN),
    height: Math.round(h * cellHeight + (h - 1) * DASHBOARD_MARGIN),
  };
}

export function getMins(t: BlockType): { minW: number; minH: number } {
  switch (t) {
    case BlockType.SQL:
      return { minW: 5, minH: 3 };
    case BlockType.Visualization:
    case BlockType.VisualizationV2:
    case BlockType.PivotTable:
      return { minW: 3, minH: 3 };
    case BlockType.Python:
    case BlockType.Input:
    case BlockType.DropdownInput:
    case BlockType.DateInput:
      return { minW: 3, minH: 2 };
    case BlockType.RichText:
    case BlockType.Markdown:
      return { minW: 2, minH: 2 };
    case BlockType.DashboardHeader:
      return { minW: 2, minH: 1 };
    case BlockType.FileUpload:
      return { minW: 0, minH: 0 };
    default:
      return { minW: 0, minH: 0 };
  }
}

export function getDefaults(t: BlockType): { minW: number; minH: number } {
  switch (t) {
    case BlockType.SQL:
    case BlockType.Visualization:
    case BlockType.VisualizationV2:
    case BlockType.PivotTable:
    case BlockType.Python:
      return { minW: 8, minH: 4 };
    case BlockType.Input:
    case BlockType.DropdownInput:
    case BlockType.DateInput:
      return { minW: 3, minH: 2 };
    case BlockType.RichText:
    case BlockType.Markdown:
      return { minW: 2, minH: 2 };
    case BlockType.DashboardHeader:
      return { minW: 4, minH: 1 };
    case BlockType.FileUpload:
      return { minW: 0, minH: 0 };
    default:
      return { minW: 0, minH: 0 };
  }
}

export function dashboardTileHasOwnTitle(type: BlockType): boolean {
  switch (type) {
    case BlockType.Input:
    case BlockType.DropdownInput:
    case BlockType.FileUpload:
    case BlockType.RichText:
    case BlockType.Markdown:
    case BlockType.DashboardHeader:
      return true;
    default:
      return false;
  }
}

// Height of the title strip a tile spends above its content: text-sm in a py-2.5 box.
export const DASHBOARD_TITLE_STRIP_PX = 40;

// What GridElement can draw. A chart-builder visualization, a power tool and a
// file upload all render nothing in a tile.
export function canShowOnDashboard(type: BlockType): boolean {
  switch (type) {
    case BlockType.Python:
    case BlockType.SQL:
    case BlockType.PivotTable:
    case BlockType.Visualization:
    case BlockType.Markdown:
    case BlockType.RichText:
    case BlockType.Input:
    case BlockType.DropdownInput:
    case BlockType.DateInput:
    case BlockType.DashboardHeader:
      return true;
    default:
      return false;
  }
}

function defaultTileRows(type: BlockType): number {
  switch (type) {
    case BlockType.Python:
    case BlockType.SQL:
    case BlockType.PivotTable:
    case BlockType.Visualization:
      return 8;
    case BlockType.Markdown:
    case BlockType.RichText:
      return 3;
    case BlockType.Input:
    case BlockType.DropdownInput:
    case BlockType.DateInput:
      return 2;
    case BlockType.DashboardHeader:
      return 1;
    default:
      return 6;
  }
}

// A layout is rows, top to bottom. A row's tiles fill the 24 columns and share
// one height so their tops and bottoms line up; positions are computed here.

export const MAX_TILES_PER_ROW = 12;
export const MAX_ROW_HEIGHT = 40;
export const HEADING_ROW_HEIGHT = 1;

export type DashboardTileSpec = {
  blockId: string;
  width?: number;
  chrome?: DashboardChrome;
  // true: hide the cell from the published report, so it appears on the
  // dashboard only. false: show it in the report again. Left out: unchanged.
  dashboardOnly?: boolean;
};

export type DashboardAlign = "left" | "center" | "right";

export type DashboardRowSpec = {
  // A section title, drawn in a row of its own above the tiles.
  heading?: string;
  height?: number;
  // Where tiles sit when their widths add up to less than the full row.
  // Without it a row must fill all the columns.
  align?: DashboardAlign;
  tiles?: DashboardTileSpec[];
};

export type DashboardCellInfo = { type: BlockType; title: string };

type Placement = {
  x: number;
  y: number;
  w: number;
  h: number;
  minW: number;
  minH: number;
};

export type PlannedDashboardItem =
  | ({
      kind: "tile";
      blockId: string;
      chrome?: DashboardChrome;
      dashboardOnly?: boolean;
    } & Placement)
  | ({ kind: "heading"; content: string } & Placement);

export type DashboardPlan =
  | { ok: true; items: PlannedDashboardItem[]; totalRows: number }
  | { ok: false; problems: string[] };

function splitEvenly(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total - base * parts;
  return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
}

function cellLabel(blockId: string, info: DashboardCellInfo): string {
  const name = info.title.trim() || `cell ${blockId.slice(0, 8)}`;
  return `"${name}" (${getPrettyTitle(info.type).toLowerCase()})`;
}

// Lists every problem with the layout at once, so it can be fixed in one pass.
export function planDashboardRows(
  rows: DashboardRowSpec[],
  lookup: (blockId: string) => DashboardCellInfo | undefined
): DashboardPlan {
  const problems: string[] = [];
  const items: PlannedDashboardItem[] = [];
  const placed = new Set<string>();
  let y = 0;

  rows.forEach((row, index) => {
    const label = `Row ${index + 1}`;
    const heading = row.heading?.trim();
    const tiles = row.tiles ?? [];

    if (!heading && tiles.length === 0) {
      problems.push(`${label} has neither a heading nor tiles`);
      return;
    }

    if (heading) {
      items.push({
        kind: "heading",
        content: heading,
        x: 0,
        y,
        w: DASHBOARD_COLUMNS,
        h: HEADING_ROW_HEIGHT,
        ...getMins(BlockType.DashboardHeader),
      });
      y += HEADING_ROW_HEIGHT;
    }

    if (tiles.length === 0) {
      return;
    }

    if (tiles.length > MAX_TILES_PER_ROW) {
      problems.push(
        `${label} has ${tiles.length} tiles; a row holds at most ${MAX_TILES_PER_ROW}`
      );
      return;
    }

    const cells: { tile: DashboardTileSpec; info: DashboardCellInfo }[] = [];
    for (const tile of tiles) {
      const info = lookup(tile.blockId);
      if (!info) {
        problems.push(`${label}: no cell with id ${tile.blockId}`);
      } else if (!canShowOnDashboard(info.type)) {
        problems.push(
          `${label}: ${cellLabel(tile.blockId, info)} cannot be shown on a dashboard. Use a python cell that draws the chart with Plotly instead`
        );
      } else if (placed.has(tile.blockId)) {
        problems.push(
          `${label}: ${cellLabel(tile.blockId, info)} is already placed; a cell appears on the dashboard once`
        );
      } else {
        placed.add(tile.blockId);
        cells.push({ tile, info });
      }
    }
    if (cells.length !== tiles.length) {
      return;
    }

    const widths = resolveWidths(label, tiles, problems, row.align);
    if (!widths) {
      return;
    }

    let x = alignedStart(widths, row.align);
    const planned: PlannedDashboardItem[] = [];
    cells.forEach(({ tile, info }, i) => {
      const w = widths[i]!;
      const mins = getMins(info.type);
      if (w < mins.minW) {
        problems.push(
          `${label}: ${cellLabel(tile.blockId, info)} needs at least ${mins.minW} columns, but gets ${w}. Give it more width or put fewer tiles in the row`
        );
      }
      planned.push({
        kind: "tile",
        blockId: tile.blockId,
        chrome: tile.chrome,
        dashboardOnly: tile.dashboardOnly,
        x,
        y,
        w,
        h: 0,
        ...mins,
      });
      x += w;
    });

    const minRowHeight = Math.max(...planned.map(item => item.minH));
    const height =
      row.height ??
      Math.max(...cells.map(({ info }) => defaultTileRows(info.type)));
    if (!Number.isInteger(height) || height < 1 || height > MAX_ROW_HEIGHT) {
      problems.push(
        `${label}: height must be a whole number from 1 to ${MAX_ROW_HEIGHT}`
      );
    } else if (height < minRowHeight) {
      problems.push(
        `${label}: height ${height} is too short for its tiles, which need at least ${minRowHeight} rows`
      );
    }

    for (const item of planned) {
      item.h = height;
    }
    items.push(...planned);
    y += height;
  });

  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, items, totalRows: y };
}

function alignedStart(widths: number[], align?: DashboardAlign): number {
  const free = DASHBOARD_COLUMNS - widths.reduce((sum, w) => sum + w, 0);
  if (align === "center") return Math.floor(free / 2);
  if (align === "right") return free;
  return 0;
}

function resolveWidths(
  label: string,
  tiles: DashboardTileSpec[],
  problems: string[],
  align?: DashboardAlign
): number[] | null {
  const invalid = tiles.find(
    tile =>
      tile.width !== undefined &&
      (!Number.isInteger(tile.width) ||
        tile.width < 1 ||
        tile.width > DASHBOARD_COLUMNS)
  );
  if (invalid) {
    problems.push(
      `${label}: widths are whole numbers of columns from 1 to ${DASHBOARD_COLUMNS}`
    );
    return null;
  }

  const unset = tiles.filter(tile => tile.width === undefined).length;
  const given = tiles.reduce((sum, tile) => sum + (tile.width ?? 0), 0);

  if (unset === tiles.length) {
    return splitEvenly(DASHBOARD_COLUMNS, tiles.length);
  }

  if (unset === 0) {
    if (given > DASHBOARD_COLUMNS || (given < DASHBOARD_COLUMNS && !align)) {
      problems.push(
        `${label}: widths add up to ${given}, but a row is ${DASHBOARD_COLUMNS} columns wide. Make them add up to ${DASHBOARD_COLUMNS}, leave the widths out to split the row evenly` +
          (given < DASHBOARD_COLUMNS
            ? ', or set align (left, center or right) to leave the rest of the row empty'
            : "")
      );
      return null;
    }
    return tiles.map(tile => tile.width!);
  }

  const remaining = DASHBOARD_COLUMNS - given;
  if (remaining < unset) {
    problems.push(
      `${label}: the widths given leave ${Math.max(remaining, 0)} columns for ${unset} tiles without one`
    );
    return null;
  }
  const shares = splitEvenly(remaining, unset);
  let next = 0;
  return tiles.map(tile => tile.width ?? shares[next++]!);
}
