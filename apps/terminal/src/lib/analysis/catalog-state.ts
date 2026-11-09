import {
  AnalysisViewKind,
  type AnalysisSubject,
} from "@sandworm/types/terminal";

import { shortDay } from "@/lib/dates";
import { webAppUrl } from "@/lib/web-app";
import type {
  AnalysisCatalog,
  AnalysisHighlight,
  AnalysisRow,
  AnalysisView,
} from "@/types";

import type { AnalysisSort } from "./sorts";

export function filterRows(
  rows: readonly AnalysisRow[],
  query: string
): readonly AnalysisRow[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return rows;

  return rows.filter(row =>
    [row.name, row.kind, row.latest].join(" ").toLowerCase().includes(needle)
  );
}

const COMPARATORS: Record<
  AnalysisSort,
  ((a: AnalysisRow, b: AnalysisRow) => number) | undefined
> = {
  recent: undefined,
  relevant: (a, b) => b.impactSize - a.impactSize,
  alphabetical: (a, b) => a.name.localeCompare(b.name),
};

export function sortRows(
  rows: readonly AnalysisRow[],
  sort: AnalysisSort
): readonly AnalysisRow[] {
  const compare = COMPARATORS[sort];
  return compare ? [...rows].sort(compare) : rows;
}

export function resolveView(
  views: readonly AnalysisView[],
  id: string
): AnalysisView | undefined {
  return views.find(view => view.id === id) ?? views[0];
}

export function describeCatalog(catalog: AnalysisCatalog, clientName: string) {
  const projects = catalog.views.find(view => view.id === "projects");
  const reports = projects?.rows.reduce((sum, row) => sum + row.reportCount, 0);

  if (!projects || reports === undefined) {
    return `Research prepared for ${clientName}.`;
  }

  return `Research prepared for ${clientName}. ${reports} ${plural(reports, "report")} on ${projects.rows.length} ${plural(projects.rows.length, "project")}.`;
}

function plural(count: number, noun: string) {
  return count === 1 ? noun : `${noun}s`;
}

const VIEWS: readonly (Omit<AnalysisView, "rows" | "impactColumnName"> & {
  kind: AnalysisViewKind;
})[] = [
  {
    kind: AnalysisViewKind.PROJECT,
    id: "projects",
    label: "Projects",
    columnName: "Project",
    rowRoute: "project",
  },
  {
    kind: AnalysisViewKind.REGION,
    id: "regions",
    label: "Regions",
    columnName: "Region",
    rowRoute: "region",
  },
  {
    kind: AnalysisViewKind.SECTOR,
    id: "sectors",
    label: "Sectors",
    columnName: "Sector",
    rowRoute: "sector",
  },
];

// The API sends a subject's reports newest first
const newest = (subject: AnalysisSubject) =>
  subject.reports[0]?.publishedAt ?? "";

function toRow(subject: AnalysisSubject): AnalysisRow {
  const [latest] = subject.reports;
  return {
    id: subject.id,
    slug: subject.slug,
    hasPage: false,
    name: subject.name,
    kind: subject.kind,
    reportCount: subject.reports.length,
    latest: latest?.title ?? "",
    isNew: subject.reports.some(report => report.isNew),
    impact: subject.impact,
    impactSize: subject.impactSize,
    updated: latest ? shortDay(latest.publishedAt) : "",
  };
}

// Subjects with no reports yet are left out; "Most recent" keeps this order.
function rowsOf(subjects: readonly AnalysisSubject[], kind: AnalysisViewKind) {
  return subjects
    .filter(subject => subject.view === kind && subject.reports.length > 0)
    .sort((a, b) => newest(b).localeCompare(newest(a)))
    .map(toRow);
}

// The three newest reports the member has not seen, each under the project it
// is on (a report has one project, so none repeats)
function highlightsOf(subjects: readonly AnalysisSubject[]) {
  return subjects
    .filter(subject => subject.view === AnalysisViewKind.PROJECT)
    .flatMap(subject =>
      subject.reports.map(report => ({ report, entity: subject.name }))
    )
    .filter(({ report }) => report.isNew)
    .sort((a, b) => b.report.publishedAt.localeCompare(a.report.publishedAt))
    .slice(0, 3)
    .map(
      ({ report, entity }): AnalysisHighlight => ({
        id: report.id,
        tag: "New report",
        when: shortDay(report.publishedAt),
        title: report.title,
        line: report.line,
        entity,
        url: webAppUrl(report.path),
      })
    );
}

export function catalogOf(
  subjects: readonly AnalysisSubject[]
): AnalysisCatalog {
  return {
    highlights: highlightsOf(subjects),
    views: VIEWS.map(({ kind, ...view }) => ({
      ...view,
      impactColumnName: "Your users there",
      rows: rowsOf(subjects, kind),
    })).filter(view => view.rows.length > 0),
  };
}
