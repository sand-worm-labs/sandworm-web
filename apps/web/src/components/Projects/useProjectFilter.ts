import { useMemo } from "react";
import type { List } from "immutable";

import type { ApiDocument } from "@/types";

export type FilterOption =
  | "All"
  | "Published"
  | "Favorites"
  | "Recent"
  | "Created by me";

export type SortOption =
  | "Last Modified"
  | "Name (A-Z)"
  | "Name (Z-A)"
  | "Date Created (Newest)"
  | "Date Created (Oldest)";

export type ProjectFilterResult = {
  docs: ApiDocument[];
  allCount: number;
};

type Params = {
  documents: List<ApiDocument>;
  favorites: Set<string>;
  currentUserId: string | undefined;
  activeFilter: FilterOption;
  activeSort: SortOption;
  searchValue: string;
};

const RECENT_CUTOFF_MS = 7 * 24 * 60 * 60 * 1000;

// =====================================
// ⬢ useProjectFilter
// =====================================
export function useProjectFilter({
  documents,
  favorites,
  currentUserId,
  activeFilter,
  activeSort,
  searchValue,
}: Params): ProjectFilterResult {
  // Non-deleted, top-level, versioned docs
  const baseDocs = useMemo(
    () =>
      documents
        .filter(
          doc =>
            doc.deletedAt === null && doc.version >= 1 && doc.parentId === null
        )
        .toArray(),
    [documents]
  );

  const filteredDocs = useMemo(() => {
    switch (activeFilter) {
      case "Published":
        return baseDocs.filter(doc => doc.publishedAt !== null);
      case "Favorites":
        return baseDocs.filter(doc => favorites.has(doc.id));
      case "Recent": {
        const cutoff = Date.now() - RECENT_CUTOFF_MS;
        return baseDocs.filter(
          doc => new Date(doc.updatedAt).getTime() >= cutoff
        );
      }
      case "Created by me":
        return currentUserId
          ? baseDocs.filter(doc => doc.authorId === currentUserId)
          : [];
      default:
        return baseDocs;
    }
  }, [baseDocs, activeFilter, favorites, currentUserId]);

  // Sort
  const sortedDocs = useMemo(() => {
    const arr = [...filteredDocs];
    switch (activeSort) {
      case "Name (A-Z)":
        return arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "Name (Z-A)":
        return arr.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      case "Date Created (Newest)":
        return arr.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "Date Created (Oldest)":
        return arr.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "Last Modified":
      default:
        return arr.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }
  }, [filteredDocs, activeSort]);

  // Search
  const resultDocs = useMemo(() => {
    if (!searchValue.trim()) return sortedDocs;
    const q = searchValue.toLowerCase();
    return sortedDocs.filter(
      doc =>
        (doc.title || "").toLowerCase().includes(q) ||
        (doc.createdBy || "").toLowerCase().includes(q)
    );
  }, [sortedDocs, searchValue]);

  return { docs: resultDocs, allCount: baseDocs.length };
}
