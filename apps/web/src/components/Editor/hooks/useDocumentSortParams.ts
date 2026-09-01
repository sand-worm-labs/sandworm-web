"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import type { SortOption } from "@/components/Explore/SortControl";

// ─── CONSTANTS ───
const VALID_SORTS: readonly SortOption[] = [
  "trending",
  "most-popular",
  "your-forks",
  "your-favourites",
];

const DEFAULT_SORT: SortOption = "trending";
const PARAM_KEY = "sort";

// ─── HOOK ───
export function useDocumentSortParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raw = searchParams.get(PARAM_KEY);
  const sortBy: SortOption =
    raw && (VALID_SORTS as readonly string[]).includes(raw)
      ? (raw as SortOption)
      : DEFAULT_SORT;

  const setSortBy = useCallback(
    (next: SortOption) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === DEFAULT_SORT) params.delete(PARAM_KEY);
      else params.set(PARAM_KEY, next);

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return { sortBy, setSortBy };
}
