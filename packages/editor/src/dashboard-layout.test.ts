import {
  DASHBOARD_COLUMNS,
  canShowOnDashboard,
  dashboardCellSize,
  dashboardTilePixels,
  planDashboardRows,
  type DashboardCellInfo,
  type PlannedDashboardItem,
} from "./dashboard-layout.js";
import { BlockType } from "./blocks/index.js";

const cells: Record<string, DashboardCellInfo> = {
  kpi1: { type: BlockType.Python, title: "TVL" },
  kpi2: { type: BlockType.Python, title: "Stablecoins" },
  kpi3: { type: BlockType.Python, title: "DEX volume" },
  bar: { type: BlockType.Python, title: "TVL by chain" },
  pie: { type: BlockType.Python, title: "Share by category" },
  note: { type: BlockType.Markdown, title: "" },
  filter: { type: BlockType.DropdownInput, title: "Chain" },
  chart: { type: BlockType.VisualizationV2, title: "Builder chart" },
  tool: { type: BlockType.PowerToolbox, title: "Tool" },
};
const lookup = (id: string) => cells[id];

function plan(rows: Parameters<typeof planDashboardRows>[0]) {
  const result = planDashboardRows(rows, lookup);
  if (!result.ok) {
    throw new Error(result.problems.join("\n"));
  }
  return result;
}

const tiles = (items: PlannedDashboardItem[]) =>
  items.filter(item => item.kind === "tile") as Extract<
    PlannedDashboardItem,
    { kind: "tile" }
  >[];

describe("planDashboardRows", () => {
  test("places a row's tiles left to right at the row's height", () => {
    const { items, totalRows } = plan([
      {
        height: 5,
        tiles: [
          { blockId: "kpi1", width: 8 },
          { blockId: "kpi2", width: 8 },
          { blockId: "kpi3", width: 8 },
        ],
      },
    ]);

    expect(tiles(items).map(t => [t.blockId, t.x, t.y, t.w, t.h])).toEqual([
      ["kpi1", 0, 0, 8, 5],
      ["kpi2", 8, 0, 8, 5],
      ["kpi3", 16, 0, 8, 5],
    ]);
    expect(totalRows).toBe(5);
  });

  test("stacks rows with no gap between them", () => {
    const { items, totalRows } = plan([
      { height: 5, tiles: [{ blockId: "kpi1" }] },
      { height: 8, tiles: [{ blockId: "bar", width: 14 }, { blockId: "pie", width: 10 }] },
    ]);

    expect(tiles(items).map(t => [t.blockId, t.y, t.h])).toEqual([
      ["kpi1", 0, 5],
      ["bar", 5, 8],
      ["pie", 5, 8],
    ]);
    expect(totalRows).toBe(13);
  });

  test("splits a row evenly when no widths are given, front-loading the remainder", () => {
    const { items } = plan([
      {
        tiles: ["kpi1", "kpi2", "kpi3", "bar", "pie"].map(blockId => ({ blockId })),
      },
    ]);

    expect(tiles(items).map(t => t.w)).toEqual([5, 5, 5, 5, 4]);
    expect(tiles(items).reduce((sum, t) => sum + t.w, 0)).toBe(DASHBOARD_COLUMNS);
  });

  test("gives the columns a partly sized row has left to the tiles without a width", () => {
    const { items } = plan([
      { tiles: [{ blockId: "bar", width: 14 }, { blockId: "pie" }] },
    ]);

    expect(tiles(items).map(t => t.w)).toEqual([14, 10]);
  });

  test("draws a heading in a row of its own above the tiles", () => {
    const { items } = plan([
      { heading: "  Overview  ", tiles: [{ blockId: "kpi1" }] },
      { heading: "Trends" },
    ]);

    expect(items.map(i => [i.kind, i.y, i.h])).toEqual([
      ["heading", 0, 1],
      ["tile", 1, 8],
      ["heading", 9, 1],
    ]);
    expect(items[0]).toMatchObject({ content: "Overview", x: 0, w: 24 });
  });

  test("defaults a row's height from what is in it", () => {
    const { items } = plan([
      { tiles: [{ blockId: "filter", width: 4 }, { blockId: "note", width: 20 }] },
      { tiles: [{ blockId: "bar" }] },
    ]);

    expect(tiles(items).map(t => t.h)).toEqual([3, 3, 8]);
  });

  test("carries each block's minimum size so the editor keeps it when resizing", () => {
    const { items } = plan([{ tiles: [{ blockId: "bar" }] }]);

    expect(tiles(items)[0]).toMatchObject({ minW: 3, minH: 2 });
  });

  test("an empty layout is valid and clears the dashboard", () => {
    expect(plan([])).toEqual({ ok: true, items: [], totalRows: 0 });
  });

  describe("problems", () => {
    const problems = (rows: Parameters<typeof planDashboardRows>[0]) => {
      const result = planDashboardRows(rows, lookup);
      return result.ok ? [] : result.problems;
    };

    test("widths that do not fill the row", () => {
      expect(
        problems([{ tiles: [{ blockId: "bar", width: 10 }, { blockId: "pie", width: 8 }] }])
      ).toEqual([expect.stringContaining("widths add up to 18")]);
      expect(
        problems([{ tiles: [{ blockId: "bar", width: 20 }, { blockId: "pie", width: 8 }] }])
      ).toEqual([expect.stringContaining("widths add up to 28")]);
    });

    test("no room left for the tiles without a width", () => {
      expect(
        problems([
          { tiles: [{ blockId: "bar", width: 23 }, { blockId: "pie" }, { blockId: "kpi1" }] },
        ])
      ).toEqual([expect.stringContaining("leave 1 columns for 2 tiles")]);
    });

    test("a tile narrower than its block allows, named by its title", () => {
      expect(
        problems([
          {
            tiles: [{ blockId: "bar", width: 2 }, { blockId: "pie", width: 22 }],
          },
        ])
      ).toEqual([expect.stringContaining('"TVL by chain" (python) needs at least 3 columns')]);
    });

    test("a row too short for its tiles", () => {
      expect(
        problems([{ height: 1, tiles: [{ blockId: "bar" }] }])
      ).toEqual([expect.stringContaining("height 1 is too short")]);
    });

    test("a cell that does not exist, or that a tile cannot show", () => {
      expect(problems([{ tiles: [{ blockId: "nope" }] }])).toEqual([
        "Row 1: no cell with id nope",
      ]);
      expect(
        problems([{ tiles: [{ blockId: "chart" }, { blockId: "tool" }] }])
      ).toEqual([
        expect.stringContaining('"Builder chart" (visualization) cannot be shown'),
        expect.stringContaining('"Tool" (power toolbox) cannot be shown'),
      ]);
    });

    test("a cell placed twice", () => {
      expect(
        problems([
          { tiles: [{ blockId: "bar" }] },
          { tiles: [{ blockId: "bar" }] },
        ])
      ).toEqual([expect.stringContaining("already placed")]);
    });

    test("an empty row", () => {
      expect(problems([{ height: 4 }])).toEqual([
        "Row 1 has neither a heading nor tiles",
      ]);
    });

    test("reports every row's problems together, with the row they are in", () => {
      expect(
        problems([
          { tiles: [{ blockId: "nope" }] },
          { tiles: [{ blockId: "bar", width: 10 }] },
        ])
      ).toEqual([
        "Row 1: no cell with id nope",
        expect.stringContaining("Row 2: widths add up to 10"),
      ]);
    });
  });
});

describe("canShowOnDashboard", () => {
  test("covers what a dashboard tile draws, and nothing it renders blank", () => {
    expect(canShowOnDashboard(BlockType.Python)).toBe(true);
    expect(canShowOnDashboard(BlockType.Markdown)).toBe(true);
    expect(canShowOnDashboard(BlockType.VisualizationV2)).toBe(false);
    expect(canShowOnDashboard(BlockType.PowerToolbox)).toBe(false);
    expect(canShowOnDashboard(BlockType.FileUpload)).toBe(false);
  });
});

describe("grid size", () => {
  test("a column is 42px on a 1300px screen, and a row stays at its 50px minimum", () => {
    const { cellWidth, cellHeight } = dashboardCellSize(1164);

    expect(Math.round(cellWidth)).toBe(42);
    expect(cellHeight).toBe(50);
  });

  test("rows grow with the columns on a wide screen", () => {
    expect(dashboardCellSize(1800).cellHeight).toBeCloseTo(
      dashboardCellSize(1800).cellWidth
    );
  });

  test("a tile's pixel size on the reference screen", () => {
    expect(dashboardTilePixels(24, 1)).toEqual({ width: 1152, height: 50 });
    expect(dashboardTilePixels(12, 8)).toEqual({ width: 573, height: 442 });
  });
});
