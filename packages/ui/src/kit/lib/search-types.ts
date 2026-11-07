// The shape of GET /api/search. Mirrors apps/api/src/features/search/search.types.ts:
// keep the two in step (a shared package would hold them if a third place needed them).
export const SEARCH_ENTRY_TYPES = [
  "protocol",
  "chain",
  "category",
  "notebook",
  "dashboard",
  "creator",
  "bounty",
] as const;

export type SearchEntryType = (typeof SEARCH_ENTRY_TYPES)[number];

export type SearchHit = {
  type: SearchEntryType;
  id: string;
  title: string;
  subtitle: string | null;
  // A path in this app, such as /showcase/lending/aave.
  url: string;
  image: string | null;
};

export type SearchGroup = {
  type: SearchEntryType;
  // Everything that matched, not just the hits returned.
  total: number;
  items: SearchHit[];
};

export type SearchResponse = {
  query: string;
  groups: SearchGroup[];
};

export type SearchRequest = {
  q: string;
  type?: SearchEntryType;
  limit?: number;
  offset?: number;
};
