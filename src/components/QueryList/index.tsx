import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";

import QueryCard from "../QueryCard";

import { queries } from "./queries";

const QueryList: React.FC = () => {
  const [visibleQueries, setVisibleQueries] = useState(10);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && visibleQueries < queries.length) {
      setVisibleQueries(prev => prev + 10);
    }
  }, [inView, visibleQueries]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {queries.slice(0, visibleQueries).map((query, index) => (
          <QueryCard
            key={query.id}
            query={query}
            ref={index === visibleQueries - 1 ? ref : null}
          />
        ))}
      </div>
    </div>
  );
};

export default QueryList;
