import { Suspense } from "react";

import { ExploreClient } from "@/components/Explore/ExplorerClient";
import { ShowcaseHeader } from "@/components/Showcase/ShowcaseHeader";
import {
  EXPLORE_PAGE_SIZE,
  exploreMetadata,
  fetchInitialExploreData,
} from "@/components/Explore/fetchInitialExploreData";

export const metadata = exploreMetadata;

export default async function PublicExplorePage() {
  const { initialDocuments, initialFeatured, serverError } =
    await fetchInitialExploreData();

  return (
    <div className="flex flex-col h-[100dvh] bg-base-100 font-body">
      <ShowcaseHeader active="community" />
      <main className="flex-1 min-w-0 overflow-y-auto bg-page-surface dark:text-white">
        <div className="pt-5 px-4 sm:px-8 pb-10">
          <Suspense fallback={null}>
            <ExploreClient
              initialDocuments={initialDocuments}
              initialFeatured={initialFeatured}
              serverError={serverError}
              pageSize={EXPLORE_PAGE_SIZE}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
