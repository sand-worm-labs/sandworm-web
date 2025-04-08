import React, { useState } from "react";
import { AiOutlineCode } from "react-icons/ai";
import { Search } from "lucide-react";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";

import type { Query } from "@/types";
import { useSandwormStore } from "@/store";

import { Input } from "../ui/input";

interface IQueryExplorerCardListProps {
  query: Query[];
}

export const QueryExplorerCardList: React.FC<IQueryExplorerCardListProps> = ({
  query,
}) => {
  const { createTab } = useSandwormStore();
  const [search, setSearch] = useState("");

  const openQueryInTab = (queryData: any) => {
    createTab(queryData.name, "sql", queryData.query);
  };

  const filteredQueries = query.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-4">
      <div className="relative w-full px-3">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-text-gray"
          size={16}
        />
        <Input
          type="text"
          placeholder="Search Queries"
          className="pl-10 pr-4 py-1.5 border border-[#ffffff60] focus:border-gray-500 focus:ring focus:ring-gray-300 md:text-[0.85rem] bg-[#1A1A1A] border-none w-full rounded-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <ul className="flex flex-col w-full my-4">
        {filteredQueries.length > 0 ? (
          filteredQueries.map(item => (
            <button
              key={item.id}
              className="cursor-pointer p-3 border-b hover:bg-white/10 text-sm text-left flex items-center justify-between lowercase font-medium py-5 first:border-t"
              type="button"
              onClick={() => openQueryInTab(item)}
            >
              <span className="flex space-x-2 items-center">
                <AiOutlineCode size={18} />
                <span className="text-sm capitalize">{item.title}</span>
              </span>
              <MdKeyboardDoubleArrowRight />
            </button>
          ))
        ) : (
          <div className="text-center text-sm text-muted-foreground pt-8">
            no matching queries
          </div>
        )}
      </ul>
    </div>
  );
};
