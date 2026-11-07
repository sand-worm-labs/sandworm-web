import type {
  AnalysisCatalog,
  AnalysisRow,
  AnalysisSort,
  AnalysisView,
} from "@/types";

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
