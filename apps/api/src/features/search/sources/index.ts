import { bountiesSource } from './bounties.source';
import { categoriesSource } from './categories.source';
import { chainsSource } from './chains.source';
import { creatorsSource } from './creators.source';
import { dashboardsSource } from './dashboards.source';
import { notebooksSource } from './notebooks.source';
import { protocolsSource } from './protocols.source';
import type { SearchSource } from './search-source';

// Everything the search can find. To make a new kind searchable, add its source here.
export const SEARCH_SOURCES: SearchSource[] = [
  protocolsSource,
  chainsSource,
  categoriesSource,
  notebooksSource,
  dashboardsSource,
  creatorsSource,
  bountiesSource,
];

export type { SearchSource, SourceContext } from './search-source';
