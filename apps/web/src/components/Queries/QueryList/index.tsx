"use client";

import Image from "next/image";

import type { QueryPagination, ApiDocument } from "@/types";
import { ExploreCard } from "@/components/Explore/ExploreCard";
import { useSession } from "@/components/Editor/hooks/useAuth";

interface IQueryListProps {
  documents: ApiDocument[] | null;
  pagination?: QueryPagination;
}

export const QueryList: React.FC<IQueryListProps> = ({ documents }) => {
  const { user: session } = useSession({ redirectToLogin: true });
  const userId = session?.id ?? "";

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

  /*  const queriesWithLikeStatus = documents.map(document => ({
     ...document,
     liked: document.stared_by.includes(userId),
   })); */

  return (
    <div className="mb-16 h-full justify-between flex flex-col">
      <div className="grid grid-cols-1 gap-2 mb-8 border border-[#E9ECEF] dark:border-border-tertiary rounded-xl px-3.5 py-5 my-6">
        {documents.map(query => (
          <ExploreCard key={query.id} query={query} viewMode="compact" />
        ))}
      </div>
    </div>
  );
};
