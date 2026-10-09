import { gql } from "@apollo/client";

import { getServerClient } from "@/graphql/server";
import type { ShowcaseConfig, ShowcaseNotebook } from "@/types";

// =====================================
// ⬢  Query
// =====================================
const SHOWCASE_NOTEBOOKS = gql`
  query GetShowcaseNotebooks($category: String, $kind: String) {
    getShowcaseNotebooks(category: $category, kind: $kind) {
      id
      slug
      title
      description
      publishedAt
      author
      showcase
    }
  }
`;

// =====================================
// ⬢  Fetch
// =====================================
// The official notebooks on the Showcase. A failed fetch gives an empty
// list, so the index still shows every category (as "Request") instead of
// an error page.
export async function fetchShowcaseNotebooks(
  category?: string
): Promise<ShowcaseNotebook[]> {
  try {
    const client = await getServerClient();
    const { data } = await client.query<{
      getShowcaseNotebooks: ShowcaseNotebook[];
    }>({ query: SHOWCASE_NOTEBOOKS, variables: { category } });
    return data?.getShowcaseNotebooks ?? [];
  } catch (err) {
    console.error("[showcase] fetch failed:", err);
    return [];
  }
}

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:8003";

const EMPTY_CONFIG: ShowcaseConfig = {
  taxonomy: { groups: [], chainOrder: [], categories: [] },
  chains: {},
  templates: { case_study: { sections: [] }, category: { sections: [] } },
};

// What the Showcase is laid out from: groups, categories, chains and template
// sections, all kept in the database. It is the same for every visitor, so it
// is asked for without their cookies and kept for a minute; a page and its
// metadata asking at once share one answer. A failed fetch gives an empty
// Showcase.
export async function fetchShowcaseConfig(): Promise<ShowcaseConfig> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ getShowcaseConfig }" }),
      next: { revalidate: 60 },
    });
    const { data } = (await res.json()) as {
      data?: { getShowcaseConfig?: ShowcaseConfig };
    };
    return data?.getShowcaseConfig ?? EMPTY_CONFIG;
  } catch (err) {
    console.error("[showcase] config fetch failed:", err);
    return EMPTY_CONFIG;
  }
}
