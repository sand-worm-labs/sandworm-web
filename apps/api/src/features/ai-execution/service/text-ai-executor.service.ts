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

const INTENT_INSTRUCTIONS: Record<MarkdownEditIntent, string> = {
  fix:     'Fix grammar, spelling, and clarity. Preserve structure and all code blocks exactly.',
  shorten: 'Shorten this text. Keep all technical accuracy. Remove filler, not substance.',
  expand:  'Expand with more detail. Do not invent facts. Preserve markdown structure.',
  rewrite: 'Rewrite completely with better clarity. Preserve meaning and all code blocks.',
  custom:  '',
} as const

const RANDOM_MARKDOWN_SAMPLES: string[] = [
  `## Wallet Concentration Analysis\n\nTop 10 holders control **62.4%** of circulating supply.\n\n- Whale wallets: 3 addresses > 5% each\n- Exchange cold wallets excluded from concentration calc\n- 30-day trend: +2.1% consolidation\n\n> Watch for large transfer events near resistance levels.`,

  `## Protocol Revenue — Last 7 Days\n\n| Source       | Revenue (USD) | Δ vs Prior Week |\n|--------------|---------------|------------------|\n| Swap Fees    | $1,204,330    | +8.4%            |\n| Flash Loans  | $88,210       | -3.1%            |\n| Liquidations | $340,900      | +41.2%           |\n\n**Total:** $1,633,440 — driven largely by liquidation volume spike on day 4.`,

  `## MEV Extraction Summary\n\nSandwich attacks accounted for **~18%** of gas spent on this contract in the past epoch.\n\n\`\`\`\nAttacker bundles identified : 1,204\nAvg profit per bundle       : $42.30\nLargest single extraction   : $8,910\n\`\`\`\n\nMitigation: consider integrating a private mempool or commit-reveal scheme.`,

  `## Liquidity Depth Snapshot\n\nCurrent pool depth within ±2% of spot:\n\n- **Bid side:** $4.2M\n- **Ask side:** $3.8M\n- **Imbalance ratio:** 1.10 (mild buy pressure)\n\nSlippage estimate for $500K market buy: **~1.3%** based on current curve.`,
]

interface TextEditStreamedOptions {
  content:      string
  instructions: string
  modelId:      string
  onContent:    (accumulated: string) => void
}

@Injectable()
export class TextAiExecutorService extends BaseAiExecutorService {
  protected readonly logger = new Logger(TextAiExecutorService.name)

  constructor(
    yjsDocumentService: YjsDocumentService,
    persistorFactory:   PersistorFactory,
  ) {
    super(yjsDocumentService, persistorFactory)
  }

  async editText(
    documentId:  string,
    workspaceId: string,
    blockId:     string,
    userId:      string,
    modelId:     string,
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
    block:    Y.XmlElement<MarkdownBlock>,
    modelId:  string,
    intent:   MarkdownEditIntent,
  ): Promise<string> {
    let cleanup: () => void = () => {}
    let aborted = false
    let result  = ''

    try {
      cleanup = taskItem.observeStatus((s) => {
        if (s._tag === 'aborting') aborted = true
      })

      const { source, editWithAIPrompt } = getMarkdownAttributes(block);
      const content      = source?.toJSON()           ?? '';
      const instructions = editWithAIPrompt?.toJSON() ?? '';
      if (!instructions) {
        taskItem.setCompleted('error');
        return result;
      }


      await this.simulate({
        content,
        instructions: this.buildInstructions(intent, instructions),
        modelId,
        onContent: (accumulated) => {
          if (aborted) return
          result = accumulated
          updateMarkdownAISuggestions(block, accumulated)
        },
      })

      if (aborted) {
        taskItem.setCompleted('aborted')
        return result
      }

      closeMarkdownEditWithAIPrompt(block, true)
      taskItem.setCompleted('success')
      return result
    } catch (err) {
      taskItem.setCompleted('error')
      throw err
    } finally {
      cleanup()
    }
  }

  private async simulate(opts: TextEditStreamedOptions): Promise<void> {
    await new Promise((r) => setTimeout(r, 800))

    const generated = this.randomMarkdown()
    opts.onContent(generated)
  }

  private randomMarkdown(): string {
    const idx = Math.floor(Math.random() * RANDOM_MARKDOWN_SAMPLES.length)
    return RANDOM_MARKDOWN_SAMPLES[idx]
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