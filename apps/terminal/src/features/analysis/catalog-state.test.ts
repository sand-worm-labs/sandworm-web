import { describe, expect, it } from "vitest";

import {
  describeCatalog,
  filterRows,
  resolveView,
  sortRows,
} from "./catalog-state";
import type { AnalysisCatalog, AnalysisRow } from "./types";

const row = (init: Partial<AnalysisRow> & { name: string }): AnalysisRow => ({
  id: init.name,
  slug: init.name,
  hasPage: false,
  kind: "Wallet",
  reportCount: 1,
  latest: "A report",
  isNew: false,
  impact: "",
  impactSize: 0,
  updated: "Mon",
  ...init,
});

const rows = [
  row({ name: "Paycrest", kind: "Payments · Africa", impactSize: 2 }),
  row({ name: "Aave", latest: "Stablecoin yields", impactSize: 9 }),
  row({ name: "Bitso", impactSize: 5 }),
];

describe("filterRows", () => {
  it("returns every row for a blank query", () => {
    expect(filterRows(rows, "  ")).toBe(rows);
  });

  it("matches the name, kind and latest report, ignoring case", () => {
    expect(filterRows(rows, "AFRICA").map(r => r.name)).toEqual(["Paycrest"]);
    expect(filterRows(rows, "yields").map(r => r.name)).toEqual(["Aave"]);
    expect(filterRows(rows, "bit").map(r => r.name)).toEqual(["Bitso"]);
  });

  it("returns nothing when no row matches", () => {
    expect(filterRows(rows, "tron")).toEqual([]);
  });
});

describe("sortRows", () => {
  it("keeps the feed order for recent", () => {
    expect(sortRows(rows, "recent")).toBe(rows);
  });

  it("puts the biggest audience first for relevant", () => {
    expect(sortRows(rows, "relevant").map(r => r.name)).toEqual([
      "Aave",
      "Bitso",
      "Paycrest",
    ]);
  });

  it("sorts by name for alphabetical without mutating the input", () => {
    expect(sortRows(rows, "alphabetical").map(r => r.name)).toEqual([
      "Aave",
      "Bitso",
      "Paycrest",
    ]);
    expect(rows[0]?.name).toBe("Paycrest");
  });
});

describe("resolveView", () => {
  const views = [
    { id: "projects", rows: [] },
    { id: "regions", rows: [] },
  ] as unknown as AnalysisCatalog["views"];

  it("finds a view by id and falls back to the first", () => {
    expect(resolveView(views, "regions")?.id).toBe("regions");
    expect(resolveView(views, "sectors")?.id).toBe("projects");
  });
});

describe("describeCatalog", () => {
  it("counts reports and projects from the projects view", () => {
    const catalog = {
      highlights: [],
      views: [
        {
          id: "projects",
          rows: [
            row({ name: "A", reportCount: 3 }),
            row({ name: "B", reportCount: 2 }),
          ],
        },
      ],
    } as unknown as AnalysisCatalog;

    expect(describeCatalog(catalog, "Robinhood")).toBe(
      "Research prepared for Robinhood. 5 reports on 2 projects."
    );
  });

  it("uses singular nouns", () => {
    const catalog = {
      highlights: [],
      views: [{ id: "projects", rows: [row({ name: "A" })] }],
    } as unknown as AnalysisCatalog;

    expect(describeCatalog(catalog, "Base")).toBe(
      "Research prepared for Base. 1 report on 1 project."
    );
  });
});
