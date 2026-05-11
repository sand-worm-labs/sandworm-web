"use client";

import { useCallback, useMemo } from "react";
import Image from "next/image";

import {
  usePublicDocuments,
  type DocumentFilter,
} from "@/components/Editor/hooks/usePublicDocuments";
import { useInfiniteScroll } from "@/components/Editor/hooks/useInfiniteScroll";
import { useDocumentSortParam } from "@/components/Editor/hooks/useDocumentSortParams";
import { useSession } from "@/components/Editor/hooks/useAuth";
import { QueryList } from "@/components/Queries/QueryList";
import { EmptyQueryState } from "@/components/EmptyState/EmptyQueryState";
import { SortControl, type SortOption } from "@/components/Explore/SortControl";
import { FeaturedExploreSection } from "@/components/Explore/FeaturedExploreSection";
import type { ApiDocument } from "@/types";

// =====================================
// ⬢ Types
// =====================================
export type ViewMode = "grid" | "list";

interface ExploreClientProps {
  initialDocuments: ApiDocument[];
  initialFeatured: ApiDocument[];
  serverError: string | null;
  pageSize: number;
}

// =====================================
// ⬢ Utils
// =====================================
function sortToFilter(
  sort: SortOption,
  viewerId: string | null
): DocumentFilter {
  switch (sort) {
    case "trending":
      return { kind: "trending" };
    case "your-forks":
      return viewerId
        ? { kind: "forked", userId: viewerId }
        : { kind: "trending" };
    case "your-favourites":
      return viewerId
        ? { kind: "favorites", userId: viewerId }
        : { kind: "trending" };
    case "most-popular":
      return { kind: "trending" };
    default:
      return { kind: "trending" };
  }
}

const Spinner = () => (
  <div className="h-6 w-6 border-2 border-ink-300 border-t-transparent rounded-full animate-spin" />
);

const ListSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-40 rounded-lg bg-neutral-100 dark:bg-neutral-800 animate-pulse"
      />
    ))}
  </div>
);

// =====================================
// ⬢ Main Explorer Client
// =====================================
export function ExploreClient({
  initialDocuments,
  initialFeatured,
  serverError,
  pageSize,
}: ExploreClientProps) {
  const { user } = useSession({ redirectToLogin: true });
  const userId = user?.id;
  const { sortBy, setSortBy } = useDocumentSortParam();

  const filter = useMemo(
    () => sortToFilter(sortBy, userId ?? null),
    [sortBy, userId]
  );
  const isDefault = filter.kind === "trending";

  const handleSortChange = useCallback(
    (next: SortOption) => {
      setSortBy(next);
      // ⬢ Reset scroll so switching filters doesn't leave users deep-scrolled
      // into a shorter list.
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    },
    [setSortBy]
  );

  const {
    documents,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    featured,
    featuredLoading,
  } = usePublicDocuments({
    filter,
    initialDocuments: isDefault ? initialDocuments : [],
    initialFeatured,
    pageSize,
  });

  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMore,
  });

  const disabledSorts: SortOption[] = [
    "most-popular",
    ...(userId ? [] : (["your-forks", "your-favourites"] as SortOption[])),
  ];

  const isHardError =
    documents.length === 0 && !loading && (error || serverError);

  if (isHardError) {
    return (
      <div className="flex items-center justify-center flex-col dark:text-white font-medium text-lg mt-16 px-3">
        <Image src="/img/nodata.svg" width={400} height={400} alt="no data" />
        <p className="mt-4 text-sm text-ink-400">
          Something went wrong fetching queries. Try again.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between">
        <p className="text-ink-200 dark:text-ink-300 text-sm mb-6 mt-4">
          Discover the latest trends in the crypto ecosystem.
        </p>
      </div>

      <div className="w-full container mx-auto">
        <FeaturedExploreSection featured={featured} loading={featuredLoading} />
      </div>

      <div className="flex justify-between items-center mt-6 mb-4 container mx-auto">
        <SortControl
          sortBy={sortBy}
          onSortChange={handleSortChange}
          disabledOptions={disabledSorts}
        />
      </div>

      <div className="container mx-auto">
        {documents.length === 0 && loading ? (
          <ListSkeleton />
        ) : documents.length === 0 ? (
          <EmptyQueryState message="No queries available." />
        ) : (
          <>
            <QueryList documents={documents} />

            <div ref={sentinelRef} aria-hidden="true" className="h-1" />

            {loadingMore && (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            )}

            {!hasMore && documents.length > 0 && (
              <div className="text-center text-ink-300 text-sm py-6">
                You&apos;ve reached the end.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
