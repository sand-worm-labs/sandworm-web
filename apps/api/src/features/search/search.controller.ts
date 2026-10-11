import { NoAudit } from '@/features/audit/audit.decorators';
import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiPublic } from '@sandworm/api/decorators/http.decorators';
import type { FastifyReply } from 'fastify';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';
import type { SearchResponse } from './search.types';

// Public search over what anyone can open: protocols, chains, Showcase categories,
// published notebooks and their dashboards, creators with a public page, and bounties.
// Nothing private is indexed, so the answer is the same for everyone and may be cached by
// a browser or a CDN. Short-lived, so a notebook published a moment ago is not hidden for long.
//
// Not audited: the audit log records every REST call, and this is public, anonymous and
// called on every keystroke. It would write a row per request and drown the log.
@NoAudit()
@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  @ApiPublic({
    summary:
      'Search protocols, chains, categories, notebooks, dashboards, creators and bounties',
  })
  async find(
    @Query() query: SearchQueryDto,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<SearchResponse> {
    // Browsing (no text) changes least, so it is kept longest.
    const sMaxAge = query.q?.trim() ? 60 : 300;
    reply.header(
      'Cache-Control',
      `public, max-age=15, s-maxage=${sMaxAge}, stale-while-revalidate=300`,
    );
    return this.search.search({
      query: query.q,
      type: query.type,
      limit: query.limit,
      offset: query.offset,
    });
  }
}
