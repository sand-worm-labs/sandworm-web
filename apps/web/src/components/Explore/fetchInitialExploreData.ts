import {
  GetTrendingPublishedDocumentsDocument,
  GetFeaturedDocumentsDocument,
  type GetTrendingPublishedDocumentsQuery,
  type GetFeaturedDocumentsQuery,
} from "@/generated/graphql";
import { getServerClient } from "@/graphql/server";
import type { ApiDocument } from "@/types";

export const EXPLORE_PAGE_SIZE = 20;
const FEATURED_LIMIT = 4;

export const exploreMetadata = {
  title: "Explore Queries – Sandworm",
  description:
    "Browse public onchain queries from the community. Discover insights across Sui, Base, Ethereum, Optimism and more.",
};

export async function fetchInitialExploreData() {
  const client = await getServerClient();

  try {
    const [explorer, featured] = await Promise.all([
      client.query<GetTrendingPublishedDocumentsQuery>({
        query: GetTrendingPublishedDocumentsDocument,
        variables: { limit: EXPLORE_PAGE_SIZE, offset: 0 },
      }),
      client.query<GetFeaturedDocumentsQuery>({
        query: GetFeaturedDocumentsDocument,
        variables: { limit: FEATURED_LIMIT },
      }),
    ]);

    return {
      initialDocuments: (explorer.data?.getTrendingPublishedDocuments ??
        []) as ApiDocument[],
      initialFeatured: (featured.data?.getFeaturedDocuments ??
        []) as ApiDocument[],
      serverError: null as string | null,
    };
  } catch (err) {
    console.error("[explore] SSR fetch failed:", err);
    return {
      initialDocuments: [] as ApiDocument[],
      initialFeatured: [] as ApiDocument[],
      serverError: (err as Error).message,
    };
  }
}
