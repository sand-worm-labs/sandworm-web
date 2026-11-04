import { describe, expect, it } from "vitest";

import { entityFixtures, findEntityPage } from ".";

const pages = Object.entries(entityFixtures).flatMap(([clientKind, list]) =>
  list.map(page => ({ clientKind, page }))
);

describe("entity fixtures", () => {
  it.each(pages)(
    "$clientKind / $page.name: has unique block ids",
    ({ page }) => {
      const ids = page.rows.flatMap(row => row.blocks.map(block => block.id));

      expect(new Set(ids).size).toBe(ids.length);
    }
  );

  it.each(pages)(
    "$clientKind / $page.name: table rows have a cell for every column",
    ({ page }) => {
      page.rows
        .flatMap(row => row.blocks)
        .forEach(block => {
          if (block._tag !== "dataTable") return;
          block.rows.forEach(row => {
            expect(row.cells).toHaveLength(block.columns.length);
          });
        });
    }
  );

  it.each(pages)(
    "$clientKind / $page.name: every line has a value for every month",
    ({ page }) => {
      page.rows
        .flatMap(row => row.blocks)
        .forEach(block => {
          if (block._tag !== "lineChart") return;
          block.series.forEach(series => {
            expect(series.values).toHaveLength(block.xLabels.length);
          });
        });
    }
  );

  it.each(pages)(
    "$clientKind / $page.name: bars stay inside their track",
    ({ page }) => {
      page.rows
        .flatMap(row => row.blocks)
        .forEach(block => {
          if (block._tag !== "barList") return;
          block.rows.forEach(row => {
            expect(row.share).toBeGreaterThanOrEqual(0);
            expect(row.share).toBeLessThanOrEqual(100);
          });
        });
    }
  );

  it("finds a page by kind and slug, and not by slug alone", () => {
    const list = entityFixtures.exchange;

    expect(findEntityPage(list, "project", "paycrest")?.name).toBe("Paycrest");
    expect(findEntityPage(list, "region", "paycrest")).toBeUndefined();
    expect(findEntityPage(list, "sector", "nowhere")).toBeUndefined();
  });
});
