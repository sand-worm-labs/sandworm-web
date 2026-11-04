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
