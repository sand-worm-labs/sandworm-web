import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ChatEntity } from '@sandworm/postgresql-typeorm';
import { BlockType, ExecutionQueue } from '@sandworm/editor';
import type { PowerToolboxInputs } from '@sandworm/editor';
import { BlockActionEvent, BlockActionEventNames } from '@/core/events/block-action.events';
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service';
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory';
import { addBlocks, BlockSpec, upsertDashboardHeaderBlock } from '../../collaboration/yjs/shared-doc/ai-blocks';

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
    }
  }
}
