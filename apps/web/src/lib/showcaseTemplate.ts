// Pure logic for the published templates: finding a notebook's sections in
// its markdown, and checking them against a template's fixed skeleton. The
// skeletons come from the API (ShowcaseConfig.templates).
import type { ShowcaseTemplates } from "@/types";

// =====================================
// ⬢  Types
// =====================================
// A section of a published notebook: an H2, and the block it sits in.
export type NotebookSection = { id: string; title: string };

// =====================================
// ⬢  Headings
// =====================================
const H2 = /^##(?!#)\s+(.+?)\s*#*\s*$/;
const FENCE = /^(```|~~~)/;

// The H2 headings of a markdown cell, in order. Headings inside code fences
// are not headings.
export function markdownHeadings(source: string): string[] {
  const headings: string[] = [];
  let inFence = false;

  source.split("\n").forEach(line => {
    if (FENCE.test(line.trim())) {
      inFence = !inFence;
      return;
    }
    const match = inFence ? null : H2.exec(line);
    if (match?.[1]) headings.push(match[1].replace(/[*_`]/g, "").trim());
  });

  return headings;
}

// =====================================
// ⬢  Template check
// =====================================
const sameTitle = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();

// What a notebook is missing to fit a template. The template fixes which
// titled sections must exist and how many free sections (the findings, the
// metrics) sit between them; an empty list means it fits.
export function checkTemplate(
  kind: keyof ShowcaseTemplates,
  titles: string[],
  templates: ShowcaseTemplates
): string[] {
  // Only the author's sections are checked; the page adds the rest itself.
  const sections = templates[kind].sections.filter(s => s.by === "notebook");
  const fixed = sections.filter(s => s.title !== null);
  const required = fixed.filter(s => s.required);
  const counted = sections.filter(s => s.title === null && s.min !== undefined);
  const problems: string[] = [];

  required.forEach(section => {
    if (!titles.some(title => sameTitle(title, section.title!))) {
      problems.push(`Missing the "${section.title}" section`);
    }
  });

  counted.forEach(section => {
    const free = titles.filter(
      title => !fixed.some(s => sameTitle(title, s.title!))
    ).length;
    if (
      free < section.min! ||
      (section.max !== undefined && free > section.max)
    ) {
      problems.push(
        `Needs ${section.min} to ${section.max ?? "any number of"} ${section.id} sections, has ${free}`
      );
    }
  });

  return problems;
}
