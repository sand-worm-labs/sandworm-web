import * as Y from 'yjs'
import { Injectable, Logger } from '@nestjs/common'
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service'
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory'
import {
  getBlocks,
  AITasks,
  AITaskItem,
  getMarkdownAttributes,
  closeMarkdownEditWithAIPrompt,
  updateMarkdownAISuggestions,
} from '@sandworm/editor'
import type { MarkdownBlock, MarkdownEditIntent } from '@sandworm/editor'
import { BaseAiExecutorService } from './base-ai-executor.service'
import { GeneratorContext } from "@/infrastructure/ai/types/generator.types"
import { MarkdownGeneratorService } from '@/infrastructure/ai/services/markdown-generator.service'


const INTENT_INSTRUCTIONS: Record<MarkdownEditIntent, string> = {
  fix:     'Fix grammar, spelling, and clarity. Preserve structure and all code blocks exactly.',
  shorten: 'Shorten this text. Keep all technical accuracy. Remove filler, not substance.',
  expand:  'Expand with more detail. Do not invent facts. Preserve markdown structure.',
  rewrite: 'Rewrite completely with better clarity. Preserve meaning and all code blocks.',
  custom:  '',
} as const

@Injectable()
export class TextAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(TextAiExecutorService.name)

  constructor(
    yjsDocumentService: YjsDocumentService,
    persistorFactory:   PersistorFactory,
    private readonly markdownGeneratorService: MarkdownGeneratorService,
  ) {
    super(yjsDocumentService, persistorFactory)
  }

  async editText(
    documentId:  string,
    workspaceId: string,
    blockId:     string,
    userId:      string,
  ): Promise<string> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId)
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<MarkdownBlock> | undefined
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`)

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc)
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-text' })
      const taskItem = aiTasks.next()
      if (!taskItem) throw new Error('Failed to dequeue edit-text task')

      const { intent } = getMarkdownAttributes(block)
      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId }
      return await this.runEdit(taskItem, block, intent, ctx)
    } catch (err) {
      this.logger.error('editText failed', err)
      throw err
    }
  }

  private async runEdit(
    taskItem: AITaskItem,
    block:    Y.XmlElement<MarkdownBlock>,
    intent:   MarkdownEditIntent,
    ctx:      GeneratorContext,
  ): Promise<string> {
    let cleanup: () => void = () => {}
    let aborted = false

    try {
      cleanup = taskItem.observeStatus((s) => {
        if (s._tag === 'aborting') aborted = true
      })

      const { source, editWithAIPrompt } = getMarkdownAttributes(block)
      const content      = source?.toJSON()           ?? ''
      const instructions = editWithAIPrompt?.toJSON() ?? ''
      if (!instructions) {
        taskItem.setCompleted('error')
        return ''
      }

      const prompt = `${this.buildInstructions(intent, instructions)}\n\n${content}`

      const { content: generated } = await this.markdownGeneratorService.edit(ctx, prompt)

      if (aborted) {
        taskItem.setCompleted('aborted')
        return generated
      }

      updateMarkdownAISuggestions(block, generated)
      closeMarkdownEditWithAIPrompt(block, true)
      taskItem.setCompleted('success')
      return generated
    } catch (err) {
      taskItem.setCompleted('error')
      throw err
    } finally {
      cleanup()
    }
  }

  private buildInstructions(intent: MarkdownEditIntent, custom?: string): string {
    const directive = intent === 'custom'
      ? (custom ?? '')
      : INTENT_INSTRUCTIONS[intent]

    return (
      `You are editing a markdown text block in an onchain analytics notebook. ` +
      `Return ONLY the edited markdown — no explanations, no preamble, no code fences. ` +
      `${directive}`
    )
  }
}
