// ─── TYPES ───────────────────────────────────────────────────────────────────

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
} from '@sandworm/editor'

// ─── UTILS ───────────────────────────────────────────────────────────────────

function xmlFragmentToText(fragment: Y.XmlFragment): string {
  let text = ''
  fragment.toArray().forEach((node) => {
    if (node instanceof Y.XmlText) {
      text += node.toString()
    } else if (node instanceof Y.XmlElement) {
      const inner = node
        .toArray()
        .map((child) => (child instanceof Y.XmlText ? child.toString() : ''))
        .join('')
      text += inner + '\n'
    }
  })
  return text.trim()
}

function resultStatus(status: string | undefined): string {
  if (!status) return 'idle'
  return status
}

function blockToMd(block: YBlock, blocks: Y.Map<YBlock>): string {
  return switchBlockType(block, {
    // ── Rich Text ──────────────────────────────────────────────────────────
    onRichText: (b:YBlock) => {
      const { id, title, content, isAiInput } = getRichTextAttributes(b)
      const lines: string[] = []
      lines.push(`## ${title || '(untitled text block)'}`)
      lines.push(`> id: \`${id}\` | type: RICH_TEXT | isAiInput: ${isAiInput}`)
      const text = xmlFragmentToText(content)
      if (text) lines.push('\n' + text)
      return lines.join('\n')
    },
    onPython: (b:YBlock) => {
      const {
        id,
        title,
        source,
        result,
        isResultHidden,
        isCodeHidden,
        lastQuery,
        lastQueryTime,
        startQueryTime,
        isEditWithAIPromptOpen,
        editWithAIPrompt,
        aiSuggestions,
        componentId,
        isAiInput,
      } = getPythonAttributes(b)
      const lines: string[] = []
      lines.push(`## ${title || '(untitled python block)'}`)
      lines.push(
        `> id: \`${id}\` | type: PYTHON | isAiInput: ${isAiInput} | isCodeHidden: ${isCodeHidden} | isResultHidden: ${isResultHidden}`
      )
      if (componentId) lines.push(`> componentId: \`${componentId}\``)
      if (lastQueryTime) lines.push(`> lastRun: ${lastQueryTime} | startedAt: ${startQueryTime}`)

      const src = source.toString()
      if (src) lines.push(`\n\`\`\`python\n${src}\n\`\`\``)

      if (lastQuery && lastQuery !== src) {
        lines.push(`\n**Last executed source:**\n\`\`\`python\n${lastQuery}\n\`\`\``)
      }

      if (isEditWithAIPromptOpen) {
        const prompt = editWithAIPrompt.toString()
        if (prompt) lines.push(`\n**AI Prompt:** ${prompt}`)
      }

      if (aiSuggestions) {
        const suggestions = aiSuggestions.toString()
        if (suggestions) lines.push(`\n**AI Suggestions:**\n\`\`\`python\n${suggestions}\n\`\`\``)
      }

      if (result.length) {
        const errors = result.filter((o) => o.type === 'error')
        const stdouts = result.filter((o) => o.type === 'stream')
        const displays = result.filter((o) => o.type === 'display_data' || o.type === 'execute_result')

        if (errors.length) {
          const msg = errors
            .map((e) => (e.type === 'error' ? `${e.ename}: ${e.evalue}\n${e.traceback?.join('\n') ?? ''}` : ''))
            .join('\n')
          lines.push(`\n**Error:**\n\`\`\`\n${msg}\n\`\`\``)
        }
        if (stdouts.length) {
          const out = stdouts.map((o) => (o.type === 'stream' ? o.text : '')).join('')
          if (out) lines.push(`\n**Output:**\n\`\`\`\n${out}\n\`\`\``)
        }
        if (displays.length) {
          lines.push(`\n**Display outputs:** ${displays.length} item(s)`)
        }
      }

      return lines.join('\n')
    },

    onSQL: (b:YBlock) => {
      const {
        id,
        title,
        source,
        dataframeName,
        dataSourceId,
        isFileDataSource,
        result,
        lastQuery,
        lastQueryTime,
        startQueryTime,
        isCodeHidden,
        isResultHidden,
        isEditWithAIPromptOpen,
        editWithAIPrompt,
        aiSuggestions,
        componentId,
        configuration,
        sort,
        isAiInput,
      } = getSQLAttributes(b, blocks)
      const lines: string[] = []
      lines.push(`## ${title || '(untitled sql block)'}`)
      lines.push(
        `> id: \`${id}\` | type: SQL | isAiInput: ${isAiInput} | isCodeHidden: ${isCodeHidden} | isResultHidden: ${isResultHidden}`
      )
      lines.push(
        `> dataframe: \`${dataframeName.value}\` | dataSourceId: ${dataSourceId ?? 'none'} | isFileDataSource: ${isFileDataSource}`
      )
      if (componentId) lines.push(`> componentId: \`${componentId}\``)
      if (lastQueryTime) lines.push(`> lastRun: ${lastQueryTime} | startedAt: ${startQueryTime}`)
      if (configuration) {
        lines.push(`> configuration: \`${JSON.stringify(configuration)}\``)
      }
      if (sort) {
        lines.push(`> sort: column=\`${sort.column?.name}\` direction=\`${sort.direction}\``)
      }

      const src = source.toString()
      if (src) lines.push(`\n\`\`\`sql\n${src}\n\`\`\``)

      if (lastQuery && lastQuery !== src) {
        lines.push(`\n**Last executed source:**\n\`\`\`sql\n${lastQuery}\n\`\`\``)
      }

      if (isEditWithAIPromptOpen) {
        const prompt = editWithAIPrompt.toString()
        if (prompt) lines.push(`\n**AI Prompt:** ${prompt}`)
      }

      if (aiSuggestions) {
        const suggestions = aiSuggestions.toString()
        if (suggestions) lines.push(`\n**AI Suggestions:**\n\`\`\`sql\n${suggestions}\n\`\`\``)
      }

      if (result) {
        switch (result.type) {
          case 'success':
            lines.push(`\n**Result:** ${result.rows.length} rows | columns: ${result.columns.map((c) => c.name).join(', ')}`)
            break
          case 'syntax-error':
          case 'abort-error':
            lines.push(`\n**Error:** ${result.message}`)
            break
          case 'python-error':
            lines.push(`\n**Error:** ${result.ename}: ${result.evalue}`)
            break
        }
      }

      return lines.join('\n')
    },

    // ── Visualization (legacy) ─────────────────────────────────────────────
    onVisualization: () => '',

    // ── Visualization V2 ──────────────────────────────────────────────────
    onVisualizationV2: (b:YBlock) => {
      const {
        id,
        title,
        input,
        output,
        controlsHidden,
        error,
        isAiInput,
      } = getVisualizationV2Attributes(b)
      const lines: string[] = []
      lines.push(`## ${title || '(untitled visualization)'}`)
      lines.push(
        `> id: \`${id}\` | type: VISUALIZATION_V2 | isAiInput: ${isAiInput} | controlsHidden: ${controlsHidden}`
      )
      if (error) lines.push(`> error: ${error}`)
      lines.push(`> chartType: ${input.chartType} | dataframe: \`${input.dataframeName ?? 'none'}\``)
      if (input.xAxis) {
        lines.push(`> xAxis: \`${input.xAxis.name}\` | sort: ${input.xAxisSort} | groupFunction: ${input.xAxisGroupFunction ?? 'none'}`)
      }
      if (input.yAxes.length) {
        const seriesSummary = input.yAxes
          .flatMap((y) => y.series)
          .map((s) => `${s.column?.name ?? '?'} (${s.aggregateFunction})`)
          .join(', ')
        lines.push(`> yAxes series: ${seriesSummary}`)
      }
      if (input.filters.length) {
        lines.push(`> filters: ${input.filters.map((f) => `${f.column.name} ${f.operator} ${f.value}`).join(', ')}`)
      }
      if (output) {
        lines.push(`> lastExecuted: ${output.executedAt} | tooManyDataPoints: ${output.tooManyDataPoints}`)
      }
      return lines.join('\n')
    },

    // ── Text Input ────────────────────────────────────────────────────────
    onInput: (b:YBlock) => {
      const {
        id,
        title,
        label,
        variable,
        value,
        inputType,
        executedAt,
        isAiInput,
      } = getInputAttributes(b, blocks)
      const lines: string[] = []
      lines.push(`## ${title || label || '(untitled input)'}`)
      lines.push(
        `> id: \`${id}\` | type: INPUT | isAiInput: ${isAiInput} | inputType: ${inputType}`
      )
      lines.push(`> label: ${label} | variable: \`${variable.value}\` (pending: \`${variable.newValue}\`)`)
      if (variable.error) lines.push(`> variableError: ${variable.error}`)
      lines.push(`> value: \`${value.value || '(empty)'}\` (pending: \`${value.newValue || '(empty)'}\`)`)
      if (value.error) lines.push(`> valueError: ${value.error}`)
      if (executedAt) lines.push(`> executedAt: ${executedAt}`)
      return lines.join('\n')
    },

    // ── Dropdown Input ────────────────────────────────────────────────────
    onDropdownInput: (b:YBlock) => {
      const {
        id,
        title,
        label,
        variable,
        value,
        options,
        dropdownType,
        dataframeName,
        columnName,
        configOpen,
        executedAt,
        isAiInput,
      } = getDropdownInputAttributes(b, blocks)
      const lines: string[] = []
      lines.push(`## ${title || label || '(untitled dropdown)'}`)
      lines.push(
        `> id: \`${id}\` | type: DROPDOWN_INPUT | isAiInput: ${isAiInput} | dropdownType: ${dropdownType} | configOpen: ${configOpen}`
      )
      lines.push(`> label: ${label} | variable: \`${variable.value}\` (pending: \`${variable.newValue}\`)`)
      if (variable.error) lines.push(`> variableError: ${variable.error}`)
      lines.push(`> value: \`${value.value ?? '(none)'}\` (pending: \`${value.newValue ?? '(none)'}\`)`)
      if (value.error) lines.push(`> valueError: ${value.error}`)
      if (dropdownType === 'static' && options.length) {
        lines.push(`> options: ${options.map((o) => `\`${o}\``).join(', ')}`)
      }
      if (dropdownType === 'dynamic') {
        lines.push(`> dataframe: \`${dataframeName ?? 'none'}\` | column: \`${columnName ?? 'none'}\``)
      }
      if (executedAt) lines.push(`> executedAt: ${executedAt}`)
      return lines.join('\n')
    },

    // ── Date Input ────────────────────────────────────────────────────────
    onDateInput: (b:YBlock) => {
      const {
        id,
        title,
        label,
        variable,
        value,
        dateType,
        newValue,
        newVariable,
        configOpen,
        executedAt,
        error,
        isAiInput,
      } = getDateInputAttributes(b, blocks)
      const lines: string[] = []
      lines.push(`## ${title || label.toString() || '(untitled date input)'}`)
      lines.push(
        `> id: \`${id}\` | type: DATE_INPUT | isAiInput: ${isAiInput} | dateType: ${dateType} | configOpen: ${configOpen}`
      )
      lines.push(`> label: ${label.toString()} | variable: \`${variable}\` (pending: \`${newVariable.toString()}\`)`)
      lines.push(
        `> value: ${value.year}/${String(value.month).padStart(2, '0')}/${String(value.day).padStart(2, '0')} ${String(value.hours).padStart(2, '0')}:${String(value.minutes).padStart(2, '0')}:${String(value.seconds).padStart(2, '0')} ${value.timezone}`
      )
      lines.push(`> pendingValue: ${newValue.toString()}`)
      if (error) lines.push(`> error: ${error}`)
      if (executedAt) lines.push(`> executedAt: ${executedAt}`)
      return lines.join('\n')
    },

    // ── File Upload ───────────────────────────────────────────────────────
    onFileUpload: (b:YBlock) => {
      const { id, title, uploadedFiles, areFilesHidden, isAiInput } = getFileUploadAttributes(b)
      const lines: string[] = []
      lines.push(`## ${title || '(untitled file upload)'}`)
      lines.push(
        `> id: \`${id}\` | type: FILE_UPLOAD | isAiInput: ${isAiInput} | areFilesHidden: ${areFilesHidden}`
      )
      if (uploadedFiles.length) {
        lines.push('\n**Uploaded files:**')
        for (const f of uploadedFiles) {
          lines.push(`- \`${f.name}\` | size: ${f.size} bytes | type: ${f.type} | status: ${f.status}${f.error ? ` | error: ${f.error}` : ''}`)
        }
      } else {
        lines.push('> (no files uploaded)')
      }
      return lines.join('\n')
    },

    // ── Dashboard Header ──────────────────────────────────────────────────
    onDashboardHeader: (b) => {
      const id = b.getAttribute('id') ?? ''
      const title = b.getAttribute('title') ?? ''
      const content = b.getAttribute('content') ?? ''
      const isAiInput = b.getAttribute('isAiInput') ?? false
      const lines: string[] = []
      lines.push(`## ${title || '(untitled dashboard header)'}`)
      lines.push(`> id: \`${id}\` | type: DASHBOARD_HEADER | isAiInput: ${isAiInput}`)
      if (content) lines.push('\n' + content)
      return lines.join('\n')
    },

    // ── Pivot Table ───────────────────────────────────────────────────────
    onPivotTable: (b:YBlock) => {
      const {
        id,
        title,
        dataframeName,
        variable,
        rows,
        columns,
        metrics,
        sort,
        controlsHidden,
        error,
        updatedAt,
        page,
        isAiInput,
      } = getPivotTableAttributes(b, blocks)
      const lines: string[] = []
      lines.push(`## ${title || '(untitled pivot table)'}`)
      lines.push(
        `> id: \`${id}\` | type: PIVOT_TABLE | isAiInput: ${isAiInput} | controlsHidden: ${controlsHidden} | page: ${page}`
      )
      lines.push(`> dataframe: \`${dataframeName ?? 'none'}\` | variable: \`${variable.value}\``)
      if (variable.error) lines.push(`> variableError: ${variable.error}`)
      if (error) lines.push(`> error: ${error}`)
      if (updatedAt) lines.push(`> updatedAt: ${updatedAt}`)
      if (rows.length) lines.push(`> rows: ${rows.map((r) => r.column?.name ?? '?').join(', ')}`)
      if (columns.length) lines.push(`> columns: ${columns.map((c) => c.column?.name ?? '?').join(', ')}`)
      if (metrics.length) lines.push(`> metrics: ${metrics.map((m) => `${m.column?.name ?? '?'} (${m.aggregateFunction})`).join(', ')}`)
      if (sort) lines.push(`> sort: column=\`${sort.column}\` direction=\`${sort.direction}\``)
      return lines.join('\n')
    },

    // ── Power Toolbox ─────────────────────────────────────────────────────
    onPowerToolbox: (b:YBlock) => {
      const {
        id,
        title,
        toolId,
        toolLabel,
        toolCategory,
        inputs,
        lastExecutedInputs,
        generatedSource,
        result,
        startedAt,
        executedAt,
        isAiInput,
      } = getPowerToolboxAttributes(b)
      const lines: string[] = []
      lines.push(`## ${title || toolLabel || '(untitled power toolbox)'}`)
      lines.push(
        `> id: \`${id}\` | type: POWER_TOOLBOX | isAiInput: ${isAiInput}`
      )
      if (toolId) lines.push(`> tool: \`${toolId}\` | category: ${toolCategory ?? 'none'} | label: ${toolLabel ?? 'none'}`)
      if (startedAt) lines.push(`> startedAt: ${startedAt} | executedAt: ${executedAt}`)

      const isDirty = JSON.stringify(inputs) !== JSON.stringify(lastExecutedInputs)
      lines.push(`> dirty: ${isDirty}`)

      if (Object.keys(inputs).length) {
        lines.push('\n**Inputs:**')
        for (const [k, v] of Object.entries(inputs)) {
          lines.push(`- \`${k}\`: ${JSON.stringify(v)}`)
        }
      }

      if (lastExecutedInputs && Object.keys(lastExecutedInputs).length) {
        lines.push('\n**Last executed inputs:**')
        for (const [k, v] of Object.entries(lastExecutedInputs)) {
          lines.push(`- \`${k}\`: ${JSON.stringify(v)}`)
        }
      }

      if (generatedSource) {
        lines.push(`\n\`\`\`python\n${generatedSource}\n\`\`\``)
      }

      if (result.length) {
        const errors = result.filter((o) => o.type === 'error')
        const stdouts = result.filter((o) => o.type === 'stream')
        if (errors.length) {
          const msg = errors
            .map((e) => (e.type === 'error' ? `${e.ename}: ${e.evalue}` : ''))
            .join('\n')
          lines.push(`\n**Error:**\n\`\`\`\n${msg}\n\`\`\``)
        }
        if (stdouts.length) {
          const out = stdouts.map((o) => (o.type === 'stream' ? o.text : '')).join('')
          if (out) lines.push(`\n**Output:**\n\`\`\`\n${out}\n\`\`\``)
        }
      }

      return lines.join('\n')
    },
  })
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function docToMd(doc: Y.Doc): string {
  const blocks = getBlocks(doc)
  const layout = getLayout(doc)
  const sections: string[] = []
  const titleEl = doc.getXmlElement('metadata')
  const title = (titleEl?.getAttribute as any)?.('title') ?? ''
  if (title) sections.push(`# ${title}\n`)

  for (const blockGroup of layout) {
    const tabs = getTabsFromBlockGroup(blockGroup as YBlockGroup, blocks)
    for (const tab of tabs) {
      const block = blocks.get(tab.blockId)
      if (!block) continue
      const md = blockToMd(block, blocks).trim()
      if (md) sections.push(md)
    }
  }

  return sections.join('\n\n---\n\n')
}