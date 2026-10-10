import type { NotebookShowcase, ShowcaseHeroStat, ShowcaseKind } from "@/types";

// =====================================
// ⬢  Types
// =====================================
// A notebook's Showcase metadata as the form holds it: every field is text, so
// it can be typed into and read back without losing half-written input.
export type NotebookForm = {
  kind: ShowcaseKind;
  category: string;
  protocol: string;
  chains: string;
  country: string;
  status: "draft" | "published";
  dataAsOf: string;
  // One stat per line: "Label | value", optionally "| cell" after.
  heroStats: string;
  parentCaseStudy: string;
  claimed: boolean;
};

export const EMPTY_NOTEBOOK_FORM: NotebookForm = {
  kind: "case_study",
  category: "",
  protocol: "",
  chains: "",
  country: "",
  status: "draft",
  dataAsOf: "",
  heroStats: "",
  parentCaseStudy: "",
  claimed: false,
};

// =====================================
// ⬢  Lists
// =====================================
export function parseList(text: string): string[] {
  const items = text
    .split(/[,\n]/)
    .map(part => part.trim())
    .filter(Boolean);
  return Array.from(new Set(items));
}

export function parseHeroStats(text: string): ShowcaseHeroStat[] {
  return text
    .split("\n")
    .map(line => line.split("|").map(part => part.trim()))
    .flatMap(([label, value, cell]) =>
      label && value ? [{ label, value, ...(cell ? { cell } : {}) }] : []
    );
}

export function formatHeroStats(stats: ShowcaseHeroStat[]): string {
  return stats
    .map(stat =>
      [stat.label, stat.value, stat.cell].filter(Boolean).join(" | ")
    )
    .join("\n");
}

// =====================================
// ⬢  Form <-> metadata
// =====================================
export function toForm(showcase: NotebookShowcase | null): NotebookForm {
  if (!showcase) return EMPTY_NOTEBOOK_FORM;
  return {
    kind: showcase.kind,
    category: showcase.category,
    protocol: showcase.protocol ?? "",
    chains: (showcase.chains ?? []).join(", "),
    country: showcase.country ?? "",
    status: showcase.status ?? "draft",
    dataAsOf: showcase.dataAsOf ?? "",
    heroStats: formatHeroStats(showcase.heroStats ?? []),
    parentCaseStudy: showcase.parentCaseStudy ?? "",
    claimed: showcase.claimed ?? false,
  };
}

// What is sent. Fields that do not apply to the kind are left out, and empty
// text is not sent at all; the server has the last word on what is valid.
export function toShowcase(form: NotebookForm): Record<string, unknown> {
  const text = (value: string) => value.trim() || undefined;
  const isCaseStudy = form.kind === "case_study";

  return {
    kind: form.kind,
    category: form.category.trim(),
    protocol: isCaseStudy ? text(form.protocol) : undefined,
    chains: parseList(form.chains),
    country: text(form.country),
    status: form.status,
    dataAsOf: text(form.dataAsOf),
    heroStats: parseHeroStats(form.heroStats),
    parentCaseStudy:
      form.kind === "working" ? text(form.parentCaseStudy) : undefined,
    claimed: isCaseStudy ? form.claimed : false,
  };
}

// What is wrong with the form before it is sent. Empty when it is fine.
export function formProblems(form: NotebookForm): string[] {
  const problems: string[] = [];
  if (!form.category.trim()) problems.push("Pick a category");
  if (form.kind === "case_study" && !form.protocol.trim()) {
    problems.push("An analysis needs a protocol");
  }
  if (parseHeroStats(form.heroStats).length > 4) {
    problems.push("At most 4 headline stats");
  }
  return problems;
}
