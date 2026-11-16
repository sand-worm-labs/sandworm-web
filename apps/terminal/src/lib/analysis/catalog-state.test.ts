import {
  AnalysisViewKind,
  type AnalysisSubject,
} from "@sandworm/types/terminal";
import { describe, expect, it } from "vitest";

import { catalogOf } from "./catalog-state";

const report = (id: string, publishedAt: string, isNew = false) => ({
  id,
  title: `Report ${id}`,
  line: `Line ${id}`,
  publishedAt,
  isNew,
  path: `/r/${id}`,
});

const subject = (
  name: string,
  view: AnalysisViewKind,
  reports: AnalysisSubject["reports"]
): AnalysisSubject => ({
  id: name,
  view,
  name,
  icon: null,
  kind: "Wallet",
  impact: "10 of your users",
  impactSize: 10,
  reports,
});

describe("catalogOf", () => {
  it("leaves out subjects with no reports, and views with no rows", () => {
    const { views } = catalogOf([
      subject("Aave", AnalysisViewKind.PROJECT, [report("1", "2026-11-02")]),
      subject("Empty", AnalysisViewKind.PROJECT, []),
    ]);

    expect(views.map(view => view.id)).toEqual(["projects"]);
    expect(views[0]?.rows.map(row => row.name)).toEqual(["Aave"]);
    expect(views[0]?.rows.every(row => row.hasPage)).toBe(true);
  });

  it("orders rows by their newest report", () => {
    const { views } = catalogOf([
      subject("Old", AnalysisViewKind.PROJECT, [report("1", "2026-10-01")]),
      subject("Fresh", AnalysisViewKind.PROJECT, [report("2", "2026-11-02")]),
    ]);

    expect(views[0]?.rows.map(row => row.name)).toEqual(["Fresh", "Old"]);
  });

  it("highlights the three newest new reports, under their project or else their region", () => {
    const { highlights } = catalogOf([
      subject("A", AnalysisViewKind.PROJECT, [
        report("a1", "2026-11-01", true),
        report("a2", "2026-10-01", true),
      ]),
      subject("B", AnalysisViewKind.PROJECT, [
        report("b1", "2026-11-03", true),
        report("b2", "2026-11-02", true),
        report("old", "2026-11-04"),
      ]),
      subject("Region", AnalysisViewKind.REGION, [
        report("r1", "2026-11-05", true),
        // Also under a project: it shows once, under the project
        report("b1", "2026-11-03", true),
      ]),
    ]);

    expect(highlights.map(item => [item.id, item.entity])).toEqual([
      ["r1", "Region"],
      ["b1", "B"],
      ["b2", "B"],
    ]);
  });

  it("carries a subject's icon to its row and to its highlight", () => {
    const logo = { kind: "logo", slug: "lemon-cash" } as const;
    const { views, highlights } = catalogOf([
      {
        ...subject("Lemon", AnalysisViewKind.PROJECT, [
          report("1", "2026-11-02", true),
        ]),
        icon: logo,
      },
    ]);

    expect(views[0]?.rows[0]?.icon).toEqual(logo);
    expect(highlights[0]?.icon).toEqual(logo);
  });
});
