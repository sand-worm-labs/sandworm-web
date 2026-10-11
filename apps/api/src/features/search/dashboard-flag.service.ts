import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { getDashboard } from '@sandworm/editor';
import { DataSource } from 'typeorm';
import * as Y from 'yjs';
import { SearchIndexService } from './search-index.service';
import { PUBLIC_NOTEBOOK } from './sources/predicates';

const BATCH_SIZE = 50;
// After startup, so it does not compete with the app coming up.
const START_DELAY_MS = 15_000;

// A published notebook's `has_dashboard` flag is set when it is published (see
// YjsDocumentService.publishDocument). Notebooks published before that was kept up to date
// have it false whatever they hold, so this reads their published copies once at startup and
// sets it where there is a dashboard. It looks only at public notebooks not yet flagged, in
// small batches, and does nothing once they are all checked. After every deployment has run
// it once it can be deleted.
@Injectable()
export class DashboardFlagService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DashboardFlagService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly index: SearchIndexService,
  ) {}

  onApplicationBootstrap(): void {
    setTimeout(() => {
      this.sync().catch((error) =>
        this.logger.error(
          `Dashboard flag sync failed: ${(error as Error).message}`,
        ),
      );
    }, START_DELAY_MS).unref();
  }

  async sync(): Promise<number> {
    let flagged = 0;
    let checked = 0;
    let after = '00000000-0000-0000-0000-000000000000';

    for (;;) {
      const rows: { id: string; state: Buffer }[] = await this.dataSource.query(
        `SELECT a.id, a.state
         FROM yjs_app_document a
         JOIN document d ON d.id = a.document_id
         WHERE ${PUBLIC_NOTEBOOK} AND NOT a.has_dashboard AND a.id > $1
         ORDER BY a.id
         LIMIT ${BATCH_SIZE}`,
        [after],
      );
      if (rows.length === 0) break;

      const withDashboard = rows
        .filter((row) => {
          const doc = new Y.Doc();
          try {
            Y.applyUpdate(doc, new Uint8Array(row.state));
            return getDashboard(doc).size > 0;
          } catch {
            // A copy that cannot be read has no dashboard to show.
            return false;
          } finally {
            doc.destroy();
          }
        })
        .map((row) => row.id);

      if (withDashboard.length > 0) {
        await this.dataSource.query(
          `UPDATE yjs_app_document SET has_dashboard = true WHERE id = ANY($1::uuid[])`,
          [withDashboard],
        );
        flagged += withDashboard.length;
      }
      checked += rows.length;
      after = rows[rows.length - 1].id;
    }

    if (checked > 0)
      this.logger.log(
        `Checked ${checked} published notebooks for a dashboard: ${flagged} have one`,
      );
    if (flagged > 0) this.index.requestRebuild();
    return flagged;
  }
}
