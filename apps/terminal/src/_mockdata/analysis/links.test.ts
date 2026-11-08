import { describe, expect, it } from "vitest";

import { entityFixtures } from "./entity";

import { analysisMockData } from "./index";

const linked = (clientKind: keyof typeof analysisMockData) =>
  analysisMockData[clientKind].views.flatMap(view =>
    view.rows
      .filter(row => row.hasPage)
      .map(row => `${view.rowRoute}/${row.slug}`)
  );

describe("analysis rows link to entity pages", () => {
  it("links a project, a region and a sector for the exchange client", () => {
    const links = linked("exchange");

    expect(links).toContain("project/paycrest");
    expect(links.some(link => link.startsWith("region/"))).toBe(true);
    expect(links.some(link => link.startsWith("sector/"))).toBe(true);
  });

  it("links exactly the rows that have a page, for every client", () => {
    Object.entries(analysisMockData).forEach(([clientKind, catalog]) => {
      const pages = entityFixtures[clientKind as keyof typeof entityFixtures];
      const expected = catalog.views.flatMap(view =>
        view.rows.filter(row =>
          pages.some(
            page => page.kind === view.rowRoute && page.slug === row.slug
          )
        )
      );

      expect(
        catalog.views.flatMap(view => view.rows).filter(row => row.hasPage)
      ).toEqual(expected);
    });
  });

  it("links nothing for a client with no entity pages", () => {
    expect(linked("protocol")).toEqual([]);
  });
});
