import { describe, expect, it } from "vitest";

import { entityFixtures, findEntityPage } from "./index";

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

  it("finds a page by kind and slug, and not by slug alone", () => {
    const list = entityFixtures.exchange;

    expect(findEntityPage(list, "project", "paycrest")?.name).toBe("Paycrest");
    expect(findEntityPage(list, "region", "paycrest")).toBeUndefined();
    expect(findEntityPage(list, "sector", "nowhere")).toBeUndefined();
  });
});
