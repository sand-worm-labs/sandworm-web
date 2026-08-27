import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatEntity } from '@sandworm/postgresql-typeorm';
import { BlockType, ExecutionQueue, getBlocks, getSQLAttributes, updateYText } from '@sandworm/editor';
import type { PowerToolboxInputs, SQLBlock } from '@sandworm/editor';
import type { RunQueryResult } from '@sandworm/types';
import * as Y from 'yjs';
import { BlockActionEvent, BlockActionEventNames } from '@/core/events/block-action.events';
import { SqlGeneratorService } from '@/infrastructure/ai/services/sql-generator.service';
import { GeneratorContext } from '@/infrastructure/ai/types/generator.types';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { addBlocks, BlockSpec, upsertDashboardHeaderBlock } from '../../collaboration/yjs/shared-doc/ai-blocks';

// After a syntax-error, how many total run attempts an AI-generated SQL
// block gets (1 original run + up to this many AI-assisted fix-and-rerun
// cycles) before we stop and leave it failed for a human to look at.
const MAX_SQL_RUN_ATTEMPTS = 3;

const BLOCK_TYPE_MAP: Partial<Record<string, BlockType>> = {
  sql:              BlockType.SQL,
  python:           BlockType.Python,
  markdown:         BlockType.Markdown,
  rich_text:        BlockType.RichText,
  visualization:    BlockType.VisualizationV2,
  pivot_table:      BlockType.PivotTable,
  dashboard_header: BlockType.DashboardHeader,
  input:            BlockType.Input,
  dropdown_input:   BlockType.DropdownInput,
  date_input:       BlockType.DateInput,
  power_toolbox:    BlockType.PowerToolbox,
};

@Injectable()
export class AiBlockEventService implements OnModuleInit {
  private readonly logger = new Logger(AiBlockEventService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly yjsDocumentService: YjsDocumentService,
    private readonly persistorFactory: PersistorFactory,
    private readonly sqlGeneratorService: SqlGeneratorService,
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  onModuleInit(): void {
    this.eventEmitter.on(BlockActionEventNames.BLOCK_ACTION, (event: BlockActionEvent) => {
      this.logger.log(`[block-action] action=${event.action} type=${event.blockType} title="${event.blockTitle}"`);
      console.trace('[block-action] call stack');
      void this.handleBlockReady(event);
    });
  }

  private async handleBlockReady(event: BlockActionEvent): Promise<void> {
    if (event.action !== 'created' || !event.content) return;

    const chat = await this.chatRepository.findOne({
      where: { id: event.chatId },
      select: ['documentId', 'workspaceId', 'userId'],
    });
    if (!chat) {
      this.logger.warn(`[block-action] chat not found: ${event.chatId}`);
      return;
    }

    const blockType = BLOCK_TYPE_MAP[event.blockType.toLowerCase()];
    if (!blockType) {
      this.logger.warn(`[block-action] unknown block type: ${event.blockType}`);
      return;
    }

    const docId     = this.yjsDocumentService.getDocId(chat.documentId, null);
    const persistor = this.persistorFactory.createDocumentPersistor(chat.documentId);
    const sharedDoc = await this.yjsDocumentService.getYDoc(docId, chat.documentId, chat.workspaceId, persistor);

    if (blockType === BlockType.DashboardHeader) {
      upsertDashboardHeaderBlock(sharedDoc.ydoc, event.content, event.blockTitle);
      this.logger.log(`[block-action] updated dashboard header → doc ${chat.documentId}`);
      return;
    }

    if (blockType === BlockType.PowerToolbox) {
      let toolId = '';
      let inputs: PowerToolboxInputs = {};
      try {
        const parsed = JSON.parse(event.content);
        toolId = parsed.tool_id ?? '';
        inputs = parsed.inputs ?? {};
      } catch {
        this.logger.warn(`[block-action] failed to parse power_toolbox content for chat ${event.chatId}`);
      }
      addBlocks(sharedDoc.ydoc, [{ type: BlockType.PowerToolbox, toolId, inputs, title: event.blockTitle }]);
      this.logger.log(`[block-action] inserted power_toolbox block (tool=${toolId || '(none)'}) → doc ${chat.documentId}`);
      return;
    }

    const [blockId] = addBlocks(sharedDoc.ydoc, [
      blockType === BlockType.SQL
        ? {
            type: blockType,
            source: event.content,
            title: event.blockTitle,
            dataSourceId: event.dataSourceId ?? null,
            dataframeName: event.dataframeName ?? undefined,
          }
        : { type: blockType, source: event.content, title: event.blockTitle } as BlockSpec,
    ]);

    this.logger.log(`[block-action] inserted ${event.blockType} block "${event.blockTitle}" → doc ${chat.documentId}`);

    // SQL/Python are the block types the AI can generate that are meant to
    // be "run" — insert them already executed instead of leaving them dead
    // until a human happens to click Run.
    if (blockId && (blockType === BlockType.SQL || blockType === BlockType.Python)) {
      const metadata = blockType === BlockType.SQL
        ? { _tag: 'sql' as const, isSuggestion: false, selectedCode: null }
        : { _tag: 'python' as const, isSuggestion: false };

      ExecutionQueue.fromYjs(sharedDoc.ydoc).enqueueBlock(blockId, chat.userId, null, metadata);
      this.logger.log(`[block-action] enqueued ${event.blockType} block ${blockId} for execution`);

      if (blockType === BlockType.SQL) {
        void this.runSqlWithAutoFix(sharedDoc.ydoc, blockId, chat.userId, {
          user_id: chat.userId,
          workspace_id: chat.workspaceId,
          document_id: chat.documentId,
          chat_id: event.chatId,
        });
      }
    }
  }

  // Waits for the run just enqueued above to finish; on a syntax error, asks
  // the AI to fix the query, applies the fix directly (no human approval —
  // this is the autonomous generation path, unlike the user-triggered "Fix
  // with AI" button), and re-enqueues. Stops as soon as a run isn't a
  // syntax-error (success, aborted, or some other terminal state), or after
  // MAX_SQL_RUN_ATTEMPTS total runs, whichever comes first.
  private async runSqlWithAutoFix(
    ydoc: Y.Doc,
    blockId: string,
    userId: string,
    ctx: GeneratorContext,
  ): Promise<void> {
    const blocks = getBlocks(ydoc);
    // A freshly-created block's `result` starts out null (see makeSQLBlock).
    // Tracking the previous value lets waitForSQLResult tell "the retry
    // finished" apart from "the block still has last attempt's result
    // because the executor hasn't picked up the new run yet" — enqueueBlock
    // only pushes onto the queue; the executor clears/sets `result` later,
    // asynchronously.
    let previousResult: RunQueryResult | null = null;

    for (let attempt = 1; attempt <= MAX_SQL_RUN_ATTEMPTS; attempt++) {
      const block = blocks.get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) return;

      const result = await this.waitForSQLResult(block, previousResult);
      if (!result || result.type !== 'syntax-error') return;

      if (attempt === MAX_SQL_RUN_ATTEMPTS) {
        this.logger.warn(`[block-action] SQL block ${blockId} still failing after ${MAX_SQL_RUN_ATTEMPTS} attempts, giving up`);
        return;
      }

      this.logger.log(`[block-action] SQL block ${blockId} failed on attempt ${attempt}/${MAX_SQL_RUN_ATTEMPTS}, asking AI to fix`);

      const { source, dataSourceId } = getSQLAttributes(block, blocks);
      const dialect = dataSourceId ? 'sql' : 'duckdb';
      const errorMessage = `Dialect: ${dialect}\n\nQuery:\n${source.toJSON()}\n\nError: ${result.message}`;

      let fixed: string;
      try {
        ({ code: fixed } = await this.sqlGeneratorService.fix(ctx, errorMessage));
      } catch (err) {
        this.logger.error({ blockId, err }, '[block-action] SQL auto-fix generation failed, giving up');
        return;
      }
      if (!fixed?.trim()) return;

      updateYText(source, fixed);
      previousResult = result;
      ExecutionQueue.fromYjs(ydoc).enqueueBlock(blockId, userId, null, {
        _tag: 'sql',
        isSuggestion: false,
        selectedCode: null,
      });
    }
  }

  // Resolves once the block's `result` attribute holds a new, non-null value
  // that differs from previousResult (or after a timeout, to avoid hanging
  // forever if execution stalls for some other reason).
  private waitForSQLResult(
    block: Y.XmlElement<SQLBlock>,
    previousResult: RunQueryResult | null,
  ): Promise<RunQueryResult | null> {
    return new Promise(resolve => {
      let settled = false;
      const timeout = setTimeout(() => finish(null), 5 * 60 * 1000);

      const finish = (result: RunQueryResult | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        block.unobserve(check);
        resolve(result);
      };

      const check = () => {
        const result = block.getAttribute('result') as RunQueryResult | null | undefined;
        if (result !== null && result !== undefined && result !== previousResult) finish(result);
      };

      block.observe(check);
      check();
    });
  }
}
