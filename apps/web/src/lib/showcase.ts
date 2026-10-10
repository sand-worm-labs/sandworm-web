// Pure logic behind the Showcase pages: joining the taxonomy with published
// notebook metadata, and filtering the result. No React, no fetch: the
// taxonomy is passed in by whoever loaded it (see fetchShowcaseConfig).
import type {
  ShowcaseCategoryCard,
  ShowcaseCategoryStatus,
  ShowcaseFilters,
  ShowcaseGroupFilter,
  ShowcaseNotebook,
  ShowcaseProject,
  ShowcaseTaxonomy,
  ShowcaseTaxonomyEntry,
} from "@/types";

// =====================================
// ⬢  Links
// =====================================
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const categoryHref = (category: string) => `/showcase/${category}`;

export const caseStudyHref = (notebook: ShowcaseNotebook) =>
  `/showcase/${notebook.showcase.category}/${slugify(notebook.showcase.protocol ?? notebook.slug)}`;

export const notebookHref = (slug: string) => `/notebooks/${slug}`;

// =====================================
// ⬢  Lookups
// =====================================
export const findCategory = (
  slug: string,
  taxonomy: ShowcaseTaxonomy
): ShowcaseTaxonomyEntry | undefined =>
  taxonomy.categories.find(category => category.slug === slug);

export const groupLabel = (group: string, taxonomy: ShowcaseTaxonomy) =>
  taxonomy.groups.find(g => g.id === group)?.label ?? group;

export const ofKind = (
  notebooks: ShowcaseNotebook[],
  kind: ShowcaseNotebook["showcase"]["kind"],
  category?: string
) =>
  notebooks.filter(
    n =>
      n.showcase.kind === kind &&
      (category === undefined || n.showcase.category === category)
  );

export const findCaseStudy = (
  notebooks: ShowcaseNotebook[],
  category: string,
  protocol: string
) =>
  ofKind(notebooks, "case_study", category).find(
    n => slugify(n.showcase.protocol ?? n.slug) === protocol
  );

// =====================================
// ⬢  Projects
// =====================================
export const projectHref = (category: string, project: string) =>
  `/showcase/${category}/${project}`;

// The projects of a category: each protocol with a notebook about it, and
// those notebooks, case studies first. Order follows the notebooks given.
export function projectsOf(notebooks: ShowcaseNotebook[]): ShowcaseProject[] {
  const projects = new Map<string, ShowcaseProject>();

  notebooks.forEach(notebook => {
    const name = notebook.showcase.protocol;
    if (!name) return;
    const slug = slugify(name);
    const project = projects.get(slug) ?? { name, slug, notebooks: [] };
    project.notebooks.push(notebook);
    projects.set(slug, project);
  });

  const caseStudiesFirst = (a: ShowcaseNotebook, b: ShowcaseNotebook) =>
    Number(b.showcase.kind === "case_study") -
    Number(a.showcase.kind === "case_study");

  return Array.from(projects.values()).map(project => ({
    ...project,
    notebooks: [...project.notebooks].sort(caseStudiesFirst),
  }));
}

// =====================================
// ⬢  Category cards
// =====================================
const unique = (values: string[]) => Array.from(new Set(values));

export function categoryStatus(
  category: string,
  notebooks: ShowcaseNotebook[]
): ShowcaseCategoryStatus {
  if (ofKind(notebooks, "case_study", category).length > 0) return "live";
  if (ofKind(notebooks, "category", category).length > 0) return "building";
  return "request";
}

// One card per taxonomy entry. Protocols with a case study come first, then
// the ones the taxonomy says are planned.
export function buildCategoryCards(
  notebooks: ShowcaseNotebook[],
  taxonomy: ShowcaseTaxonomy
): ShowcaseCategoryCard[] {
  return taxonomy.categories.map(entry => {
    const inCategory = notebooks.filter(
      n => n.showcase.category === entry.slug
    );
    const caseStudies = ofKind(inCategory, "case_study");
    const covered = caseStudies.flatMap(n =>
      n.showcase.protocol ? [n.showcase.protocol] : []
    );

    return {
      ...entry,
      status: categoryStatus(entry.slug, notebooks),
      // What the notebooks cover, plus what the taxonomy says the category
      // is on.
      chains: inChainOrder(
        [
          ...inCategory.flatMap(n => n.showcase.chains),
          ...(entry.chains ?? []),
        ],
        taxonomy
      ),
      countries: unique(
        inCategory.flatMap(n =>
          n.showcase.country ? [n.showcase.country] : []
        )
      ),
      protocols: unique([...covered, ...(entry.protocols ?? [])]),
      caseStudyCount: caseStudies.length,
    };
  });
}

// =====================================
// ⬢  Filters
// =====================================
// Chains in the configured order; ones the config does not list come after.
function inChainOrder(chains: string[], taxonomy: ShowcaseTaxonomy): string[] {
  const rank = (chain: string) => {
    const index = taxonomy.chainOrder.indexOf(chain);
    return index === -1 ? taxonomy.chainOrder.length : index;
  };
  return unique(chains).sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

// The chains to offer as filters: every chain a category is on.
export function chainsPresent(
  cards: ShowcaseCategoryCard[],
  taxonomy: ShowcaseTaxonomy
): string[] {
  return inChainOrder(
    cards.flatMap(card => card.chains),
    taxonomy
  );
}

const matchesSearch = (card: ShowcaseCategoryCard, search: string) => {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [
    card.name,
    card.question,
    ...card.protocols,
    ...card.chains,
    ...card.countries,
  ].some(text => text.toLowerCase().includes(needle));
};

export function filterCards(
  cards: ShowcaseCategoryCard[],
  filters: ShowcaseFilters
): ShowcaseCategoryCard[] {
  return cards.filter(
    card =>
      (filters.group === "all" || card.group === filters.group) &&
      (filters.chain === null || card.chains.includes(filters.chain)) &&
      matchesSearch(card, filters.search)
  );
}

// How many categories each group has, with "all" as the total.
export function groupCounts(
  cards: ShowcaseCategoryCard[]
): Record<ShowcaseGroupFilter, number> {
  const counts = { all: cards.length } as Record<ShowcaseGroupFilter, number>;
  cards.forEach(card => {
    counts[card.group] = (counts[card.group] ?? 0) + 1;
  });
  return counts;
}
