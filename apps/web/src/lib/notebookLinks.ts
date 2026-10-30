// The address of an unlisted notebook: the public notebook page, at its secret slug. The slug is made by the
// server when the notebook is saved as unlisted (see DocumentService.setDocumentUnlisted).
export function unlistedNotebookUrl(
  publicUrl: string,
  document: { visibility?: string; slug?: string | null }
): string | null {
  if (document.visibility !== "UNLISTED" || !document.slug) return null;
  return `${publicUrl.replace(/\/$/, "")}/notebooks/${document.slug}`;
}
