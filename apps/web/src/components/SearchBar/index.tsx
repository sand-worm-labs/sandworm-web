"use client";

import { useRouter } from "next/navigation";
import { SearchPalette } from "@sandworm/ui/kit/search-palette";
import type {
  SearchEntryType,
  SearchHit,
} from "@sandworm/ui/kit/lib/search-types";

import { searchClient } from "@/lib/search/client";

// The header's search. The palette is shared with the other Sandworm apps; here a result
// is a path in this app.
export const SearchBar = ({
  onSelect,
}: {
  // Called instead of going to the result's page, for a place that wants to handle it.
  onSelect?: (category: SearchEntryType, item: SearchHit) => void;
}) => {
  const router = useRouter();

  return (
    <SearchPalette
      client={searchClient}
      onSelect={(category, item) => {
        if (onSelect) onSelect(category, item);
        // Results are paths in this app; anything else is not followed.
        else if (item.url.startsWith("/")) router.push(item.url);
      }}
    />
  );
};
