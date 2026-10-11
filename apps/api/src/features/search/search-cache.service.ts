import { Injectable } from '@nestjs/common';
import { RESULT_CACHE_SIZE } from './search.constants';
import type { SearchResponse } from './search.types';
import { TtlCache } from './ttl-cache';

// Recent answers, shared by the search and the index: the index clears it when it changes.
@Injectable()
export class SearchCacheService {
  private readonly cache = new TtlCache<SearchResponse>(RESULT_CACHE_SIZE);

  get(key: string): SearchResponse | undefined {
    return this.cache.get(key);
  }

  set(key: string, value: SearchResponse, ttlMs: number): void {
    this.cache.set(key, value, ttlMs);
  }

  clear(): void {
    this.cache.clear();
  }
}
