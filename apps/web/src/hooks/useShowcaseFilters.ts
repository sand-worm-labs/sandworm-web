"use client";

import { useMemo, useState } from "react";

import { filterCards, groupCounts } from "@/lib/showcase";
import type {
  ShowcaseCategoryCard,
  ShowcaseFilters,
  ShowcaseGroupFilter,
} from "@/types";

// =====================================
// ⬢  useShowcaseFilters
// =====================================
// The Showcase index's three filters (group, chain, search) and the cards
// left after applying them. Group counts ignore the group filter, so the
// rail always shows how many each group would give.
export function useShowcaseFilters(cards: ShowcaseCategoryCard[]) {
  // State
  const [group, setGroup] = useState<ShowcaseGroupFilter>("all");
  const [chain, setChain] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Derived
  const filters: ShowcaseFilters = useMemo(
    () => ({ group, chain, search }),
    [group, chain, search]
  );
  const visible = useMemo(() => filterCards(cards, filters), [cards, filters]);
  const counts = useMemo(
    () => groupCounts(filterCards(cards, { ...filters, group: "all" })),
    [cards, filters]
  );

  return { filters, visible, counts, setGroup, setChain, setSearch };
}
