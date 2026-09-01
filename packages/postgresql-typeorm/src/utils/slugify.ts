/** Derives a URL-safe slug from a real title (e.g. for a document's `slug`/`publishedSlug`). */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
