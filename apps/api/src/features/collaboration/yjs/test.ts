import {
  addBlockGroup,
  BlockType,
  getBlocks,
  getLayout,
} from '@sandworm/editor'
import type { YBlock, YBlockGroup } from '@sandworm/editor'
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

// ─── Individual adders ────────────────────────────────────────────────────────

export function addPythonBlock(doc: Y.Doc, source = '') {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.Python,
      source,
    }, idx)
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
    }, idx)
  )
}

export function addRichTextBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.RichText,
    }, idx)
  )
}

export function addMarkdownBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.Markdown,
    }, idx)
  )
}

export function addVisualizationBlock(doc: Y.Doc, dataframeName: string | null = null) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.VisualizationV2,
      dataframeName,
    }, idx)
  )
}

export function addInputBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.Input,
    }, idx)
  )
}

export function addDropdownInputBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.DropdownInput,
    }, idx)
  )
}

export function addDateInputBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.DateInput,
    }, idx)
  )
}

export function addFileUploadBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.FileUpload,
    }, idx)
  )
}

export function addDashboardHeaderBlock(doc: Y.Doc, content = '') {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.DashboardHeader,
      content,
    }, idx)
  )
}

export function addPivotTableBlock(doc: Y.Doc, dataframeName: string | null = null) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.PivotTable,
      dataframeName,
    }, idx)
  )
}

export function addPowerToolboxBlock(doc: Y.Doc) {
  add(doc, (layout, blocks, idx) =>
    addBlockGroup(layout, blocks, {
      type: BlockType.PowerToolbox,
    }, idx)
  )
}

// ─── Batch ────────────────────────────────────────────────────────────────────
// All blocks in a single transaction — single broadcast to clients.

export type BlockSpec =
  | { type: BlockType.Python;          source?: string }
  | { type: BlockType.SQL;             source?: string; dataSourceId?: string | null; isFileDataSource?: boolean }
  | { type: BlockType.RichText }
  | { type: BlockType.Markdown }
  | { type: BlockType.VisualizationV2; dataframeName?: string | null }
  | { type: BlockType.Input }
  | { type: BlockType.DropdownInput }
  | { type: BlockType.DateInput }
  | { type: BlockType.FileUpload }
  | { type: BlockType.DashboardHeader; content?: string }
  | { type: BlockType.PivotTable;      dataframeName?: string | null }
  | { type: BlockType.PowerToolbox }

export function addBlocks(doc: Y.Doc, specs: BlockSpec[]): void {
  const blocks = getBlocks(doc)
  const layout = getLayout(doc)

  doc.transact(() => {
    let idx = layout.length

    for (const spec of specs) {
      switch (spec.type) {
        case BlockType.Python:
          addBlockGroup(layout, blocks, {
            type: BlockType.Python,
            source: spec.source ?? '',
          }, idx)
          break

        case BlockType.SQL:
          addBlockGroup(layout, blocks, {
            type: BlockType.SQL,
            dataSourceId: spec.dataSourceId ?? null,
            isFileDataSource: spec.isFileDataSource ?? false,
            source: spec.source ?? '',
          }, idx)
          break

        case BlockType.RichText:
          addBlockGroup(layout, blocks, { type: BlockType.RichText }, idx)
          break

        case BlockType.Markdown:
          addBlockGroup(layout, blocks, { type: BlockType.Markdown }, idx)
          break

        case BlockType.VisualizationV2:
          addBlockGroup(layout, blocks, {
            type: BlockType.VisualizationV2,
            dataframeName: spec.dataframeName ?? null,
          }, idx)
          break

        case BlockType.Input:
          addBlockGroup(layout, blocks, { type: BlockType.Input }, idx)
          break

        case BlockType.DropdownInput:
          addBlockGroup(layout, blocks, { type: BlockType.DropdownInput }, idx)
          break

        case BlockType.DateInput:
          addBlockGroup(layout, blocks, { type: BlockType.DateInput }, idx)
          break

        case BlockType.FileUpload:
          addBlockGroup(layout, blocks, { type: BlockType.FileUpload }, idx)
          break

        case BlockType.DashboardHeader:
          addBlockGroup(layout, blocks, {
            type: BlockType.DashboardHeader,
            content: spec.content ?? '',
          }, idx)
          break

        case BlockType.PivotTable:
          addBlockGroup(layout, blocks, {
            type: BlockType.PivotTable,
            dataframeName: spec.dataframeName ?? null,
          }, idx)
          break

        case BlockType.PowerToolbox:
          addBlockGroup(layout, blocks, { type: BlockType.PowerToolbox }, idx)
          break
      }

      idx++
    }
  })
}