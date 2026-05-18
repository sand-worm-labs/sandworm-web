import * as Y from 'yjs'
import { Injectable, Logger } from '@nestjs/common'
import { YjsDocumentService } from '../../collaboration/yjs/yjs-document.service'
import { PersistorFactory } from '../../collaboration/yjs/persistors/persistor.factory'
import { getBlocks, AITasks, AITaskItem, getMarkdownAttributes, getAttributeOr } from '@sandworm/editor'
import type { MarkdownBlock, MarkdownEditIntent } from '@sandworm/editor'
import { BaseAiExecutorService } from './base-ai-executor.service'


const INTENT_INSTRUCTIONS = {
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
    persistorFactory: PersistorFactory,
  ) {
    super(yjsDocumentService, persistorFactory)
  }

  async editText(
    documentId: string,
    workspaceId: string,
    blockId: string,
    userId: string | null,
    modelId: string
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
      return await this.runEdit(taskItem, block, modelId, intent)
    } catch (err) {
      this.logger.error('editText failed', err)
      throw err
    }
  }

  private async runEdit(
    taskItem: AITaskItem,
    block: Y.XmlElement<MarkdownBlock>,
    modelId: string,
    intent: MarkdownEditIntent,
  ): Promise<string> {
    let cleanup: () => void = () => {}
    let aborted = false
    let result = ''

    try {
      cleanup = taskItem.observeStatus((s) => {
        if (s._tag === 'aborting') aborted = true
      })

      const { source }         = getMarkdownAttributes(block)
      const editWithAIPrompt   = getAttributeOr(block, 'editWithAIPrompt', new Y.Text())
      const isPromptOpen       = getAttributeOr(block, 'isEditWithAIPromptOpen', false)
      const content            = source.toJSON()
      const customInstructions = editWithAIPrompt.toJSON()

      if (!content || !isPromptOpen) {
        taskItem.setCompleted('error')
        return result
      }

      await this.textEditStreamed({
        content,
        instructions: this.buildInstructions(intent, customInstructions),
        modelId,
        onContent: (chunk) => {
          if (aborted) return
          result = chunk
          source.delete(0, source.length)
          source.insert(0, chunk)
        },
      })

      if (aborted) {
        taskItem.setCompleted('aborted')
        return result
      }

      block.setAttribute('isEditWithAIPromptOpen', false)
      block.setAttribute('editWithAIPrompt', new Y.Text())
      taskItem.setCompleted('success')
      return result
    } catch (err) {
      taskItem.setCompleted('error')
      throw err
    } finally {
      cleanup()
    }
  }

  private async textEditStreamed(opts: {
    content: string
    instructions: string
    modelId: string
    onContent: (chunk: string) => void
  }): Promise<void> {
    await new Promise((r) => setTimeout(r, 800))
    opts.onContent(opts.content)
  }

  private buildInstructions(intent: MarkdownEditIntent, custom?: string): string {
    const directive = intent === 'custom' ? (custom ?? '') : INTENT_INSTRUCTIONS[intent]
    return (
      `You are editing a markdown text block in an onchain analytics notebook. ` +
      `Return ONLY the edited markdown — no explanations, no preamble, no code fences. ` +
      `${directive}`
    )
  }
}