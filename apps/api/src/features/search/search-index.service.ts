import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SearchCacheService } from './search-cache.service';
import { normalizeText } from './search-text';
import {
  REBUILD_DEBOUNCE_MS,
  REBUILD_INTERVAL_MS,
  SEARCH_ALIASES,
} from './search.constants';
import { SEARCH_INDEX_STALE_EVENT } from './search.events';
import { SEARCH_SOURCES, type SourceContext } from './sources';

// One number for every instance of the API, so only one rebuilds at a time.
const REBUILD_LOCK_KEY = 7_301_001;

const COLUMNS =
  'type, ref_id, title, subtitle, url, image, keywords, popularity, published_at';

// Keeps the search_entry table in step with the real tables. A rebuild reads every source,
// stages the rows in a temporary table, then in one transaction inserts what is new,
// updates what changed, and deletes what is gone. Readers never see a half-built index,
// and unchanged rows are not rewritten.
@Injectable()
export class SearchIndexService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(SearchIndexService.name);
  private readonly officialWorkspaceIds: string[];
  private debounceTimer?: NodeJS.Timeout;
  private intervalTimer?: NodeJS.Timeout;
  private running = false;
  private rebuildAgain = false;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cache: SearchCacheService,
    config: ConfigService,
  ) {
    // The same list ShowcaseService reads: the workspaces whose notebooks are the Showcase.
    this.officialWorkspaceIds = (
      config.get<string>('SHOWCASE_OFFICIAL_WORKSPACE_IDS') ?? ''
    )
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  onApplicationBootstrap(): void {
    void this.rebuild();
    this.intervalTimer = setInterval(
      () => void this.rebuild(),
      REBUILD_INTERVAL_MS,
    );
    this.intervalTimer.unref();
  }

  onModuleDestroy(): void {
    clearTimeout(this.debounceTimer);
    clearInterval(this.intervalTimer);
  }

  @OnEvent(SEARCH_INDEX_STALE_EVENT)
  requestRebuild(): void {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(
      () => void this.rebuild(),
      REBUILD_DEBOUNCE_MS,
    );
    this.debounceTimer.unref();
  }

  // Returns the number of entries afterwards, or null when another rebuild was already
  // running (here or on another instance), or this one failed.
  async rebuild(): Promise<number | null> {
    if (this.running) {
      this.rebuildAgain = true;
      return null;
    }
    this.running = true;
    const startedAt = Date.now();
    const runner = this.dataSource.createQueryRunner();
    try {
      await runner.connect();
      await runner.startTransaction();

      const [{ locked }] = await runner.query(
        `SELECT pg_try_advisory_xact_lock($1) AS locked`,
        [REBUILD_LOCK_KEY],
      );
      if (!locked) {
        await runner.rollbackTransaction();
        return null;
      }

      await runner.query(`
        CREATE TEMP TABLE search_stage (
          type text, ref_id text, title text, subtitle text, url text, image text,
          keywords text, popularity real, published_at timestamptz
        ) ON COMMIT DROP
      `);

      const context = this.context();
      for (const source of SEARCH_SOURCES) {
        const { sql, params } = source.build(context);
        // `type` is one of our own constants, never user input.
        await runner.query(
          `INSERT INTO search_stage (${COLUMNS})
           SELECT '${source.type}', s.ref_id, s.title, s.subtitle, s.url, s.image, s.keywords, s.popularity, s.published_at
           FROM (${sql}) s`,
          params,
        );
      }

      await runner.query(`
        INSERT INTO search_entry (${COLUMNS})
        SELECT DISTINCT ON (type, ref_id) ${COLUMNS}
        FROM search_stage
        ORDER BY type, ref_id, popularity DESC
        ON CONFLICT (type, ref_id) DO UPDATE SET
          title = EXCLUDED.title, subtitle = EXCLUDED.subtitle, url = EXCLUDED.url, image = EXCLUDED.image,
          keywords = EXCLUDED.keywords, popularity = EXCLUDED.popularity, published_at = EXCLUDED.published_at,
          refreshed_at = now()
        WHERE (search_entry.title, search_entry.subtitle, search_entry.url, search_entry.image,
               search_entry.keywords, search_entry.popularity, search_entry.published_at)
          IS DISTINCT FROM
              (EXCLUDED.title, EXCLUDED.subtitle, EXCLUDED.url, EXCLUDED.image,
               EXCLUDED.keywords, EXCLUDED.popularity, EXCLUDED.published_at)
      `);
      await runner.query(`
        DELETE FROM search_entry e
        WHERE NOT EXISTS (SELECT 1 FROM search_stage s WHERE s.type = e.type AND s.ref_id = e.ref_id)
      `);

      const counts: { type: string; count: string }[] = await runner.query(
        `SELECT type, count(*) FROM search_entry GROUP BY type ORDER BY type`,
      );
      await runner.commitTransaction();

      this.cache.clear();
      const total = counts.reduce((sum, row) => sum + Number(row.count), 0);
      this.logger.log(
        `Search index rebuilt in ${Date.now() - startedAt}ms: ${total} entries (${counts
          .map((row) => `${row.type} ${row.count}`)
          .join(', ')})`,
      );
      return total;
    } catch (error) {
      if (runner.isTransactionActive) await runner.rollbackTransaction();
      // The old index keeps serving; the next rebuild tries again.
      this.logger.error(
        `Search index rebuild failed: ${(error as Error).message}`,
      );
      return null;
    } finally {
      await runner.release();
      this.running = false;
      if (this.rebuildAgain) {
        this.rebuildAgain = false;
        this.requestRebuild();
      }
    }
  }

  private context(): SourceContext {
    const names = Object.keys(SEARCH_ALIASES).map(normalizeText);
    return {
      officialWorkspaceIds: this.officialWorkspaceIds,
      aliasNames: names,
      aliasWords: Object.values(SEARCH_ALIASES),
    };
  }
}
