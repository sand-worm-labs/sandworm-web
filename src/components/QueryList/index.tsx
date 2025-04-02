import { useState } from "react";
import ReactPaginate from "react-paginate";

import type { Query } from "@/types";

import QueryCard from "../QueryCard";

const QueryList: React.FC<{ queries: Query[] }> = ({ queries }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const pageCount = Math.ceil(queries.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentItems = queries.slice(offset, offset + itemsPerPage);

  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    window.scrollTo(0, 0);
  };

  return (
    <div className="mb-16">
      <div className="grid grid-cols-1 gap-4 mb-8">
        {currentItems.map(query => (
          <QueryCard key={query.id} query={query} />
        ))}
      </div>

      <ReactPaginate
        previousLabel="< Previous"
        nextLabel="Next >"
        pageCount={pageCount}
        onPageChange={handlePageChange}
        containerClassName="flex justify-center items-center gap-2 text-sm"
        pageClassName="px-3 py-1 rounded hover:bg-gray-100 hover:text-black"
        previousClassName="px-3 py-1 rounded hover:bg-gray-100 hover:text-black"
        nextClassName="px-3 py-1 rounded hover:bg-gray-100  hover:text-black"
        previousLinkClassName="text-orange-500"
        nextLinkClassName="text-orange-500"
        breakClassName="px-3 py-1"
        breakLinkClassName="text-gray-500"
        activeClassName="bg-white text-black"
        activeLinkClassName="text-black hover:text-black"
        disabledClassName="text-gray-300 cursor-not-allowed"
      />
    </div>
  );
};

export default QueryList;
