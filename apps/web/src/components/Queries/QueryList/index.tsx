"use client";

import Image from "next/image";

import type { QueryPagination, ApiDocument } from "@/types";
import { ExploreCard } from "@/components/Explore/ExploreCard";
import { ExploreListLoadMoreSkeleton } from "@/components/Explore/ExploreSkeletons";
import { ListTable } from "@/components/Explore/ListTable";

interface IQueryListProps {
  documents: ApiDocument[] | null;
  pagination?: QueryPagination;
  loadingMore?: boolean;
}

const COLUMN_HEADERS = ["Author", "Notebook", "Tags", "Stars · Forks"] as const;

export const QueryList: React.FC<IQueryListProps> = ({
  documents,
  loadingMore = false,
}) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="py-6 flex flex-col items-center justify-center">
        <Image src="/img/nodata.svg" width={300} height={300} alt="no data" />
        <p className="mt-4 text-sm font-medium">
          Looks like there’s nothing to show right now.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-16 h-full justify-between flex flex-col">
      <ListTable headers={COLUMN_HEADERS} busy={loadingMore} className="mb-8">
        {documents.map(query => (
          <ExploreCard key={query.id} query={query} />
        ))}
        {loadingMore && <ExploreListLoadMoreSkeleton />}
      </ListTable>
    </div>
  );
};
