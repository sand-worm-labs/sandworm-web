import { describe, expect, it } from "vitest";

import { sectionCountsFixtures } from "@/features/sections/fixtures";

import { analysisFixtures } from ".";

const catalogs = Object.entries(analysisFixtures).map(
  ([clientKind, catalog]) => ({ clientKind, catalog })
);

describe("analysis fixtures", () => {
  it.each(catalogs)(
    "$clientKind: every view has rows with unique ids",
    ({ catalog }) => {
      expect(catalog.views.length).toBeGreaterThan(0);
      catalog.views.forEach(view => {
        const ids = view.rows.map(row => row.id);

        expect(ids.length).toBeGreaterThan(0);
        expect(new Set(ids).size).toBe(ids.length);
      });
    }
  );

  it.each(catalogs)("$clientKind: view ids are unique", ({ catalog }) => {
    const ids = catalog.views.map(view => view.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("Robinhood's projects add up to the Analysis tab count", () => {
    const projects = analysisFixtures.exchange.views.find(
      view => view.id === "projects"
    );
    const reports = projects?.rows.reduce(
      (sum, row) => sum + row.reportCount,
      0
    );

    expect(String(reports)).toBe(sectionCountsFixtures.exchange.analysis);
  });
});

describe("entity page links", () => {
  it("only links rows that have a page", () => {
    const projects = analysisFixtures.exchange.views.find(
      view => view.id === "projects"
    );
    const linked = projects?.rows
      .filter(row => row.hasPage)
      .map(row => row.name);

    expect(linked).toEqual(["Paycrest"]);
  });

  it("links the region and sector pages too", () => {
    const names = (id: "regions" | "sectors") =>
      analysisFixtures.exchange.views
        .find(view => view.id === id)
        ?.rows.filter(row => row.hasPage)
        .map(row => row.name);

    expect(names("regions")).toEqual(["Latin America"]);
    expect(names("sectors")).toEqual(["Cash-out and off-ramps"]);
  });

  it("links nothing for a client with no entity pages", () => {
    const anyLinked = analysisFixtures.vc.views.some(view =>
      view.rows.some(row => row.hasPage)
    );

    expect(anyLinked).toBe(false);
  });
});
