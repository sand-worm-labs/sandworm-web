// What the search can return. Adding a kind of result means adding it here, a source in
// ./sources, and a label in the web palette: nothing else.
export const SEARCH_ENTRY_TYPES = [
  'protocol',
  'chain',
  'category',
  'notebook',
  'dashboard',
  'creator',
  'bounty',
] as const;

export type SearchEntryType = (typeof SEARCH_ENTRY_TYPES)[number];

export type SearchHit = {
  type: SearchEntryType;
  id: string;
  title: string;
  subtitle: string | null;
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
  // The query as the search understood it.
  query: string;
  groups: SearchGroup[];
};

export type SearchParams = {
  query: string;
  type?: SearchEntryType;
  limit: number;
  offset: number;
};
