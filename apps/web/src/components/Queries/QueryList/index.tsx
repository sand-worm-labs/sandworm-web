"use client";

import ReactPaginate from "react-paginate";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

import { useIsMobile } from "@/hooks/useMobile";
import type { Query, QueryPagination } from "@/types";
import { ExploreCard } from "@/components/Explore/ExploreCard";

interface IQueryListProps {
  queries: Query[] | null;
  pagination: QueryPagination;
}

export const QueryList: React.FC<IQueryListProps> = ({
  queries,
  pagination,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const isMobile = useIsMobile();

  const handlePageChange = ({ selected }: { selected: number }) => {
    const newPage = selected + 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`workspace/explore?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  if (!queries || queries.length === 0) {
    return (
      <div className="py-6 flex flex-col items-center justify-center">
        <Image src="/img/nodata.svg" width={300} height={300} alt="no data" />
        <p className="mt-4 text-sm font-medium">
          Looks like there’s nothing to show right now.
        </p>
      </div>
    );
  }

  const queriesWithLikeStatus = queries.map(query => ({
    ...query,
    liked: query.stared_by.includes(userId),
  }));

  return (
    <div className="mb-16 h-full justify-between flex flex-col">
      <div className="grid grid-cols-1 gap-2 mb-8">
        {queriesWithLikeStatus.map(query => (
          <ExploreCard
            key={query.id}
            query={query}
            liked={query.liked}
            viewMode="compact"
          />
        ))}
      </div>

      <ReactPaginate
        previousLabel="< Previous"
        nextLabel="Next >"
        pageCount={pagination.total_pages}
        forcePage={(pagination.current_page ?? 1) - 1}
        onPageChange={handlePageChange}
        containerClassName="flex justify-center items-center gap-2 text-sm"
        pageClassName="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#181C21] dark:hover:text-white  hover:text-black"
        previousClassName="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#181C21] dark:hover:text-white  hover:text-black"
        nextClassName="px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-[#181C21] dark:hover:text-white hover:text-black"
        previousLinkClassName="text-[#C7665C]"
        nextLinkClassName="text-[#C7665C]"
        breakClassName="px-3 py-1"
        breakLinkClassName="text-gray-500"
        activeClassName="bg-transparent text-black dark:text-[#868E96]"
        activeLinkClassName="text-black dark:text-[#868E96] hover:text-black"
        disabledClassName="text-gray-300 cursor-not-allowed"
        pageRangeDisplayed={isMobile ? 2 : 3}
        marginPagesDisplayed={isMobile ? 1 : 2}
      />
    </div>
  );
};
