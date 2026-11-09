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
  slug: name.toLowerCase(),
  name,
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
  });

  it("orders rows by their newest report", () => {
    const { views } = catalogOf([
      subject("Old", AnalysisViewKind.PROJECT, [report("1", "2026-10-01")]),
      subject("Fresh", AnalysisViewKind.PROJECT, [report("2", "2026-11-02")]),
    ]);

    expect(views[0]?.rows.map(row => row.name)).toEqual(["Fresh", "Old"]);
  });

  it("highlights the three newest unseen reports, on projects only", () => {
    const { highlights } = catalogOf([
      subject("A", AnalysisViewKind.PROJECT, [
        report("a1", "2026-11-01", true),
        report("a2", "2026-10-01", true),
      ]),
      subject("B", AnalysisViewKind.PROJECT, [
        report("b1", "2026-11-03", true),
        report("b2", "2026-11-02", true),
        report("seen", "2026-11-04"),
      ]),
      subject("Region", AnalysisViewKind.REGION, [
        report("r1", "2026-11-05", true),
      ]),
    ]);

    expect(highlights.map(item => item.id)).toEqual(["b1", "b2", "a1"]);
  });
});
