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
import { getMarkdownAttributes } from './blocks/markdown.js'

interface SerializeOptions {
  focusedBlockId?: string | null
  executingBlockIds?: string[]
}

interface BlockMeta {
  id: string
  type: string
  title: string
  blockGroupId: string
}

interface ResolvedBlock {
  meta: BlockMeta
  block: YBlock
  fingerprint: string
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

function formatRows(columns: any[], rows: any[], maxRows: number): string {
  if (!rows || rows.length === 0) return ''
  const sliced = rows.slice(0, maxRows)
  const header = `| ${columns.map((c: any) => c.name).join(' | ')} |`
  const sep = `| ${columns.map(() => '---').join(' | ')} |`
  const rowLines = sliced.map((row: any) => {
    const cells = columns.map((c: any) => String(row[c.name] ?? ''))
    return `| ${cells.join(' | ')} |`
  })
  return [header, sep, ...rowLines].join('\n')
}

function parsePandasHtml(html: string, maxRows: number): string {
  const theadMatch = html.match(/<thead>([\s\S]*?)<\/thead>/)
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/)
  const countMatch = html.match(/(\d[\d,]+)\s+rows\s+×\s+(\d+)\s+col/)

  if (!theadMatch || !tbodyMatch) return '*(html output — unparsable)*'

  const headerThs = theadMatch[1]?.match(/<th[^>]*>([\s\S]*?)<\/th>/g) ?? []
  const cols = headerThs
    .map((h) => h.replace(/<[^>]+>/g, '').trim())
    .filter((h) => h !== '')

  if (cols.length === 0) return '*(html output — no columns found)*'

  const trs = tbodyMatch[1]?.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) ?? []
  const rows = trs.slice(0, maxRows).map((tr) => {
    const tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/g) ?? []
    return tds.map((td) => td.replace(/<[^>]+>/g, '').trim())
  })

  const summary = countMatch
    ? `DataFrame ${countMatch[1]} rows × ${countMatch[2]} cols`
    : 'DataFrame output'

  const header = `| ${cols.join(' | ')} |`
  const sep = `| ${cols.map(() => '---').join(' | ')} |`
  const rowLines = rows.map((cells) => {
    const aligned = cols.map((_, i) => cells[i + 1] ?? '')
    return `| ${aligned.join(' | ')} |`
  })

  return [summary, header, sep, ...rowLines].join('\n')
}

function returnSignature(block: YBlock, meta: BlockMeta, allBlocks: ReturnType<typeof getBlocks>): string {
  let sig = ''
  switchBlockType(block, {
    onPython: (b) => {
      const attrs = getPythonAttributes(b)
      if (!attrs.result || attrs.result.length === 0) { sig = '→ *(no output)*'; return }
      for (const r of attrs.result as any[]) {
        if (r.type === 'error') { sig = `→ **ERROR:** \`${r.ename}: ${r.evalue}\``; return }
        if (r.type === 'image') { sig = '→ *[image output]*'; return }
        if (r.type === 'html') {
          const countMatch = r.html.match(/(\d[\d,]+)\s+rows\s+×\s+(\d+)\s+col/)
          const theadMatch = r.html.match(/<thead>([\s\S]*?)<\/thead>/)
          const headerThs = theadMatch?.[1]?.match(/<th[^>]*>([\s\S]*?)<\/th>/g) ?? []
          const cols = headerThs.map((h: string) => h.replace(/<[^>]+>/g, '').trim()).filter(Boolean)
          sig = countMatch
            ? `→ DataFrame ${countMatch[1]} rows × ${countMatch[2]} cols [${cols.join(', ')}]`
            : '→ DataFrame output'
          return
        }
        if (r.type === 'stream') { sig = `→ ${(r.text ?? '').slice(0, 200)}`; return }
      }
      sig = '→ *(output)*'
    },
    onSQL: (b) => {
      const attrs = getSQLAttributes(b, allBlocks)
      const r = attrs.result as any
      if (!r) { sig = '→ *(no result)*'; return }
      if (r.type === 'error') { sig = `→ **ERROR:** ${r.error}`; return }
      if (r.type === 'success') {
        const cols = (r.columns ?? []).map((c: any) => `${c.name}(${c.type})`).join(', ')
        sig = `→ ${(r.count ?? 0).toLocaleString()} rows × ${(r.columns ?? []).length} cols | ${cols}`
      }
    },
    onRichText: (b) => {
      const text = extractRichText(b)
      sig = text ? `→ ${text.slice(0, 100)}` : '→ *(empty)*'
    },
    onMarkdown: (b) => {
      const text = getMarkdownAttributes(b).source.toString().trim()
      sig = text ? `→ ${text.slice(0, 100)}` : '→ *(empty)*'
    },
  
    onPowerToolbox: (b) => {
      const attrs = getPowerToolboxAttributes(b)
      sig = (!attrs.result || (attrs.result as any[]).length === 0)
        ? '→ *(not yet executed)*'
        : '→ executed'
    },
    onVisualizationV2: (b) => {
      const attrs = getVisualizationV2Attributes(b)
      sig = attrs.error ? `→ **ERROR:** ${attrs.error}` : '→ *(chart)*'
    },
    onInput: (b) => {
      const attrs = getInputAttributes(b, allBlocks)
      sig = `→ \`${attrs.variable.value}\` = \`"${attrs.value.value}"\``
    },
    onDropdownInput: (b) => {
      const attrs = getDropdownInputAttributes(b, allBlocks)
      sig = `→ \`${attrs.variable.value}\` = \`"${attrs.value.value}"\``
    },
    onDateInput: (b) => {
      const attrs = getDateInputAttributes(b, allBlocks)
      sig = `→ \`${attrs.variable}\` = \`"${attrs.value}"\``
    },
    onPivotTable: (b) => {
      const attrs = getPivotTableAttributes(b, allBlocks)
      sig = attrs.error ? `→ **ERROR:** ${attrs.error}` : `→ pivot on \`${attrs.dataframeName}\``
    },
    onDashboardHeader: (b) => {
      sig = `→ "${String(b.getAttribute('content') ?? '').slice(0, 80)}"`
    },
    onVisualization: () => { sig = '→ *(legacy visualization)*' },
    onFileUpload: () => { sig = '→ *(file upload)*' },
  })
  return sig
}

function blockSource(block: YBlock, meta: BlockMeta, allBlocks: ReturnType<typeof getBlocks>, cap: number | null): string {
  let source = ''
  switchBlockType(block, {
    onPython: (b) => {
      const raw = getPythonAttributes(b).source.toString().trim()
      const capped = cap && raw.length > cap ? raw.slice(0, cap) + '\n...(truncated)' : raw
      source = `\`\`\`python\n${capped}\n\`\`\``
    },
    onSQL: (b) => {
      const raw = getSQLAttributes(b, allBlocks).source.toString().trim()
      const capped = cap && raw.length > cap ? raw.slice(0, cap) + '\n...(truncated)' : raw
      source = `\`\`\`sql\n${capped}\n\`\`\``
    },
    onRichText: (b) => { source = extractRichText(b) },
    onMarkdown: (b) => {
      const raw = getMarkdownAttributes(b).source.toString().trim()
      source = raw ? `\`\`\`markdown\n${raw}\n\`\`\`` : ''
    },
    onPowerToolbox: (b) => {
      const attrs = getPowerToolboxAttributes(b)
      const parts = [`**tool:** \`${attrs.toolId ?? '(none)'}\``]
      if (attrs.toolLabel) parts.push(`**label:** ${attrs.toolLabel}`)
      if (attrs.toolCategory) parts.push(`**category:** ${attrs.toolCategory}`)
      if (attrs.inputs && Object.keys(attrs.inputs).length > 0)
        parts.push(`**inputs:** \`${JSON.stringify(attrs.inputs)}\``)
      if (attrs.generatedSource)
        parts.push(`**generated:**\n\`\`\`python\n${String(attrs.generatedSource)}\n\`\`\``)
      source = parts.join('\n')
    },
    onVisualizationV2: (b) => {
      const attrs = getVisualizationV2Attributes(b)
      source = `**input:** \`${JSON.stringify(attrs.input ?? {})}\``
    },
    onInput: (b) => {
      const attrs = getInputAttributes(b, allBlocks)
      source = `**label:** ${attrs.label}\n**variable:** \`${attrs.variable.value}\`\n**value:** \`${attrs.value.value}\``
    },
    onDropdownInput: (b) => {
      const attrs = getDropdownInputAttributes(b, allBlocks)
      source = `**label:** ${attrs.label}\n**variable:** \`${attrs.variable.value}\`\n**value:** \`${attrs.value.value}\`\n**options:** \`${JSON.stringify(attrs.options)}\``
    },
    onDateInput: (b) => {
      const attrs = getDateInputAttributes(b, allBlocks)
      source = `**label:** ${attrs.label}\n**variable:** \`${attrs.variable}\`\n**value:** \`${attrs.value}\`\n**type:** ${attrs.dateType}`
    },
    onPivotTable: (b) => {
      const attrs = getPivotTableAttributes(b, allBlocks)
      source = `**dataframe:** \`${attrs.dataframeName}\`\n**rows:** \`${JSON.stringify(attrs.rows)}\`\n**columns:** \`${JSON.stringify(attrs.columns)}\`\n**metrics:** \`${JSON.stringify(attrs.metrics)}\``
    },
    onDashboardHeader: (b) => {
      source = String(b.getAttribute('content') ?? '')
    },
    onVisualization: () => { source = '' },
    onFileUpload: () => { source = '' },
  })
  return source
}

function focusedBlockDetail(
  block: YBlock,
  meta: BlockMeta,
  allBlocks: ReturnType<typeof getBlocks>
): string {
  const lines: string[] = [
    `### [FOCUSED] \`${meta.id}\` ${meta.type}${meta.title ? ` — "${meta.title}"` : ''}`,
  ]

  switchBlockType(block, {
    onPython: (b) => {
      const attrs = getPythonAttributes(b)
      if (attrs.lastQueryTime) lines.push(`*last run: ${attrs.lastQueryTime}*`)
      lines.push(`\`\`\`python\n${attrs.source.toString().trim()}\n\`\`\``)
      if (attrs.lastQuery && attrs.lastQuery !== attrs.source.toString().trim()) {
        lines.push(`*last executed query:*\n\`\`\`python\n${attrs.lastQuery}\n\`\`\``)
      }
      if (attrs.result && (attrs.result as any[]).length > 0) {
        lines.push(`**result:**`)
        for (const r of attrs.result) {
          if (r.type === 'error') { lines.push(`> **ERROR:** \`${r.ename}: ${r.evalue}\`\n\`\`\`\n${r.traceback ?? ''}\n\`\`\``); continue }
          if (r.type === 'image') { lines.push('*[image output]*'); continue }
          //if (r.type === 'stream') { lines.push(`\`\`\`\n${r.text ?? ''}\n\`\`\``); continue }
          if (r.type === 'html') { lines.push(parsePandasHtml(r.html, 10)); continue }
        }
      }
    },

    onSQL: (b) => {
      const attrs = getSQLAttributes(b, allBlocks)
      if (attrs.lastQueryTime) lines.push(`*last run: ${attrs.lastQueryTime}*`)
      lines.push(`\`\`\`sql\n${attrs.source.toString().trim()}\n\`\`\``)
      lines.push(`**dataframe:** \`${attrs.dataframeName.value}\``)
      if (attrs.dataSourceId) lines.push(`**dataSource:** \`${attrs.dataSourceId}\``)
      if (attrs.lastQuery && attrs.lastQuery !== attrs.source.toString().trim()) {
        lines.push(`*last executed query:*\n\`\`\`sql\n${attrs.lastQuery}\n\`\`\``)
      }
      const r = attrs.result as any
      if (r) {
        if (r.type === 'error') { lines.push(`> **ERROR:** ${r.error}`); return }
        if (r.type === 'success') {
          lines.push(`**result:** ${(r.count ?? 0).toLocaleString()} rows × ${(r.columns ?? []).length} cols`)
          lines.push(`**columns:** ${(r.columns ?? []).map((c: any) => `\`${c.name}(${c.type})\``).join(', ')}`)
          if ((r.rows ?? []).length > 0) lines.push(formatRows(r.columns, r.rows, 10))
        }
      }
    },

    onRichText: (b) => {
      lines.push(extractRichText(b) || '*(empty)*')
    },

    onMarkdown: (b) => {
      const raw = getMarkdownAttributes(b).source.toString().trim()
      lines.push(raw || '*(empty)*')
    },

    onPowerToolbox: (b) => {
      const attrs = getPowerToolboxAttributes(b)
      lines.push(`**tool_id:** \`${attrs.toolId ?? '(none)'}\``)
      if (attrs.toolLabel) lines.push(`**label:** ${attrs.toolLabel}`)
      if (attrs.toolCategory) lines.push(`**category:** ${attrs.toolCategory}`)
      lines.push(`**inputs:** \`${JSON.stringify(attrs.inputs ?? {})}\``)
      lines.push(`**last executed inputs:** \`${JSON.stringify(attrs.lastExecutedInputs ?? {})}\``)
      if (attrs.generatedSource)
        lines.push(`**generated source:**\n\`\`\`python\n${String(attrs.generatedSource)}\n\`\`\``)
      else
        lines.push(`**generated source:** *(empty)*`)
      if (attrs.executedAt) lines.push(`*executed at: ${attrs.executedAt}*`)
      if (attrs.result && (attrs.result as any[]).length > 0)
        lines.push(`**result:**\n\`\`\`json\n${JSON.stringify(attrs.result, null, 2)}\n\`\`\``)
    },

    onVisualizationV2: (b) => {
      const attrs = getVisualizationV2Attributes(b)
      lines.push(`**input:** \`${JSON.stringify(attrs.input ?? {})}\``)
      if (attrs.error) lines.push(`> **ERROR:** ${attrs.error}`)
      else lines.push(`**output:** \`${JSON.stringify(attrs.output ?? {})}\``)
    },

    onInput: (b) => {
      const attrs = getInputAttributes(b, allBlocks)
      lines.push(`**label:** ${attrs.label}`)
      lines.push(`**variable:** \`${attrs.variable.value}\``)
      lines.push(`**value:** \`${attrs.value.value}\``)
      if (attrs.executedAt) lines.push(`*executed at: ${attrs.executedAt}*`)
    },

    onDropdownInput: (b) => {
      const attrs = getDropdownInputAttributes(b, allBlocks)
      lines.push(`**label:** ${attrs.label}`)
      lines.push(`**variable:** \`${attrs.variable.value}\``)
      lines.push(`**value:** \`${attrs.value.value}\``)
      lines.push(`**options:** \`${JSON.stringify(attrs.options)}\``)
      lines.push(`**type:** ${attrs.dropdownType}`)
      if (attrs.executedAt) lines.push(`*executed at: ${attrs.executedAt}*`)
    },

    onDateInput: (b) => {
      const attrs = getDateInputAttributes(b, allBlocks)
      lines.push(`**label:** ${attrs.label}`)
      lines.push(`**variable:** \`${attrs.variable}\``)
      lines.push(`**value:** \`${attrs.value}\``)
      lines.push(`**type:** ${attrs.dateType}`)
      if (attrs.executedAt) lines.push(`*executed at: ${attrs.executedAt}*`)
    },

    onPivotTable: (b) => {
      const attrs = getPivotTableAttributes(b, allBlocks)
      lines.push(`**dataframe:** \`${attrs.dataframeName}\``)
      lines.push(`**rows:** \`${JSON.stringify(attrs.rows)}\``)
      lines.push(`**columns:** \`${JSON.stringify(attrs.columns)}\``)
      lines.push(`**metrics:** \`${JSON.stringify(attrs.metrics)}\``)
      if (attrs.error) lines.push(`> **ERROR:** ${attrs.error}`)
      if (attrs.updatedAt) lines.push(`*updated at: ${attrs.updatedAt}*`)
    },

    onDashboardHeader: (b) => {
      lines.push(String(b.getAttribute('content') ?? ''))
    },

    onVisualization: () => { lines.push('*(legacy visualization)*') },
    onFileUpload: () => { lines.push('*(file upload)*') },
  })

  return lines.join('\n\n')
}

function fingerprintBlock(
  block: YBlock,
  meta: BlockMeta,
  allBlocks: ReturnType<typeof getBlocks>
): string {
  try {
    const parts: any[] = [meta.type]
    switchBlockType(block, {
      onPython: (b) => {
        const a = getPythonAttributes(b)
        parts.push(a.source.toString(), JSON.stringify(a.result), a.lastQueryTime)
      },
      onSQL: (b) => {
        const a = getSQLAttributes(b, allBlocks)
        parts.push(a.source.toString(), JSON.stringify(a.result), a.lastQueryTime)
      },
      onRichText: (b) => { parts.push(extractRichText(b)) },
      onMarkdown: (b) => {
        parts.push(getMarkdownAttributes(b).source.toString())
      },
      onPowerToolbox: (b) => {
        const a = getPowerToolboxAttributes(b)
        parts.push(a.toolId, JSON.stringify(a.inputs), a.generatedSource, JSON.stringify(a.result))
      },
      onVisualizationV2: (b) => {
        const a = getVisualizationV2Attributes(b)
        parts.push(JSON.stringify(a.input), JSON.stringify(a.output))
      },
      onInput: (b) => {
        const a = getInputAttributes(b, allBlocks)
        parts.push(a.variable.value, a.value.value)
      },
      onDropdownInput: (b) => {
        const a = getDropdownInputAttributes(b, allBlocks)
        parts.push(a.variable.value, a.value.value, JSON.stringify(a.options))
      },
      onDateInput: (b) => {
        const a = getDateInputAttributes(b, allBlocks)
        parts.push(a.variable, a.value)
      },
      onPivotTable: (b) => {
        const a = getPivotTableAttributes(b, allBlocks)
        parts.push(a.dataframeName, JSON.stringify(a.rows), JSON.stringify(a.columns))
      },
      onDashboardHeader: (b) => { parts.push(b.getAttribute('content')) },
      onVisualization: () => {},
      onFileUpload: () => {},
    })
    return parts.join('||')
  } catch {
    return meta.id
  }
}

function getLastRunTime(block: YBlock, allBlocks: ReturnType<typeof getBlocks>): string | null {
  let t: string | null = null
  switchBlockType(block, {
    onPython: (b) => { t = getPythonAttributes(b).lastQueryTime ?? null },
    onSQL: (b) => { t = getSQLAttributes(b, allBlocks).lastQueryTime ?? null },
    onPowerToolbox: (b) => { t = getPowerToolboxAttributes(b).executedAt ?? null },
    onInput: (b) => { t = getInputAttributes(b, allBlocks).executedAt ?? null },
    onDropdownInput: (b) => { t = getDropdownInputAttributes(b, allBlocks).executedAt ?? null },
    onDateInput: (b) => { t = getDateInputAttributes(b, allBlocks).executedAt ?? null },
    onPivotTable: (b) => { t = getPivotTableAttributes(b, allBlocks).updatedAt ?? null },
    onRichText: () => {},
    onMarkdown: () => {},
    onVisualizationV2: () => {},
    onVisualization: () => {},
    onDashboardHeader: () => {},
    onFileUpload: () => {},
  })
  return t
}

function getBlockError(block: YBlock, allBlocks: ReturnType<typeof getBlocks>): string | null {
  let err: string | null = null
  switchBlockType(block, {
    onPython: (b) => {
      const result = getPythonAttributes(b).result as any[]
      if (!result) return
      for (const r of result) {
        if (r.type === 'error') { err = `${r.ename}: ${r.evalue}`; return }
      }
    },
    onSQL: (b) => {
      const r = getSQLAttributes(b, allBlocks).result as any
      if (r?.type === 'error') err = r.error
    },
    onPowerToolbox: (b) => {
      const result = getPowerToolboxAttributes(b).result as any[]
      if (!result) return
      for (const r of result) {
        if (r.type === 'error') { err = `${r.ename}: ${r.evalue}`; return }
      }
    },
    onVisualizationV2: (b) => {
      err = getVisualizationV2Attributes(b).error ?? null
    },
    onPivotTable: (b) => {
      err = getPivotTableAttributes(b, allBlocks).error ?? null
    },
    onRichText: () => {},
    onMarkdown: () => {},
    onInput: () => {},
    onDropdownInput: () => {},
    onDateInput: () => {},
    onDashboardHeader: () => {},
    onVisualization: () => {},
    onFileUpload: () => {},
  })
  return err
}

function buildResultPreview(block: YBlock, allBlocks: ReturnType<typeof getBlocks>, maxRows: number): string {
  let preview = ''
  switchBlockType(block, {
    onSQL: (b) => {
      const attrs = getSQLAttributes(b, allBlocks)
      const res = attrs.result as any
      if (res?.type === 'success' && (res.rows ?? []).length > 0) {
        preview = '\n\n' + formatRows(res.columns, res.rows, maxRows)
      }
    },
    onPython: (b) => {
      const attrs = getPythonAttributes(b)
      for (const out of (attrs.result ?? [])) {
        if (out.type === 'html') {
          preview = '\n\n' + parsePandasHtml(out.html, maxRows)
          break
        }
      }
    },
    onRichText: () => {},
    onMarkdown: () => {},
    onPowerToolbox: () => {},
    onVisualizationV2: () => {},
    onInput: () => {},
    onDropdownInput: () => {},
    onDateInput: () => {},
    onPivotTable: () => {},
    onDashboardHeader: () => {},
    onVisualization: () => {},
    onFileUpload: () => {},
  })
  return preview
}

export function docToMarkdown(
  doc: Y.Doc,
  options: SerializeOptions = {}
): string {
  const { focusedBlockId = null, executingBlockIds = [] } = options

  const blocks = getBlocks(doc)
  const layout = getLayout(doc)
  const title = extractTitle(doc)

  const resolved: ResolvedBlock[] = []

  for (const blockGroup of layout) {
    const tabs = getTabsFromBlockGroup(blockGroup as YBlockGroup, blocks)
    for (const tab of tabs) {
      const block = blocks.get(tab.blockId)
      if (!block) continue
      const meta: BlockMeta = {
        id: tab.blockId,
        type: tab.type,
        title: tab.title ?? '',
        blockGroupId: tab.blockGroupId,
      }
      resolved.push({ meta, block, fingerprint: fingerprintBlock(block, meta, blocks) })
    }
  }

  const seenFingerprints = new Map<string, string>()
  const dupOf = new Map<string, string>()

  for (const r of resolved) {
    if (seenFingerprints.has(r.fingerprint)) {
      dupOf.set(r.meta.id, seenFingerprints.get(r.fingerprint)!)
    } else {
      seenFingerprints.set(r.fingerprint, r.meta.id)
    }
  }

  const focusedIdx = focusedBlockId
    ? resolved.findIndex((r) => r.meta.id === focusedBlockId)
    : -1

  const sections: string[] = []

  sections.push(`# NOTEBOOK SPINE`)
  sections.push(`**title:** ${title || '*(untitled)*'} | **doc:** \`${doc.guid ?? ''}\` | *${new Date().toISOString()}*`)

  const inputLines: string[] = []
  for (const { block } of resolved) {
    switchBlockType(block, {
      onInput: (b) => {
        const a = getInputAttributes(b, blocks)
        inputLines.push(`- \`${a.variable.value}\` = \`"${a.value.value}"\``)
      },
      onDropdownInput: (b) => {
        const a = getDropdownInputAttributes(b, blocks)
        inputLines.push(`- \`${a.variable.value}\` = \`"${a.value.value}"\``)
      },
      onDateInput: (b) => {
        const a = getDateInputAttributes(b, blocks)
        inputLines.push(`- \`${a.variable}\` = \`"${a.value}"\` *(${a.dateType})*`)
      },
      onPython: () => {},
      onSQL: () => {},
      onRichText: () => {},
      onMarkdown: () => {},
      onPowerToolbox: () => {},
      onVisualizationV2: () => {},
      onVisualization: () => {},
      onPivotTable: () => {},
      onDashboardHeader: () => {},
      onFileUpload: () => {},
    })
  }
  if (inputLines.length > 0) sections.push(`## INPUTS\n\n${inputLines.join('\n')}`)

  const dfLines: string[] = []
  for (const { block } of resolved) {
    switchBlockType(block, {
      onSQL: (b) => {
        const attrs = getSQLAttributes(b, blocks)
        const r = attrs.result as any
        if (!r || r.type !== 'success') return
        const cols = (r.columns ?? []).map((c: any) => c.name).join(', ')
        const lines = [`**${attrs.dataframeName.value}** — ${(r.count ?? 0).toLocaleString()} rows × ${(r.columns ?? []).length} cols [${cols}]`]
        if ((r.rows ?? []).length > 0) lines.push(formatRows(r.columns, r.rows, 3))
        dfLines.push(lines.join('\n'))
      },
      onPython: () => {},
      onRichText: () => {},
      onMarkdown: () => {},
      onPowerToolbox: () => {},
      onVisualizationV2: () => {},
      onInput: () => {},
      onDropdownInput: () => {},
      onDateInput: () => {},
      onPivotTable: () => {},
      onDashboardHeader: () => {},
      onVisualization: () => {},
      onFileUpload: () => {},
    })
  }
  if (dfLines.length > 0) sections.push(`## DATAFRAMES\n\n${dfLines.join('\n\n')}`)

  if (executingBlockIds.length > 0) {
    const execLines = executingBlockIds.map((id) => {
      const r = resolved.find((x) => x.meta.id === id)
      return r
        ? `- \`${id}\` ${r.meta.type}${r.meta.title ? ` "${r.meta.title}"` : ''} — *currently running*`
        : `- \`${id}\` — *currently running*`
    })
    sections.push(`## EXECUTING\n\n${execLines.join('\n')}`)
  }

  const blockMapLines: string[] = ['## BLOCK MAP']

  for (let i = 0; i < resolved.length; i++) {
    const entry = resolved[i]
    if (!entry) continue
    const { meta, block } = entry
    if (!meta || !block) continue

    const isFocused = meta.id === focusedBlockId
    const isDup = dupOf.has(meta.id)
    const origId = dupOf.get(meta.id)
    const lastRun = getLastRunTime(block, blocks)
    const error = getBlockError(block, blocks)
    const executing = executingBlockIds.includes(meta.id)

    const statusParts: string[] = []
    if (executing) statusParts.push('🔄 EXECUTING')
    if (error) statusParts.push(`❌ ERROR: ${error}`)

    const lastRunLine = lastRun ? `\n*last run: ${lastRun}*` : ''
    const statusLine = statusParts.length > 0 ? `\n${statusParts.join(' · ')}` : ''
    const header = `### [${i}] \`${meta.id}\` ${meta.type}${meta.title ? ` — "${meta.title}"` : ''}${lastRunLine}${statusLine}`

    if (isDup) {
      blockMapLines.push(`${header}\n\n*(duplicate of \`${origId}\`)*\n\n---`)
      continue
    }

    if (isFocused) {
      blockMapLines.push(focusedBlockDetail(block, meta, blocks))
      blockMapLines.push('---')
      continue
    }

    const isNPlus1 = focusedIdx >= 0 && i === focusedIdx + 1
    const source = blockSource(block, meta, blocks, 500)
    const sig = returnSignature(block, meta, blocks)

    if (focusedBlockId === null) {
      const preview = buildResultPreview(block, blocks, 2)
      blockMapLines.push(`${header}\n\n${source}\n\n${sig}${preview}\n\n---`)
      continue
    }

    if (isNPlus1) {
      const preview = buildResultPreview(block, blocks, 2)
      blockMapLines.push(`${header}\n\n${source}\n\n${sig}${preview}\n\n---`)
      continue
    }

    blockMapLines.push(`${header}\n\n${source}\n\n${sig}\n\n---`)
  }

  sections.push(blockMapLines.join('\n\n'))

  return sections.join('\n\n')
}