import { randomUUID } from 'node:crypto';
import type * as Y from 'yjs';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  BlockType,
  addDashboardOnlyBlock,
  getBlocks,
  getDashboard,
  planDashboardRows,
  updateYDashboardFromRecord,
  yDashboardToRecord,
  type DashboardItem,
} from '@sandworm/editor';
import type { EditHeadingDto } from './dto/edit-heading.dto';
import type { SetDashboardDto } from './dto/set-dashboard.dto';
import { cellInfo, describeDashboard, notebookCellIds, type DashboardLayout } from './dashboard/layout-summary';
import { NotebookDocService, type NotebookRef } from './notebook-doc.service';

@Injectable()
export class NotebookDashboardService {
  constructor(private readonly docs: NotebookDocService) {}

  getDashboard(ref: NotebookRef): Promise<DashboardLayout> {
    return this.docs.use(ref, 'member', ({ ydoc }) => describeDashboard(ydoc));
  }

  // Changes the text of one dashboard heading, leaving the layout as it is.
  editHeading(ref: NotebookRef, headingId: string, { content }: EditHeadingDto): Promise<DashboardLayout> {
    return this.docs.use(ref, 'editor', ({ ydoc }) => {
      const block = getBlocks(ydoc).get(headingId);
      if (!block || block.getAttribute('type') !== BlockType.DashboardHeader) {
        throw new NotFoundException(`${headingId} is not a dashboard heading. Read the dashboard with get_dashboard to see each heading's headingId.`);
      }
      // A heading's text lives in its `content` attribute, which the shared block type does not list.
      ydoc.transact(() => (block as Y.XmlElement<Record<string, string>>).setAttribute('content', content));
      return describeDashboard(ydoc);
    });
  }

  // Replaces the dashboard. A cell left out of the layout leaves the dashboard
  // but stays in the notebook; headings the layout no longer has are deleted,
  // since they exist only on the dashboard.
  setDashboard(ref: NotebookRef, { rows }: SetDashboardDto): Promise<DashboardLayout> {
    return this.docs.use(ref, 'editor', ({ ydoc }) => {
      const blocks = getBlocks(ydoc);
      const cells = notebookCellIds(ydoc);

      const plan = planDashboardRows(rows.map(({ heading, height, tiles }) => ({
        heading,
        height,
        tiles: tiles?.map(({ cellId, width }) => ({ blockId: cellId, width })),
      })), blockId => (cells.has(blockId) ? cellInfo(blocks.get(blockId)) : undefined));
      if (plan.ok === false) {
        throw new BadRequestException(`The dashboard was not changed. Fix these and call set_dashboard again:\n- ${plan.problems.join('\n- ')}`);
      }

      ydoc.transact(() => {
        const dashboard = getDashboard(ydoc);
        const previous = Object.values(yDashboardToRecord(dashboard));
        // A cell that stays keeps its dashboard item, so anyone editing the
        // dashboard sees it move rather than vanish and return.
        const itemIdByBlock = new Map(previous.map(item => [item.blockId, item.id]));

        const next: Record<string, DashboardItem> = {};
        const kept = new Set<string>();
        for (const item of plan.items) {
          const blockId =
            item.kind === 'tile'
              ? item.blockId
              : addDashboardOnlyBlock(blocks, { type: BlockType.DashboardHeader, content: item.content });
          const id = (item.kind === 'tile' && itemIdByBlock.get(blockId)) || randomUUID();
          kept.add(blockId);
          next[id] = { id, type: 'DASHBOARD_ITEM', blockId, x: item.x, y: item.y, w: item.w, h: item.h, minW: item.minW, minH: item.minH };
        }
        updateYDashboardFromRecord(dashboard, next);

        for (const { blockId } of previous) {
          if (!kept.has(blockId) && !cells.has(blockId) && blocks.get(blockId)?.getAttribute('type') === BlockType.DashboardHeader) {
            blocks.delete(blockId);
          }
        }
      });

      return describeDashboard(ydoc);
    });
  }
}
