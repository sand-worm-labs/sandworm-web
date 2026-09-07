"use client";

import Image from "next/image";

import type { QueryPagination, ApiDocument } from "@/types";
import { ExploreCard } from "@/components/Explore/ExploreCard";
import { ExploreListLoadMoreSkeleton } from "@/components/Explore/ExploreSkeletons";

interface IQueryListProps {
  documents: ApiDocument[] | null;
  pagination?: QueryPagination;
  loadingMore?: boolean;
}

const COLUMN_HEADERS = ["Username", "Title", "Tags", "Actions"] as const;

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
      <div className="mb-8 my-6 overflow-x-auto border border-border-secondary dark:border-border-tertiary rounded-xl">
        <table className="w-full border-collapse">
          <thead className="border-b border-border-secondary dark:border-border-tertiary">
            <tr>
              {COLUMN_HEADERS.map(header => (
                <th
                  key={header}
                  className={
                    header === "Actions"
                      ? "text-right p-4 text-xs font-bold text-ink-400 uppercase"
                      : "text-left p-4 text-xs font-bold text-ink-400 uppercase"
                  }
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody aria-busy={loadingMore || undefined}>
            {documents.map(query => (
              <ExploreCard key={query.id} query={query} />
            ))}
            {loadingMore && <ExploreListLoadMoreSkeleton />}
          </tbody>
        </table>
      </div>
    </div>
  );
};
