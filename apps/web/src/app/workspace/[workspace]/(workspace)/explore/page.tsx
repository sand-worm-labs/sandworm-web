import { Suspense } from "react";

import {
  GetTrendingPublishedDocumentsDocument,
  GetFeaturedDocumentsDocument,
  type GetTrendingPublishedDocumentsQuery,
  type GetFeaturedDocumentsQuery,
} from "@/generated/graphql";
import { getServerClient } from "@/graphql/server";
import { ExploreClient } from "@/components/Explore/ExplorerClient";
import type { ApiDocument } from "@/types";

const PAGE_SIZE = 20;
const FEATURED_LIMIT = 4;

export const metadata = {
  title: "Explore Queries – Sandworm",
  description:
    "Browse public onchain queries from the community. Discover insights across Sui, Base, Ethereum, Optimism and more.",
};

async function fetchInitialData() {
  const client = await getServerClient();

  try {
    console.log("trying");
    const [explorer, featured] = await Promise.all([
      client.query<GetTrendingPublishedDocumentsQuery>({
        query: GetTrendingPublishedDocumentsDocument,
        variables: { limit: PAGE_SIZE, offset: 0 },
      }),
      client.query<GetFeaturedDocumentsQuery>({
        query: GetFeaturedDocumentsDocument,
        variables: { limit: FEATURED_LIMIT },
      }),
    ]);

    console.log(
      "[SSR] trending count:",
      explorer.data?.getTrendingPublishedDocuments?.length
    );
    console.log(
      "[SSR] featured count:",
      featured.data?.getFeaturedDocuments?.length
    );

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

export default async function ExplorePage() {
  const { initialDocuments, initialFeatured, serverError } =
    await fetchInitialData();

  return (
    <div className="dark:text-white bg-[#FEFEFF] min-h-[88vh] dark:bg-base-200">
      <div className="pt-5 px-8">
        <Suspense fallback={null}>
          <ExploreClient
            initialDocuments={initialDocuments}
            initialFeatured={initialFeatured}
            serverError={serverError}
            pageSize={PAGE_SIZE}
          />
        </Suspense>
      </div>
    </div>
  );
}
