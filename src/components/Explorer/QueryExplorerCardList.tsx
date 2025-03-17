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
      <ul className="px-2 mt-4 divide-y divide-borderLight ">
        {query.map(item => (
          <li
            key={item.id}
            className="p-4 py-1.5   rounded transition-colors mb-3 cursor-pointer "
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 p-2 rounded-lg">
                <AiOutlineCode size={20} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium ">{item.name}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
