import type {
  AnalysisSubject,
  AnalysisViewKind,
  TerminalAnalysis,
} from "@sandworm/types/terminal";

import { shortDay } from "@/lib/dates";
import { webAppUrl } from "@/lib/web-app";

import type {
  AnalysisCatalog,
  AnalysisHighlight,
  AnalysisRow,
  AnalysisView,
} from "./types";

const VIEWS: readonly (Omit<AnalysisView, "rows"> & {
  kind: AnalysisViewKind;
})[] = [
  {
    kind: "project",
    id: "projects",
    label: "Projects",
    columnName: "Project",
    impactColumnName: "Your users there",
    rowRoute: "project",
  },
  {
    kind: "region",
    id: "regions",
    label: "Regions",
    columnName: "Region",
    impactColumnName: "Your users there",
    rowRoute: "region",
  },
  {
    kind: "sector",
    id: "sectors",
    label: "Sectors",
    columnName: "Sector",
    impactColumnName: "Your users there",
    rowRoute: "sector",
  },
];

const HIGHLIGHTS = 3;

// A subject's row: the counts and latest report come from its reports, which
// the API sends newest first.
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

const newest = (subject: AnalysisSubject) =>
  subject.reports[0]?.publishedAt ?? "";

// Rows with no reports yet are left out; "Most recent" keeps this order.
function rowsOf(subjects: readonly AnalysisSubject[], kind: AnalysisViewKind) {
  return subjects
    .filter(subject => subject.view === kind && subject.reports.length > 0)
    .sort((a, b) => newest(b).localeCompare(newest(a)))
    .map(toRow);
}

// The newest reports the member has not seen, each under the project it is on
// (a report has one project, so none repeats)
function highlightsOf(subjects: readonly AnalysisSubject[]) {
  return subjects
    .filter(subject => subject.view === "project")
    .flatMap(subject =>
      subject.reports.map(report => ({ report, entity: subject.name }))
    )
    .filter(({ report }) => report.isNew)
    .sort((a, b) => b.report.publishedAt.localeCompare(a.report.publishedAt))
    .slice(0, HIGHLIGHTS)
    .map(
      ({ report, entity }) =>
        ({
          id: report.id,
          tag: "New report",
          when: shortDay(report.publishedAt),
          title: report.title,
          line: report.line,
          entity,
          url: webAppUrl(report.path),
        }) satisfies AnalysisHighlight
    );
}

export function analysisFromApi({
  subjects,
}: TerminalAnalysis): AnalysisCatalog {
  return {
    highlights: highlightsOf(subjects),
    views: VIEWS.map(({ kind, ...view }) => ({
      ...view,
      rows: rowsOf(subjects, kind),
    })).filter(view => view.rows.length > 0),
  };
}
