import React from "react";
import { AiOutlineCode } from "react-icons/ai";

import { Input } from "../ui/input";
import { Search } from "lucide-react";

interface IQuery {
  id: string;
  name: string;
}

interface IQueryExplorerCardListProps {
  query: IQuery[];
}

export const QueryExplorerCardList: React.FC<IQueryExplorerCardListProps> = ({
  query,
}) => {
  return (
    <div className=" py-4">
      <div className="relative w-full px-3">
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 text-text-gray"
          size={16}
        />
        <Input
          type="text"
          placeholder="Search Queries"
          className="pl-10 pr-4 py-1.5 border border-[#ffffff60] focus:border-gray-500 focus:ring focus:ring-gray-300 md:text-[0.85rem]  bg-[#1A1A1A] border-none w-full rounded-none"
        />
      </div>
      <ul className="flex flex-col    w-full my-4 ">
        {query.map(item => (
          <button
            key={item.id}
            className="cursor-pointer p-3 border-b  hover:bg-white/10 text-sm text-left flex items-center space-x-3 lowercase font-medium py-5  first:border-t "
            type="button"
          >
            <AiOutlineCode size={18} />

            <span className="text-sm capitalize ">{item.name}</span>
          </button>
        ))}
      </ul>
    </div>
  );
};
