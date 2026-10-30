import type { Metadata } from "next";

import type { ChildrenProps } from "@/types";

import {
  buildNotebookMetadata,
  type PublishedDocMeta,
} from "./notebookMetadata";

// ─────────────────────────────────────────────────────────────
// ⬢ CONSTANTS
// ─────────────────────────────────────────────────────────────
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://app.sandwormlab.xyz/api";

const PUBLISHED_DOC_QUERY = `
  query GetPublishedDocumentMeta($slug: String!) {
    getPublishedDocumentBySlug(slug: $slug) {
      title
      description
      tags
      visibility
      publishedAt
      updatedAt
      author { username firstName lastName }
    }
  }
`;

// ─────────────────────────────────────────────────────────────
// ⬢ HELPERS
// ─────────────────────────────────────────────────────────────
async function fetchPublishedDoc(
  slug: string
): Promise<PublishedDocMeta | null> {
  try {
    const res = await fetch(`${API_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: PUBLISHED_DOC_QUERY,
        variables: { slug },
      }),
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.getPublishedDocumentBySlug ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// ⬢ METADATA
// The notebook page is a client component, so link-preview crawlers
// (WhatsApp, Telegram, X, Slack) never see its title. Resolve it here
// on the server so shared links render like a blog post. An unlisted
// notebook also tells search engines to skip it (see notebookMetadata).
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildNotebookMetadata(await fetchPublishedDoc(slug), slug);
}

export default function PublicNotebookLayout({ children }: ChildrenProps) {
  return children;
}
