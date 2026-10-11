import type { SearchEntryType } from '../search.types';

// What a source can see when it builds its query.
export type SourceContext = {
  // The workspaces whose notebooks make up the Showcase (see ShowcaseService).
  officialWorkspaceIds: string[];
  // Other names for things, from SEARCH_ALIASES, as parallel arrays for unnest().
  aliasNames: string[];
  aliasWords: string[];
};

// One kind of result. A source is a SELECT over the real tables that returns exactly
// these columns, one row per thing, ref_id unique within the source:
//
//   ref_id text, title text, subtitle text, url text, image text,
//   keywords text, popularity real, published_at timestamptz
//
// The index service stages every source's rows and merges them into search_entry. The
// SQL must apply the same "is this public" rules as the page it links to: a thing that
// a visitor cannot open must never be returned.
export interface SearchSource {
  readonly type: SearchEntryType;
  build(context: SourceContext): { sql: string; params: unknown[] };
}
