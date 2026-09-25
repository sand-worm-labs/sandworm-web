import { Suspense } from "react";

import { ExploreClient } from "@/components/Explore/ExplorerClient";
import {
  EXPLORE_PAGE_SIZE,
  exploreMetadata,
  fetchInitialExploreData,
} from "@/components/Explore/fetchInitialExploreData";

export const metadata = exploreMetadata;

export default async function ExplorePage() {
  const { initialDocuments, initialFeatured, serverError } =
    await fetchInitialExploreData();

  return (
    <div className="dark:text-white bg-page-surface min-h-[88vh]">
      <div className="pt-5 px-8">
        <Suspense fallback={null}>
          <ExploreClient
            initialDocuments={initialDocuments}
            initialFeatured={initialFeatured}
            serverError={serverError}
            pageSize={EXPLORE_PAGE_SIZE}
          />
        </Suspense>
      </div>
    </div>
  );
}
