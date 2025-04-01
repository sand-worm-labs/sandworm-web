import React from "react";
import { AiOutlineCode } from "react-icons/ai";

import { Input } from "../ui/input";

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
    <div className="px-2 py-4">
      <Input
        type="text"
        placeholder="Find Query..."
        className="m-auto w-full focus:ring-0"
      />
      <ul className="flex flex-col gap-2 p-4 border w-full mt-4">
        {query.map(item => (
          <button
            key={item.id}
            className="cursor-pointer py-2 px-2 rounded-md hover:bg-primary/10 text-sm text-left flex items-center space-x-2 lowercase font-medium"
            type="button"
          >
            <AiOutlineCode size={15} />

            <span className="text-sm font-medium ">{item.name}</span>
          </button>
        ))}
      </ul>
    </div>
  );
};
