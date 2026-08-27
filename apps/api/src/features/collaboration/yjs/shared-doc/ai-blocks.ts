import {
  addBlockGroup,
  appendDropdownInputOptions,
  appendRichTextContent,
  BlockType,
  dateInputValueFromString,
  formatDateInputValue,
  getBlocks,
  getLayout,
  setTitle,
  updateInputValue,
} from '@sandworm/editor'
import type { DashboardHeaderBlock, DateInputBlock, DropdownInputBlock, InputBlock, PowerToolboxInputs, RichTextBlock, YBlock, YBlockGroup } from '@sandworm/editor'
import * as Y from 'yjs'

function add(
  doc: Y.Doc,
  ...calls: Array<(layout: Y.Array<YBlockGroup>, blocks: Y.Map<YBlock>, idx: number) => void>
) {
  const blocks = getBlocks(doc)
  const layout = getLayout(doc)

  doc.transact(() => {
    let idx = layout.length
    for (const call of calls) {
      call(layout, blocks, idx)
      idx++
    }
  })
}


export function addPythonBlock(doc: Y.Doc, source = '') {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.Python,
      source,
    }, idx, true)
  )
}

export function addSQLBlock(
  doc: Y.Doc,
  source = '',
  dataSourceId: string | null = null,
  isFileDataSource = false
) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.SQL,
      dataSourceId,
      isFileDataSource,
      source,
    }, idx, true)
  )
}

export function addRichTextBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.RichText,
    }, idx, true)
  )
}

export function addMarkdownBlock(doc: Y.Doc, source = '') {
  const blocks = getBlocks(doc)
  const layout = getLayout(doc)

  doc.transact(() => {
    const idx = layout.length
    const blockId = addBlockGroup(layout, blocks, { type: BlockType.Markdown }, idx, true)
    if (source && blockId) {
      const block = blocks.get(blockId) as any
      ;(block?.getAttribute('source') as Y.Text | undefined)?.insert(0, source)
    }
  })
}

export function addVisualizationBlock(doc: Y.Doc, dataframeName: string | null = null) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.VisualizationV2,
      dataframeName,
    }, idx, true)
  )
}

export function addInputBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.Input,
    }, idx, true)
  )
}

export function addDropdownInputBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.DropdownInput,
    }, idx, true)
  )
}

export function addDateInputBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.DateInput,
    }, idx, true)
  )
}

export function addFileUploadBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.FileUpload,
    }, idx, true)
  )
}

export function addDashboardHeaderBlock(doc: Y.Doc, content = '') {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.DashboardHeader,
      content,
    }, idx, true)
  )
}

function findDashboardHeaderBlockId(blocks: Y.Map<YBlock>): string | undefined {
  let existingId: string | undefined
  blocks.forEach((block, id) => {
    if (!existingId && block.getAttribute('type') === BlockType.DashboardHeader) {
      existingId = id
    }
  })
  return existingId
}

// The notebook has at most one dashboard header — re-generating it should
// update the existing one in place rather than adding a duplicate.
export function upsertDashboardHeaderBlock(doc: Y.Doc, content: string, title?: string): void {
  const blocks = getBlocks(doc)
  const layout = getLayout(doc)

  doc.transact(() => {
    const existingId = findDashboardHeaderBlockId(blocks)

    if (existingId) {
      const block = blocks.get(existingId) as Y.XmlElement<DashboardHeaderBlock> | undefined
      block?.setAttribute('content', content)
      applyTitle(blocks, existingId, title)
      return
    }

    const id = addBlockGroup(layout, blocks, { type: BlockType.DashboardHeader, content }, layout.length)
    applyTitle(blocks, id, title)
  })
}

export function addPivotTableBlock(doc: Y.Doc, dataframeName: string | null = null,) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.PivotTable,
      dataframeName,
    }, idx, true)
  )
}

export function addPowerToolboxBlock(doc: Y.Doc, toolId: string, inputs: PowerToolboxInputs) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.PowerToolbox,
      toolId,
      inputs,
    }, idx, true)
  )
}

// ─── Batch ────────────────────────────────────────────────────────────────────
// All blocks in a single transaction — single broadcast to clients.

type WithTitle = { title?: string }

export type BlockSpec = WithTitle & (
  | { type: BlockType.Python;          source?: string }
  | { type: BlockType.SQL;             source?: string; dataSourceId?: string | null; isFileDataSource?: boolean; dataframeName?: string }
  | { type: BlockType.RichText;        source?: string }
  | { type: BlockType.Markdown;        source?: string }
  | { type: BlockType.VisualizationV2; dataframeName?: string | null }
  | { type: BlockType.Input;          source?: string }
  | { type: BlockType.DropdownInput;  source?: string }
  | { type: BlockType.DateInput;      source?: string }
  | { type: BlockType.FileUpload }
  | { type: BlockType.DashboardHeader; content?: string }
  | { type: BlockType.PivotTable;      dataframeName?: string | null }
  | { type: BlockType.PowerToolbox;    toolId?: string; inputs?: PowerToolboxInputs }
)

function applyTitle(blocks: Y.Map<YBlock>, blockId: string, title: string | undefined): void {
  if (!title) return
  const block = blocks.get(blockId)
  if (block) setTitle(block, title)
}

export function addBlocks(doc: Y.Doc, specs: BlockSpec[]): string[] {
  const blocks = getBlocks(doc)
  const layout = getLayout(doc)
  const ids: string[] = []

  doc.transact(() => {
    let idx = layout.length

    for (const spec of specs) {
      let id: string | undefined

      switch (spec.type) {
        case BlockType.Python: {
          id = addBlockGroup(layout, blocks, { type: BlockType.Python, source: spec.source ?? '' }, idx, true)
          applyTitle(blocks, id, spec.title)
          break
        }

        case BlockType.SQL: {
          id = addBlockGroup(layout, blocks, {
            type: BlockType.SQL,
            dataSourceId: spec.dataSourceId ?? null,
            isFileDataSource: spec.isFileDataSource ?? false,
            source: spec.source ?? '',
            dataframeName: spec.dataframeName,
          }, idx, true)
          applyTitle(blocks, id, spec.title)
          break
        }

        case BlockType.RichText: {
          id = addBlockGroup(layout, blocks, { type: BlockType.RichText }, idx, true)
          applyTitle(blocks, id, spec.title)
          if (spec.source) {
            const block = blocks.get(id) as Y.XmlElement<RichTextBlock> | undefined
            const content = block?.getAttribute('content')
            if (content) appendRichTextContent(content, spec.source)
          }
          break
        }

        case BlockType.Markdown: {
          id = addBlockGroup(layout, blocks, { type: BlockType.Markdown }, idx, true)
          applyTitle(blocks, id, spec.title)
          if (spec.source) {
            ;(blocks.get(id) as any)?.getAttribute('source')?.insert(0, spec.source)
          }
          break
        }

        case BlockType.VisualizationV2: {
          id = addBlockGroup(layout, blocks, { type: BlockType.VisualizationV2, dataframeName: spec.dataframeName ?? null }, idx, true)
          applyTitle(blocks, id, spec.title)
          break
        }

        case BlockType.Input: {
          id = addBlockGroup(layout, blocks, { type: BlockType.Input }, idx, true)
          applyTitle(blocks, id, spec.title)

          const value = spec.source?.trim()
          if (value) {
            const block = blocks.get(id) as Y.XmlElement<InputBlock> | undefined
            if (block) updateInputValue(block, { value, newValue: value })
          }
          break
        }

        case BlockType.DropdownInput: {
          id = addBlockGroup(layout, blocks, { type: BlockType.DropdownInput }, idx, true)
          applyTitle(blocks, id, spec.title)

          const options = (spec.source ?? '')
            .split('\n')
            .map(o => o.trim())
            .filter(Boolean)
          if (options.length > 0) {
            const block = blocks.get(id) as Y.XmlElement<DropdownInputBlock> | undefined
            if (block) appendDropdownInputOptions(block, blocks, options, true)
          }
          break
        }

        case BlockType.DateInput: {
          id = addBlockGroup(layout, blocks, { type: BlockType.DateInput }, idx, true)
          applyTitle(blocks, id, spec.title)

          const dateStr = spec.source?.trim()
          if (dateStr) {
            const block = blocks.get(id) as Y.XmlElement<DateInputBlock> | undefined
            if (block) {
              const current = block.getAttribute('value')
              const dateType = block.getAttribute('dateType') ?? 'date'
              const parsed = dateInputValueFromString(dateStr, current)
              block.setAttribute('value', parsed)
              block.setAttribute('newValue', new Y.Text(formatDateInputValue(parsed, dateType)))
            }
          }
          break
        }

        case BlockType.FileUpload: {
          id = addBlockGroup(layout, blocks, { type: BlockType.FileUpload }, idx, true)
          applyTitle(blocks, id, spec.title)
          break
        }

        case BlockType.DashboardHeader: {
          id = addBlockGroup(layout, blocks, { type: BlockType.DashboardHeader, content: spec.content ?? '' }, idx)
          applyTitle(blocks, id, spec.title)
          break
        }

        case BlockType.PivotTable: {
          id = addBlockGroup(layout, blocks, { type: BlockType.PivotTable, dataframeName: spec.dataframeName ?? null }, idx, true)
          applyTitle(blocks, id, spec.title)
          break
        }

        case BlockType.PowerToolbox: {
          id = addBlockGroup(layout, blocks, { type: BlockType.PowerToolbox, toolId: spec.toolId ?? '', inputs: spec.inputs ?? null }, idx, true)
          applyTitle(blocks, id, spec.title)
          break
        }
      }

      if (id) ids.push(id)
      idx++
    }
  })

  return ids
}