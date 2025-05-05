"use client";

import ReactPaginate from "react-paginate";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { SquareTerminal } from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

import type { Query, QueryPagination } from "@/types";
import { QueryCard } from "../QueryCard";

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
    router.push(`/explore?${params.toString()}`);
    window.scrollTo(0, 0);
  };

  if (!queries || queries.length === 0) {
    return (
      <div className="py-6 flex flex-col items-center justify-center">
        <SquareTerminal size={40} />
        <p className="text-text-gray mt-2">No query yet</p>
      </div>
    );
  }

  const queriesWithLikeStatus = queries.map(query => ({
    ...query,
    liked: query.stared_by.includes(userId),
  }));

  return (
    <div className="mb-16">
      <div className="grid grid-cols-1 gap-4 mb-8">
        {queriesWithLikeStatus.map(query => (
          <QueryCard key={query.id} query={query} liked={query.liked} />
        ))}
      </div>

      <ReactPaginate
        previousLabel="< Previous"
        nextLabel="Next >"
        pageCount={pagination.total_pages}
        forcePage={(pagination.current_page ?? 1) - 1}
        onPageChange={handlePageChange}
        containerClassName="flex justify-center items-center gap-2 text-sm"
        pageClassName="px-3 py-1 rounded hover:bg-gray-100 hover:text-black"
        previousClassName="px-3 py-1 rounded hover:bg-gray-100 hover:text-black"
        nextClassName="px-3 py-1 rounded hover:bg-gray-100 hover:text-black"
        previousLinkClassName="text-orange-500"
        nextLinkClassName="text-orange-500"
        breakClassName="px-3 py-1"
        breakLinkClassName="text-gray-500"
        activeClassName="bg-white text-black"
        activeLinkClassName="text-black hover:text-black"
        disabledClassName="text-gray-300 cursor-not-allowed"
        pageRangeDisplayed={isMobile ? 2 : 3}
        marginPagesDisplayed={isMobile ? 1 : 2}
      />
    </div>
  );
};
