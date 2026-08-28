import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatEntity } from '@sandworm/postgresql-typeorm';
import { BlockType, ExecutionQueue, getBlocks, getPythonAttributes, getSQLAttributes, updateYText } from '@sandworm/editor';
import type { PowerToolboxInputs, PythonBlock, SQLBlock } from '@sandworm/editor';
import type { Output, RunQueryResult } from '@sandworm/types';
import * as Y from 'yjs';
import { BlockActionEvent, BlockActionEventNames } from '@/core/events/block-action.events';
import { SqlGeneratorService } from '@/infrastructure/ai/services/sql-generator.service';
import { PythonGeneratorService } from '@/infrastructure/ai/services/python-generator.service';
import { GeneratorContext } from '@/infrastructure/ai/types/generator.types';
import { RedisService } from '@/infrastructure/redis/redis.service';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { addBlocks, BlockSpec, upsertDashboardHeaderBlock } from '../../collaboration/yjs/shared-doc/ai-blocks';

// After a failure, how many total run attempts an AI-generated SQL/Python
// block gets (1 original run + up to this many AI-assisted fix-and-rerun
// cycles) before we stop and leave it failed for a human to look at.
const MAX_SQL_RUN_ATTEMPTS = 3;
const MAX_PYTHON_RUN_ATTEMPTS = 3;

// Same key ChatService.abort() sets and the sidecar's is_job_cancelled()
// checks (src/util/cache.py) — the one thing all three have to agree on
// across the language boundary.
function cancelJobKey(chatId: string): string {
  return `cancel_job:${chatId}`;
}

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
    private readonly pythonGeneratorService: PythonGeneratorService,
    private readonly redisService: RedisService,
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
    // action is "ran" for sql/python, "edited" for dashboard_header (always
    // upserts the notebook's single header), "created" for everything else
    // — see BlockActionService.generate_blocks on the Python side. All three
    // land here; "generating"/"deleted" don't apply to this handler.
    if (!['created', 'edited', 'ran'].includes(event.action) || !event.content) return;

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
      upsertDashboardHeaderBlock(sharedDoc.ydoc, event.content);
      this.logger.log(`[block-action] updated document title → doc ${chat.documentId}`);
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

    // SQL/Python reuse the id the sidecar generated for this block (not a
    // fresh one) — the interactive plan/reaction loop below needs Node's
    // real Yjs block id to match exactly what the sidecar is waiting on.
    const explicitId = event.blockId || undefined;

    const [blockId] = addBlocks(sharedDoc.ydoc, [
      blockType === BlockType.SQL
        ? {
            type: blockType,
            source: event.content,
            title: event.blockTitle,
            dataSourceId: event.dataSourceId ?? null,
            dataframeName: event.dataframeName ?? undefined,
            id: explicitId,
          }
        : { type: blockType, source: event.content, title: event.blockTitle, id: explicitId } as BlockSpec,
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

      const ctx: GeneratorContext = {
        user_id: chat.userId,
        workspace_id: chat.workspaceId,
        document_id: chat.documentId,
        chat_id: event.chatId,
      };

      if (blockType === BlockType.SQL) {
        void this.runSqlWithAutoFix(sharedDoc.ydoc, blockId, chat.userId, ctx);
      } else {
        void this.runPythonWithAutoFix(sharedDoc.ydoc, blockId, chat.userId, ctx);
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
    // Track `lastQueryTime`, not `result` — the executor's onProgress sets
    // `result` as soon as the query itself finishes, which is BEFORE the
    // dataframe-load step that assigns this block's dataframeName variable
    // in the shared Python session (see buildLoadDataframeCode). Waiting on
    // `result` let the dependent block start querying that variable before
    // it existed ("Table with name aiq_... does not exist!"). `lastQueryTime`
    // is only stamped after the query AND the dataframe load both finish
    // (sql-block-executor.service.ts), same as waitForPythonResult below.
    let previousQueryTime: string | null = null;

    for (let attempt = 1; attempt <= MAX_SQL_RUN_ATTEMPTS; attempt++) {
      const block = blocks.get(blockId) as Y.XmlElement<SQLBlock> | undefined;
      if (!block) return;

      if (await this.isJobCancelled(ctx.chat_id)) {
        this.logger.log(`[block-action] SQL auto-fix loop for ${blockId} stopped — job cancelled`);
        return;
      }

      const result = await this.waitForSQLResult(block, previousQueryTime);
      previousQueryTime = (block.getAttribute('lastQueryTime') as string | null | undefined) ?? previousQueryTime;
      if (!result) return;
      if (result.type !== 'syntax-error') {
        if (result.type === 'success') {
          const summary = `${(result.count ?? 0).toLocaleString()} rows × ${(result.columns ?? []).length} cols`;
          await this.publishBlockResult(blockId, 'success', summary);
        } else {
          await this.publishBlockResult(blockId, 'error', result.type);
        }
        return;
      }

      if (attempt === MAX_SQL_RUN_ATTEMPTS) {
        this.logger.warn(`[block-action] SQL block ${blockId} still failing after ${MAX_SQL_RUN_ATTEMPTS} attempts, giving up`);
        await this.publishBlockResult(blockId, 'error', result.message);
        return;
      }

      if (await this.isJobCancelled(ctx.chat_id)) {
        this.logger.log(`[block-action] SQL auto-fix loop for ${blockId} stopped before generating a fix — job cancelled`);
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
        await this.publishBlockResult(blockId, 'error', `auto-fix generation failed: ${result.message}`);
        return;
      }
      if (!fixed?.trim()) {
        await this.publishBlockResult(blockId, 'error', `auto-fix returned no code: ${result.message}`);
        return;
      }

      updateYText(source, fixed);
      ExecutionQueue.fromYjs(ydoc).enqueueBlock(blockId, userId, null, {
        _tag: 'sql',
        isSuggestion: false,
        selectedCode: null,
      });
    }
  }

  // Resolves once the block's `lastQueryTime` moves past previousQueryTime —
  // stamped only after the query AND its dataframe load both finish (see the
  // comment on runSqlWithAutoFix) — returning the `result` at that point.
  // Times out to avoid hanging forever if execution stalls for some other reason.
  private waitForSQLResult(
    block: Y.XmlElement<SQLBlock>,
    previousQueryTime: string | null,
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
        const lastQueryTime = block.getAttribute('lastQueryTime') as string | null | undefined;
        if (lastQueryTime && lastQueryTime !== previousQueryTime) {
          finish((block.getAttribute('result') as RunQueryResult | null | undefined) ?? null);
        }
      };

      block.observe(check);
      check();
    });
  }

  // Same loop as runSqlWithAutoFix, for Python. A Python block's `result` is
  // an Output[] that gets set to [] the instant the run starts (not left
  // null), so unlike SQL we can't tell "still the old result" from "run just
  // started" by watching `result` alone — watch `lastQueryTime` instead,
  // which the executor only stamps once a run actually finishes.
  private async runPythonWithAutoFix(
    ydoc: Y.Doc,
    blockId: string,
    userId: string,
    ctx: GeneratorContext,
  ): Promise<void> {
    const blocks = getBlocks(ydoc);
    let previousQueryTime: string | null = null;

    for (let attempt = 1; attempt <= MAX_PYTHON_RUN_ATTEMPTS; attempt++) {
      const block = blocks.get(blockId) as Y.XmlElement<PythonBlock> | undefined;
      if (!block) return;

      if (await this.isJobCancelled(ctx.chat_id)) {
        this.logger.log(`[block-action] Python auto-fix loop for ${blockId} stopped — job cancelled`);
        return;
      }

      const result = await this.waitForPythonResult(block, previousQueryTime);
      previousQueryTime = (block.getAttribute('lastQueryTime') as string | null | undefined) ?? previousQueryTime;
      if (!result) return;

      const errorOutput = result.find((o): o is Extract<Output, { type: 'error' }> => o.type === 'error');
      if (!errorOutput) {
        const summary = this.summarizePythonOutputs(result);
        await this.publishBlockResult(blockId, 'success', summary);
        return;
      }

      if (attempt === MAX_PYTHON_RUN_ATTEMPTS) {
        this.logger.warn(`[block-action] Python block ${blockId} still failing after ${MAX_PYTHON_RUN_ATTEMPTS} attempts, giving up`);
        await this.publishBlockResult(blockId, 'error', `${errorOutput.ename}: ${errorOutput.evalue}`);
        return;
      }

      if (await this.isJobCancelled(ctx.chat_id)) {
        this.logger.log(`[block-action] Python auto-fix loop for ${blockId} stopped before generating a fix — job cancelled`);
        return;
      }

      this.logger.log(`[block-action] Python block ${blockId} failed on attempt ${attempt}/${MAX_PYTHON_RUN_ATTEMPTS}, asking AI to fix`);

      const { source } = getPythonAttributes(block);
      const errorMessage = `Code:\n${source.toJSON()}\n\nError: ${errorOutput.ename}: ${errorOutput.evalue}`;

      let fixed: string;
      try {
        ({ code: fixed } = await this.pythonGeneratorService.fix(ctx, errorMessage));
      } catch (err) {
        this.logger.error({ blockId, err }, '[block-action] Python auto-fix generation failed, giving up');
        await this.publishBlockResult(blockId, 'error', `auto-fix generation failed: ${errorOutput.ename}: ${errorOutput.evalue}`);
        return;
      }
      if (!fixed?.trim()) {
        await this.publishBlockResult(blockId, 'error', `auto-fix returned no code: ${errorOutput.ename}: ${errorOutput.evalue}`);
        return;
      }

      updateYText(source, fixed);
      ExecutionQueue.fromYjs(ydoc).enqueueBlock(blockId, userId, null, {
        _tag: 'python',
        isSuggestion: false,
      });
    }
  }

  // Resolves once the block's `lastQueryTime` moves past previousQueryTime
  // (a run — success or error, not aborted — actually finished), returning
  // the result array at that point. Times out to avoid hanging forever if
  // execution stalls for some other reason.
  private waitForPythonResult(
    block: Y.XmlElement<PythonBlock>,
    previousQueryTime: string | null,
  ): Promise<Output[] | null> {
    return new Promise(resolve => {
      let settled = false;
      const timeout = setTimeout(() => finish(null), 5 * 60 * 1000);

      const finish = (result: Output[] | null) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        block.unobserve(check);
        resolve(result);
      };

      const check = () => {
        const lastQueryTime = block.getAttribute('lastQueryTime') as string | null | undefined;
        if (lastQueryTime && lastQueryTime !== previousQueryTime) {
          finish((block.getAttribute('result') as Output[] | undefined) ?? []);
        }
      };

      block.observe(check);
      check();
    });
  }

  // The handoff that lets the sidecar's planner "see" a dependent block's
  // real execution outcome before generating whatever depends on it (see
  // BlockActionService.generate_blocks / wait_for_block_result on the
  // Python side, which BLPOPs this exact key). Best-effort: if this fails,
  // the sidecar's own wait just times out and it falls back to generating
  // blind, same as before this feature existed.
  private async publishBlockResult(blockId: string, outcome: 'success' | 'error', summary: string): Promise<void> {
    try {
      await this.redisService.rpush(`block:result:${blockId}`, JSON.stringify({ outcome, summary }));
    } catch (err) {
      this.logger.warn({ blockId, err }, '[block-action] failed to publish block result for sidecar handoff');
    }
  }

  // Set by ChatService.abort() — checked between attempts so a user hitting
  // Stop actually halts the auto-fix loop, not just whichever single query
  // was running at that instant. Best-effort: a Redis error here shouldn't
  // block the block from running, so treat it as "not cancelled".
  private async isJobCancelled(chatId: string): Promise<boolean> {
    try {
      return (await this.redisService.get(cancelJobKey(chatId))) !== null;
    } catch (err) {
      this.logger.warn({ chatId, err }, '[block-action] failed to check job-cancelled flag');
      return false;
    }
  }

  private summarizePythonOutputs(outputs: Output[]): string {
    const html = outputs.find((o): o is Extract<Output, { type: 'html' }> => o.type === 'html');
    if (html) {
      const match = /(\d[\d,]+)\s+rows\s+×\s+(\d+)\s+col/.exec(html.html);
      if (match) return `DataFrame ${match[1]} rows × ${match[2]} cols`;
      return 'produced a table output';
    }
    if (outputs.some(o => o.type === 'image')) return 'produced an image/chart output';
    if (outputs.some(o => o.type === 'plotly')) return 'produced a plot';

    const stdout = outputs.find(
      (o): o is Extract<Output, { type: 'stdio' }> => o.type === 'stdio' && o.name === 'stdout',
    );
    if (stdout?.text?.trim()) return stdout.text.trim().slice(0, 200);

    return 'ran successfully with no output';
  }
}
