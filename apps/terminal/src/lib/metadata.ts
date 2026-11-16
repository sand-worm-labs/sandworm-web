import type { Metadata } from "next";

import { site } from "@/config/site";

// A page's tab title ends with the site name, and so does the title shared in
// link previews. Next only applies the title template to `title`, so the
// Open Graph title is written out here.
export const TITLE_TEMPLATE = `%s · ${site.title}`;

export function pageMetadata(title: string): Metadata {
  return {
    title,
    openGraph: {
      siteName: site.name,
      title: `${title} · ${site.title}`,
      description: site.description,
      type: "website",
    },
  };
}
