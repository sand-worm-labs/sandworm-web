import * as Y from 'yjs'
import {
  switchBlockType,
  getBlocks,
  getLayout,
  getTabsFromBlockGroup,
  getPythonAttributes,
  getSQLAttributes,
  getRichTextAttributes,
  getPowerToolboxAttributes,
  getVisualizationV2Attributes,
  getInputAttributes,
  getDropdownInputAttributes,
  getDateInputAttributes,
  getPivotTableAttributes,
  getFileUploadAttributes,
  type YBlock,
  type YBlockGroup,
  RichTextBlock,
} from './index.js'

interface SerializeOptions {
  focusedBlockId?: string | null
  maxResultRows?: number
  includeNeighbors?: boolean
}

interface BlockMeta {
  id: string
  type: string
  title: string
  blockGroupId: string
  isHiddenInPublished: boolean
}

function truncateAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function extractTitle(doc: Y.Doc): string {
  const frag = doc.getXmlFragment('doc-title')
  let title = ''
  frag.toArray().forEach((node) => {
    if (node instanceof Y.XmlElement) {
      node.toArray().forEach((child) => {
        if (child instanceof Y.XmlText) title += child.toString()
      })
    }
  })
  return title.trim()
}

function extractRichText(b: Y.XmlElement<RichTextBlock>): string {
  const attrs = getRichTextAttributes(b)
  let text = ''
  attrs.content.toArray().forEach((node) => {
    if (node instanceof Y.XmlText) {
      text += node.toString()
    } else if (node instanceof Y.XmlElement) {
      node.toArray().forEach((child) => {
        if (child instanceof Y.XmlText) text += child.toString()
      })
      text += '\n'
    }
  })
  return text.trim()
}

function formatSQLResult(result: any, maxRows: number): string {
  if (!result || result.type !== 'success') {
    return result?.type === 'error'
      ? `ERROR: ${result.error ?? 'unknown'}`
      : '(no result)'
  }

  const cols = (result.columns ?? []).map((c: any) => `${c.name}(${c.type})`)
  const rows = (result.rows ?? []).slice(0, maxRows)
  const totalRows = result.count ?? rows.length

  if (rows.length === 0) return `columns: ${cols.join(', ')}\n(empty)`

  const addrCols = new Set(
    (result.columns ?? [])
      .filter((c: any) => c.name === 'from' || c.name === 'to' || c.name === 'address')
      .map((c: any) => c.name)
  )

  const header = `| ${cols.join(' | ')} |`
  const sep = `| ${cols.map(() => '---').join(' | ')} |`
  const rowLines = rows.map((row: any) => {
    const cells = (result.columns ?? []).map((c: any) => {
      const v = String(row[c.name] ?? '')
      return addrCols.has(c.name) ? truncateAddr(v) : v
    })
    return `| ${cells.join(' | ')} |`
  })

  const shown = rows.length
  const note =
    totalRows > shown
      ? `*(${shown} of ${totalRows.toLocaleString()} rows shown)*`
      : `*(${totalRows} rows)*`

  return [header, sep, ...rowLines, note].join('\n')
}

function formatPythonResult(result: any[], maxRows: number): string {
  if (!result || result.length === 0) return '(no output)'

  return result
    .map((r: any) => {
      if (r.type === 'image') return `[image output — ref only]`
      if (r.type === 'error') return `ERROR: ${r.ename}: ${r.evalue}`
      if (r.type === 'html') {
        const headerMatch = r.html.match(/<th>(.*?)<\/th>/g)
        const rowMatch = r.html.match(/<tr[^>]*>(.*?)<\/tr>/g)
        if (headerMatch && rowMatch) {
          const headers = headerMatch.map((h: string) =>
            h.replace(/<\/?th>/g, '').trim()
          )
          const countMatch = r.html.match(/(\d[\d,]+)\s+rows\s+×\s+(\d+)\s+col/)
          const summary = countMatch
            ? `DataFrame — ${countMatch[1]} rows × ${countMatch[2]} cols`
            : 'DataFrame output'
          return `${summary}\ncolumns: ${headers.join(', ')}`
        }
        return '(html output — stripped)'
      }
      if (r.type === 'stream') return r.text?.slice(0, 500) ?? ''
      return JSON.stringify(r).slice(0, 300)
    })
    .join('\n')
}

function buildSpine(
  title: string,
  blockMetas: BlockMeta[],
  focusedBlockId: string | null | undefined
): string {
  const lines = [
    `# NOTEBOOK SPINE`,
    `title: "${title || '(untitled)'}"`,
    `blocks: ${blockMetas.length}`,
    ``,
    `BLOCK MAP:`,
  ]

  for (let i = 0; i < blockMetas.length; i++) {
    const m = blockMetas[i]
    const focused = m?.id === focusedBlockId ? ' ← FOCUSED' : ''
    const label = m?.title ? ` "${m.title}"` : ''
    lines.push(`[${i}] ${m?.id?.slice(0, 8) || ''} ${m?.type || ''}${label}${focused}`)
  }

  return lines.join('\n')
}

function buildBlockDetail(
  blockId: string,
  block: YBlock,
  meta: BlockMeta,
  blocks: ReturnType<typeof getBlocks>,
  maxRows: number
): string {
  const lines: string[] = [
    `## BLOCK [${blockId}] · ${meta.type}${meta.title ? ` "${meta.title}"` : ''}`,
  ]

  switchBlockType(block, {
    onPython: (b) => {
      const attrs = getPythonAttributes(b)
      const source = attrs.source.toString().trim()
      lines.push('```python', source, '```')
      if (attrs.lastQueryTime) lines.push(`*last run: ${attrs.lastQueryTime}*`)
      const resultMd = formatPythonResult(attrs.result, maxRows)
      if (resultMd) lines.push('**output:**', resultMd)
    },

    onSQL: (b) => {
      const attrs = getSQLAttributes(b, blocks)
      const source = attrs.source.toString().trim()
      lines.push('```sql', source, '```')
      lines.push(`dataframe: \`${attrs.dataframeName.value}\``)
      if (attrs.lastQueryTime) lines.push(`*last run: ${attrs.lastQueryTime}*`)
      const resultMd = formatSQLResult(attrs.result, maxRows)
      if (resultMd) lines.push('**result:**', resultMd)
    },

    onRichText: (b) => {
      const text = extractRichText(b)
      if (text) lines.push(text)
      else lines.push('*(empty)*')
    },

    onPowerToolbox: (b) => {
      const attrs = getPowerToolboxAttributes(b)
      lines.push(`**tool_id:** \`${attrs.toolId ?? '(none)'}\``)
      if (attrs.toolLabel) lines.push(`**label:** ${attrs.toolLabel}`)
      if (attrs.toolCategory) lines.push(`**category:** ${attrs.toolCategory}`)
      const inputs = attrs.inputs
      if (inputs && Object.keys(inputs).length > 0)
        lines.push(`**inputs:** \`${JSON.stringify(inputs)}\``)
      else lines.push(`**inputs:** (none)`)
      if (attrs.generatedSource) {
        lines.push('**generated source:**')
        lines.push('```python', String(attrs.generatedSource).slice(0, 800), '```')
      } else {
        lines.push('**generated source:** (empty — not yet executed)')
      }
      if (attrs.result && (attrs.result as any[]).length > 0) {
        lines.push('**result:**', formatPythonResult(attrs.result as any[], maxRows))
      }
    },

    onVisualizationV2: (b) => {
      const attrs = getVisualizationV2Attributes(b)
      lines.push(`**visualization block**`)
      if (attrs.error) lines.push(`ERROR: ${attrs.error}`)
      else lines.push(`*(chart output — visual only)*`)
    },

    onInput: (b) => {
      const attrs = getInputAttributes(b, blocks)
      lines.push(`variable: \`${attrs.variable.value}\` = \`${attrs.value.value}\``)
    },

    onDropdownInput: (b) => {
      const attrs = getDropdownInputAttributes(b, blocks)
      lines.push(
        `variable: \`${attrs.variable.value}\` = \`${attrs.value.value}\``,
        `options: ${JSON.stringify(attrs.options)}`
      )
    },

    onDateInput: (b) => {
      const attrs = getDateInputAttributes(b, blocks)
      lines.push(`variable: \`${attrs.variable}\` = \`${attrs.value}\` (${attrs.dateType})`)
    },

    onFileUpload: (b) => {
      const attrs = getFileUploadAttributes(b)
      const files = attrs.uploadedFiles.map((f) => `${f.name} (${f.size}b)`).join(', ')
      lines.push(`uploaded: ${files || '(none)'}`)
    },

    onPivotTable: (b) => {
      const attrs = getPivotTableAttributes(b, blocks)
      lines.push(
        `dataframe: \`${attrs.dataframeName}\``,
        `rows: ${JSON.stringify(attrs.rows)}`,
        `columns: ${JSON.stringify(attrs.columns)}`,
        `metrics: ${JSON.stringify(attrs.metrics)}`
      )
      if (attrs.error) lines.push(`ERROR: ${attrs.error}`)
    },

    onDashboardHeader: (b) => {
      lines.push(String(b.getAttribute('content') ?? ''))
    },

    onVisualization: () => {
      lines.push('*(legacy visualization)*')
    },
  })

  return lines.join('\n')
}

function fingerprintBlock(
  block: YBlock,
  meta: BlockMeta,
  allBlocks: ReturnType<typeof getBlocks>
): string {
  try {
    let sig = meta.type
    switchBlockType(block, {
      onPython: (b) => { sig += getPythonAttributes(b).source.toString() },
      onSQL: (b) => { sig += getSQLAttributes(b, allBlocks).source.toString() },
      onRichText: (b) => { sig += extractRichText(b) },
      onPowerToolbox: (b) => { sig += getPowerToolboxAttributes(b).toolId },
      onVisualizationV2: () => {},
      onVisualization: () => {},
      onInput: () => {},
      onDropdownInput: () => {},
      onDateInput: () => {},
      onFileUpload: () => {},
      onPivotTable: () => {},
      onDashboardHeader: () => {},
    })
    return sig
  } catch {
    return meta.id
  }
}

export function docToMarkdown(
  doc: Y.Doc,
  options: SerializeOptions = {}
): string {
  const { focusedBlockId = null, maxResultRows = 10, includeNeighbors = true } = options

  const blocks = getBlocks(doc)
  const layout = getLayout(doc)
  const title = extractTitle(doc)

  const allMetas: BlockMeta[] = []
  const blockOrder: string[] = []

  for (const blockGroup of layout) {
    const tabs = getTabsFromBlockGroup(blockGroup as YBlockGroup, blocks)
    for (const tab of tabs) {
      const block = blocks.get(tab.blockId)
      if (!block) continue
      allMetas.push({
        id: tab.blockId,
        type: tab.type,
        title: tab.title ?? '',
        blockGroupId: tab.blockGroupId,
        isHiddenInPublished: tab.isHiddenInPublished,
      })
      blockOrder.push(tab.blockId)
    }
  }

  const seen = new Map<string, string>()
  const dupOf = new Map<string, string>()

  for (const meta of allMetas) {
    const block = blocks.get(meta.id)
    if (!block) continue
    const fp = fingerprintBlock(block, meta, blocks)
    if (seen.has(fp)) {
      dupOf.set(meta.id, seen.get(fp)!)
    } else {
      seen.set(fp, meta.id)
    }
  }

  const focusedIdx = focusedBlockId ? blockOrder.indexOf(focusedBlockId) : -1
  const neighborIds = new Set<string>()
  if (includeNeighbors && focusedIdx >= 0) {
    if (focusedIdx > 0) neighborIds.add(blockOrder[focusedIdx - 1]||"")
    if (focusedIdx < blockOrder.length - 1) neighborIds.add(blockOrder[focusedIdx + 1]||"")
  }

  const sections: string[] = []

  sections.push(buildSpine(title, allMetas, focusedBlockId))

  if (focusedBlockId) {
    const focusedBlock = blocks.get(focusedBlockId)
    const focusedMeta = allMetas.find((m) => m.id === focusedBlockId)
    if (focusedBlock && focusedMeta) {
      sections.push('---')
      sections.push('## FOCUSED BLOCK')
      sections.push(buildBlockDetail(focusedBlockId, focusedBlock, focusedMeta, blocks, maxResultRows))
    }
  }

  for (const nid of neighborIds) {
    if (nid === focusedBlockId) continue
    const nb = blocks.get(nid)
    const nm = allMetas.find((m) => m.id === nid)
    if (!nb || !nm) continue
    sections.push('---')
    sections.push('## NEIGHBOR BLOCK')
    sections.push(buildBlockDetail(nid, nb, nm, blocks, 5))
  }

  const dupGroups = new Map<string, string[]>()
  for (const [dupId, origId] of dupOf) {
    if (!dupGroups.has(origId)) dupGroups.set(origId, [])
    dupGroups.get(origId)!.push(dupId)
  }

  if (dupGroups.size > 0) {
    sections.push('---')
    sections.push('## DUPLICATES')
    for (const [origId, dups] of dupGroups) {
      const shortDups = dups.map((d) => d).join(', ')
      sections.push(`- [${origId.slice(0, 8)}] duplicated by: [${shortDups}]`)
    }
  }

  return sections.join('\n\n')
}