import React, { useState } from "react";
import { AiOutlineCode } from "react-icons/ai";
import { Search, Trash2 } from "lucide-react";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { useRouter } from "next/navigation";

import type { Query } from "@/types";
import { useDeleteQuery } from "@/hooks/useDeleteQuery";

import { Input } from "../ui/input";
import { DeleteQueryModal } from "../WorkSpace/DeleteQueryModal";

interface IQueryExplorerCardListProps {
  query: Query[];
}

export const QueryExplorerCardList: React.FC<IQueryExplorerCardListProps> = ({
  query,
}) => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);
  const { handleDelete } = useDeleteQuery();

  const openQueryInTab = (queryData: any) => {
    router.push(`/workspace/${queryData.id}`);
  };

  const handleDeleteClick = (id: string) => {
    setActiveDeleteId(id);
    handleDelete(id);
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
            <li key={item.id} className="border-b first:border-t flex  ">
              <button
                type="button"
                className="cursor-pointer hover:bg-white/10 text-sm flex flex-1 items-center justify-between lowercase font-medium text-left py-5 pl-3 "
                onClick={() => openQueryInTab(item)}
              >
                <span className="flex flex-1 space-x-2 items-center">
                  <AiOutlineCode size={18} />
                  <span className="text-sm capitalize ml-1.5">
                    {item.title}
                  </span>
                </span>
                <div className="flex items-center space-x-2">
                  <MdKeyboardDoubleArrowRight />
                </div>
              </button>
              <DeleteQueryModal
                open={activeDeleteId === item.id}
                onOpenChange={open =>
                  !open ? setActiveDeleteId(null) : setActiveDeleteId(item.id)
                }
                onDelete={() => handleDeleteClick(item.id)}
              />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setActiveDeleteId(item.id);
                }}
                className="text-red-500 hover:text-red-600 px-3 pr-3"
              >
                <Trash2 size={18} />
              </button>
            </li>
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
