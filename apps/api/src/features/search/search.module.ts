import { Module } from '@nestjs/common';
import { DashboardFlagService } from './dashboard-flag.service';
import { SearchCacheService } from './search-cache.service';
import { SearchIndexService } from './search-index.service';
import { SearchController } from './search.controller';
import { SearchRepository } from './search.repository';
import { SearchService } from './search.service';

// Search across the app. Features tell it their data changed by emitting
// SEARCH_INDEX_STALE_EVENT (see search.events.ts); they do not import this module.
@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    SearchRepository,
    SearchIndexService,
    SearchCacheService,
    DashboardFlagService,
  ],
  exports: [SearchService],
})
export class SearchModule {}
