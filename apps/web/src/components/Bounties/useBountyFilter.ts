import { useMemo, useState } from "react";

import type { Bounty } from "./bounties";

export const ALL_TYPES = "All";

export const useBountyFilter = (bounties: Bounty[]) => {
  const [type, setType] = useState(ALL_TYPES);
  const [query, setQuery] = useState("");

  const types = useMemo(
    () => [
      ALL_TYPES,
      ...Array.from(new Set(bounties.map(bounty => bounty.type))),
    ],
    [bounties]
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bounties.filter(
      bounty =>
        (type === ALL_TYPES || bounty.type === type) &&
        (!needle ||
          [bounty.title, bounty.sponsor, bounty.summary].some(text =>
            text?.toLowerCase().includes(needle)
          ))
    );
  }, [bounties, type, query]);

  const clearFilters = () => {
    setType(ALL_TYPES);
    setQuery("");
  };

  return { types, type, setType, query, setQuery, filtered, clearFilters };
};
