import type { Metadata } from "next";

import type { ChildrenProps } from "@/types";

// ─────────────────────────────────────────────────────────────
// ⬢ CONSTANTS
// ─────────────────────────────────────────────────────────────
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://app.sandwormlab.xyz/api";
const OG_IMAGE = {
  url: "/og-thumbnail.png",
  width: 1200,
  height: 630,
  alt: "Sandworm",
};
const FALLBACK_DESCRIPTION =
  "A published blockchain data analysis on Sandworm.";

const PUBLISHED_DOC_QUERY = `
  query GetPublishedDocumentMeta($slug: String!) {
    getPublishedDocumentBySlug(slug: $slug) {
      title
      description
      tags
      publishedAt
      updatedAt
      author { username firstName lastName }
    }
  }
`;

interface PublishedDocMeta {
  title: string | null;
  description: string | null;
  tags: string[] | null;
  publishedAt: string | null;
  updatedAt: string | null;
  author: {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

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

function authorName(author: PublishedDocMeta["author"]): string | null {
  if (!author) return null;
  const full = [author.firstName, author.lastName].filter(Boolean).join(" ");
  return full || author.username || null;
}

// ─────────────────────────────────────────────────────────────
// ⬢ METADATA
// The notebook page is a client component, so link-preview crawlers
// (WhatsApp, Telegram, X, Slack) never see its title. Resolve it here
// on the server so shared links render like a blog post.
// ─────────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await fetchPublishedDoc(slug);
  if (!doc?.title) return {};

  const { title } = doc;
  const description = doc.description?.trim() || FALLBACK_DESCRIPTION;
  const author = authorName(doc.author);

  return {
    title,
    description,
    keywords: doc.tags ?? undefined,
    authors: author ? [{ name: author }] : undefined,
    alternates: { canonical: `/notebooks/${slug}` },
    openGraph: {
      type: "article",
      siteName: "Sandworm",
      title,
      description,
      url: `/notebooks/${slug}`,
      images: [OG_IMAGE],
      publishedTime: doc.publishedAt ?? undefined,
      modifiedTime: doc.updatedAt ?? undefined,
      authors: author ? [author] : undefined,
      tags: doc.tags ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

export default function PublicNotebookLayout({ children }: ChildrenProps) {
  return children;
}
