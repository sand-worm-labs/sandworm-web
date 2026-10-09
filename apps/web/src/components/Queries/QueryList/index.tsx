"use client";

import Image from "next/image";

import type { QueryPagination, ApiDocument } from "@/types";
import { ExploreCard } from "@/components/Explore/ExploreCard";
import { ExploreListLoadMoreSkeleton } from "@/components/Explore/ExploreSkeletons";
import { boardClass, boardHeadClass } from "@/components/Showcase/BoardKit";

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
      <div className={`mb-8 overflow-x-auto ${boardClass}`}>
        <table className="block md:table w-full border-collapse">
          <thead className={`hidden md:table-header-group ${boardHeadClass}`}>
            <tr>
              {COLUMN_HEADERS.map(header => (
                <th
                  key={header}
                  className={
                    header === COLUMN_HEADERS[3]
                      ? "text-right px-4 py-2.5 font-normal"
                      : "text-left px-4 py-2.5 font-normal"
                  }
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className="block md:table-row-group"
            aria-busy={loadingMore || undefined}
          >
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
