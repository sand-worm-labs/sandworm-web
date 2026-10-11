// Emitted (with EventEmitter2) by any feature whose data the search shows: a notebook
// published, unpublished or retitled, a Showcase notebook changed, a bounty edited. The
// index rebuilds shortly after. Emitting it too often is harmless (rebuilds are debounced);
// forgetting to is covered by the periodic rebuild.
export const SEARCH_INDEX_STALE_EVENT = 'search.index.stale';
