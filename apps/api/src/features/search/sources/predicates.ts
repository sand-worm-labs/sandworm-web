// SQL shared by the sources, so a rule such as "a notebook is public when..." is written
// once. `d` is always the document table.

// A notebook anyone can open at /notebooks/:slug.
export const PUBLIC_NOTEBOOK = `
  d.visibility = 'PUBLIC'
  AND d.deleted_at IS NULL
  AND d."publishedAt" IS NOT NULL
  AND d.slug IS NOT NULL
`;

// A notebook that is part of the Showcase: public, in an official workspace, and marked
// published in its Showcase metadata. Anyone can tag their own notebook, so the workspace
// is what makes one official. `ids` is the placeholder of the workspace ids parameter.
export const officialShowcaseNotebook = (ids: string) => `
  ${PUBLIC_NOTEBOOK}
  AND d.workspace_id::text = ANY(${ids}::text[])
  AND d.showcase->>'status' = 'published'
`;

// Showcase categories that have something to open: a case study or a category notebook.
// A category without one is left off the Showcase page, so it is left out of search too.
export const categoryHasContent = (categorySlug: string, ids: string) => `
  EXISTS (
    SELECT 1 FROM document d
    WHERE ${officialShowcaseNotebook(ids)}
      AND d.showcase->>'category' = ${categorySlug}
      AND d.showcase->>'kind' IN ('case_study', 'category')
  )
`;

// How the web app turns a name into a URL segment (slugify in apps/web/src/lib/showcase.ts).
export const slugify = (expression: string) =>
  `btrim(regexp_replace(lower(${expression}), '[^a-z0-9]+', '-', 'g'), '-')`;

// The name to show for a person.
export const displayName = (user: string) =>
  `coalesce(nullif(${user}.full_name, ''), ${user}.username)`;
