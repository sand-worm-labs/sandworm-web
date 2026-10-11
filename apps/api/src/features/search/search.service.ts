import { Injectable } from '@nestjs/common';
import { SearchCacheService } from './search-cache.service';
import { parseQuery } from './search-text';
import {
  BROWSE_TTL_MS,
  DEFAULT_GROUP_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  RESULT_TTL_MS,
} from './search.constants';
import { SearchRepository, type SearchRow } from './search.repository';
import type { SearchGroup, SearchParams, SearchResponse } from './search.types';

@Injectable()
export class SearchService {
  constructor(
    private readonly repository: SearchRepository,
    private readonly cache: SearchCacheService,
  ) {}

  // With a type: one page of that kind. Without: the best few of every kind, for the
  // first screen of the palette. Results are public and the same for everyone, so they
  // are cached by what was asked, not by who asked.
  async search(
    params: Partial<SearchParams> & { query?: string },
  ): Promise<SearchResponse> {
    const parsed = parseQuery(params.query ?? '');
    const limit = Math.min(
      params.limit ?? (params.type ? DEFAULT_PAGE_SIZE : DEFAULT_GROUP_SIZE),
      MAX_PAGE_SIZE,
    );
    const offset = params.type ? (params.offset ?? 0) : 0;

    const key = [parsed.term, params.type ?? '', limit, offset].join('|');
    const cached = this.cache.get(key);
    if (cached) return cached;

    const rows = await this.repository.find(parsed, {
      type: params.type,
      limit,
      offset,
    });
    const response: SearchResponse = {
      query: parsed.term,
      groups: this.group(rows),
    };

    this.cache.set(key, response, parsed.term ? RESULT_TTL_MS : BROWSE_TTL_MS);
    return response;
  }

  // Rows arrive ordered by kind, so a group is a run of rows of one type.
  private group(rows: SearchRow[]): SearchGroup[] {
    const groups: SearchGroup[] = [];
    for (const row of rows) {
      let group = groups[groups.length - 1];
      if (!group || group.type !== row.type) {
        group = { type: row.type, total: Number(row.total), items: [] };
        groups.push(group);
      }
      group.items.push({
        type: row.type,
        id: row.ref_id,
        title: row.title,
        subtitle: row.subtitle,
        url: row.url,
        image: row.image,
      });
    }
    return groups;
  }
}
