import QueryCard from "../QueryCard";

import { queries } from "./queries";

const QueryList: React.FC = () => {
  return (
    <div className="grid grid-cols-1  gap-4">
      {queries.map(query => (
        <QueryCard key={query.id} query={query} />
      ))}
    </div>
  );
};

export default QueryList;
