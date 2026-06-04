import * as Y from 'yjs'
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
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
import type { MarkdownBlock } from '@sandworm/editor'
import { BaseAiExecutorService } from './base-ai-executor.service'
import { GeneratorContext } from "@/infrastructure/ai/types/generator.types"
import { MarkdownGeneratorService } from '@/infrastructure/ai/services/markdown-generator.service'
import { WorkspaceService } from '@/features/workspace/service/workspace.service'
import { ChatService } from '@/features/chat/chat.service'

@Injectable()
export class TextAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(TextAiExecutorService.name)

  constructor(
    yjsDocumentService: YjsDocumentService,
    persistorFactory:   PersistorFactory,
    eventEmitter:       EventEmitter2,
    private readonly markdownGeneratorService: MarkdownGeneratorService,
    private readonly workspaceService: WorkspaceService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {
    super(yjsDocumentService, persistorFactory, eventEmitter)
  }

  async editAiText(
    documentId:  string,
    workspaceId: string,
    blockId:     string,
    userId:      string,
    chatId?:     string,
  ): Promise<{ result: string; chatId: string }> {
    try {
      const sharedDoc = await this.getSharedDoc(documentId, workspaceId)
      const block = getBlocks(sharedDoc.ydoc).get(blockId) as Y.XmlElement<MarkdownBlock> | undefined
      if (!block) throw new Error(`Block ${blockId} not found in document ${documentId}`)

      const aiTasks = AITasks.fromYjs(sharedDoc.ydoc)
      aiTasks.enqueue(blockId, userId, { _tag: 'edit-text' })
      const taskItem = aiTasks.next()
      if (!taskItem) throw new Error('Failed to dequeue edit-text task')

      const workspace = await this.workspaceService.getWorkspaceById(workspaceId)
      const focusedBlocks = [{ id: blockId, title: block.getAttribute('title') ?? '', type: 'Markdown' }]

      let resolvedChatId = chatId
      if (resolvedChatId) {
        await this.chatService.sendMessage(userId, {
          chatId: resolvedChatId,
          content: `Edited Markdown block with AI`,
          model: workspace.assistantModel,
          focusedBlocks,
        })
      } else {
        const chat = await this.chatService.createChat(userId, {
          workspaceId,
          documentId,
          message: `Edited Markdown block with AI`,
          model: workspace.assistantModel,
          title: 'Markdown Edit',
          updateDocumentTitle: false,
          focusedBlocks,
        })
        resolvedChatId = chat.id
      }

      const ctx: GeneratorContext = { user_id: userId, workspace_id: workspaceId, document_id: documentId, chat_id: resolvedChatId }
      const result = await this.runEdit(taskItem, block, ctx)
      return { result, chatId: resolvedChatId }
    } catch (err) {
      this.logger.error('editText failed', err)
      throw err
    }
  }

  private async runEdit(
    taskItem: AITaskItem,
    block:    Y.XmlElement<MarkdownBlock>,
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

      const prompt = `${instructions}\n\n${content}`

      const { content: generated } = await this.markdownGeneratorService.edit(ctx, prompt)

      if (aborted) {
        taskItem.setCompleted('aborted')
        return generated
      }

      updateMarkdownAISuggestions(block, generated)
      closeMarkdownEditWithAIPrompt(block, true)
      taskItem.setCompleted('success')
      this.emitBlockAction('edited', 'Markdown', block, ctx)
      return generated
    } catch (err) {
      taskItem.setCompleted('error')
      throw err
    } finally {
      cleanup()
    }
  }

}
