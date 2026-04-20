"use client";

import { useState } from "react";
import Image from "next/image";

import { usePublicDocuments } from "@/components/Editor/hooks/usePublicDocuments";
import { useInfiniteScroll } from "@/components/Editor/hooks/useInfiniteScroll";
import { QueryList } from "@/components/Queries/QueryList";
import { EmptyQueryState } from "@/components/EmptyState/EmptyQueryState";
import { SortControl } from "@/components/Explore/SortControl";
import { ViewControl } from "@/components/Explore/ViewControl";
import { FeaturedExploreSection } from "@/components/Explore/FeaturedExploreSection";
import type { ApiDocument } from "@/types";

// ─── TYPES ───
export type SortOption =
  | "trending"
  | "most-popular"
  | "recently-viewed"
  | "your-favourites";

export type ViewMode = "grid" | "list";

interface ExploreClientProps {
  initialDocuments: ApiDocument[];
  initialFeatured: ApiDocument[];
  serverError: string | null;
  pageSize: number;
}

// ─── MAIN ───
export function ExploreClient({
  initialDocuments,
  initialFeatured,
  serverError,
  pageSize,
}: ExploreClientProps) {
  const {
    documents,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    featured,
    featuredLoading,
  } = usePublicDocuments({ initialDocuments, initialFeatured, pageSize });

  console.log("initialDocuments", initialDocuments, "documents", documents)

  // UI-only until backend ships sort/view server-side. Kept for layout.
  const [sortBy, setSortBy] = useState<SortOption>("trending");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading: loading || loadingMore,
    onLoadMore: loadMore,
  });

  // Hard error: no data from SSR, no data from client, nothing loading.
  const isHardError =
    documents.length === 0 && !loading && (error || serverError);

  if (isHardError) {
    return (
      <div className="flex items-center justify-center flex-col dark:text-white font-medium text-lg mt-16 px-3">
        <Image src="/img/nodata.svg" width={400} height={400} alt="no data" />
        <p className="mt-4 text-sm text-ink-400">Something went wrong fetching queries. Try again.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ─── Header row ─── */}
      <div className="flex justify-between">
        <p className="text-ink-200 dark:text-ink-300 text-sm mb-6 mt-4">
          Discover the latest trends in the crypto ecosystem.
        </p>
        <ViewControl viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* ─── Featured ─── */}
      <div className="w-full container mx-auto">
        <FeaturedExploreSection featured={featured} loading={featuredLoading} />
      </div>

      {/* ─── Sort row ─── */}
      <div className="flex justify-between items-center mt-6 mb-4 container mx-auto">
        <SortControl sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      {/* ─── List ─── */}
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

// ─── MINI COMPONENTS ───
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