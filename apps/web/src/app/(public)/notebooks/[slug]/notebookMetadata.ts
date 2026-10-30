import type { Metadata } from "next";

import { OG_IMAGE } from "@/lib/ogImage";

// What the notebook page says about itself in its <head>. Kept apart from layout.tsx, which may only export what
// Next.js knows (a layout file cannot export a helper), so the rules can be tested.

export const FALLBACK_DESCRIPTION =
  "A published blockchain data analysis on Sandworm.";

export interface PublishedDocMeta {
  title: string | null;
  description: string | null;
  tags: string[] | null;
  visibility?: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  author: {
    username: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

function authorName(author: PublishedDocMeta["author"]): string | null {
  if (!author) return null;
  const full = [author.firstName, author.lastName].filter(Boolean).join(" ");
  return full || author.username || null;
}

// An unlisted notebook is shared by a secret link and listed nowhere. Search engines are asked to skip it, and the
// browser is told not to send this address on to the sites its links lead to (it is a secret, and a Referer
// header would hand it over).
const UNLISTED_ROBOTS: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false, noimageindex: true },
};

export function buildNotebookMetadata(
  doc: PublishedDocMeta | null,
  slug: string
): Metadata {
  if (!doc?.title) return {};

  const { title } = doc;
  const description = doc.description?.trim() || FALLBACK_DESCRIPTION;
  const author = authorName(doc.author);
  const unlisted = doc.visibility === "UNLISTED";

  return {
    title,
    description,
    keywords: doc.tags ?? undefined,
    authors: author ? [{ name: author }] : undefined,
    ...(unlisted
      ? { robots: UNLISTED_ROBOTS, referrer: "no-referrer" as const }
      : { alternates: { canonical: `/notebooks/${slug}` } }),
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
