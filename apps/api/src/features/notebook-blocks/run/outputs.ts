import type { Json, Output, RunQueryResult } from '@sandworm/types';

// Run results are read by an agent with a limited context window, so every
// piece of cell output is capped. The full output stays in the notebook.
export const LIMITS = {
  textChars: 4_000,
  tracebackChars: 4_000,
  outputsPerCell: 20,
  tableRows: 10,
  tableCellChars: 200,
} as const;

export type CellError = { name?: string; message: string; traceback?: string };

type TextOutput = { type: 'stdout' | 'stderr' | 'html' | 'markdown'; text: string; truncated?: true };
type ChartOutput = { type: 'chart'; title?: string; traces: { type?: string; name?: string }[] };
// Image bytes are never returned, only the fact that the cell drew one.
type ImageOutput = { type: 'image'; format: string };

export type CellOutput = TextOutput | ChartOutput | ImageOutput;

export type TableResult = {
  rowCount: number;
  columns: { name: string; type: string }[];
  // The first rows only; rowCount is the size of the full result.
  rows: Record<string, Json>[];
  durationMs?: number;
};

type Clipped = { text: string; truncated?: true };

// Keeps the start, where a table header or the first lines of a log are.
export function clipStart(text: string, max: number): Clipped {
  if (text.length <= max) return { text };
  return { text: `${text.slice(0, max)}\n… (${text.length - max} more characters)`, truncated: true };
}

// Keeps the end, where a traceback names the error and the failing line.
export function clipEnd(text: string, max: number): Clipped {
  if (text.length <= max) return { text };
  return { text: `… (${text.length - max} earlier characters)\n${text.slice(-max)}`, truncated: true };
}

// Jupyter tracebacks are coloured for a terminal.
// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;]*[A-Za-z]/g;
export const stripAnsi = (text: string) => text.replace(ANSI, '');

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

// Enough to read a rendered dataframe or a styled card as text: rows become
// lines and cells are separated, everything else is dropped. Line breaks in
// the markup itself mean nothing, so they go first.
export function htmlToText(html: string): string {
  return html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/<\/(tr|p|div|h[1-6]|li)>|<br\s*\/?>/gi, '\n')
    .replace(/<\/t[dh]>/gi, ' | ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name] ?? '')
    .split('\n')
    .map(line => line.replace(/ +/g, ' ').replace(/ \| $/, '').trim())
    .filter(Boolean)
    .join('\n');
}

function chartOutput(output: Extract<Output, { type: 'plotly' }>): ChartOutput {
  const title = output.layout?.title;
  const text = typeof title === 'string' ? title : title?.text;
  const traces = Array.isArray(output.data) ? output.data : [];
  return {
    type: 'chart',
    ...(typeof text === 'string' && text ? { title: text } : {}),
    traces: traces.slice(0, LIMITS.outputsPerCell).map((trace: { type?: unknown; name?: unknown }) => ({
      ...(typeof trace?.type === 'string' ? { type: trace.type } : {}),
      ...(typeof trace?.name === 'string' ? { name: trace.name } : {}),
    })),
  };
}

// Splits what a Python cell produced into its error (if any) and the rest.
// Consecutive writes to the same stream arrive as separate outputs and are
// joined back together.
export function describeOutputs(result: Output[]): { error?: CellError; outputs: CellOutput[]; omitted: number } {
  let error: CellError | undefined;
  const merged: CellOutput[] = [];

  for (const output of result) {
    switch (output.type) {
      case 'error':
        error ??= {
          name: output.ename,
          message: clipStart(output.evalue, LIMITS.textChars).text,
          traceback: clipEnd(stripAnsi(output.traceback.join('\n')), LIMITS.tracebackChars).text,
        };
        break;
      case 'stdio': {
        const last = merged[merged.length - 1];
        if (last && last.type === output.name) last.text += output.text;
        else merged.push({ type: output.name, text: output.text });
        break;
      }
      case 'html': {
        // Chart libraries emit markup with no text of its own alongside the chart.
        const text = htmlToText(output.html);
        if (text) merged.push({ type: 'html', text });
        break;
      }
      case 'markdown':
        merged.push({ type: 'markdown', text: output.text });
        break;
      case 'plotly':
        merged.push(chartOutput(output));
        break;
      case 'image':
        merged.push({ type: 'image', format: output.format });
        break;
    }
  }

  const outputs = merged
    .slice(0, LIMITS.outputsPerCell)
    .map(output => ('text' in output ? { ...output, ...clipStart(output.text, LIMITS.textChars) } : output));
  return { error, outputs, omitted: merged.length - outputs.length };
}

const clipCell = (value: Json): Json =>
  typeof value === 'string' && value.length > LIMITS.tableCellChars
    ? `${value.slice(0, LIMITS.tableCellChars)}…`
    : value !== null && typeof value === 'object'
      ? clipStart(JSON.stringify(value), LIMITS.tableCellChars).text
      : value;

export function describeQueryResult(result: RunQueryResult | null): { error?: CellError; table?: TableResult } {
  if (!result) return {};

  switch (result.type) {
    case 'success': {
      const durationMs = 'queryDurationMs' in result ? result.queryDurationMs : 'durationMs' in result ? result.durationMs : undefined;
      return {
        table: {
          rowCount: result.count,
          columns: result.columns.map(column => ({ name: String(column.name), type: column.type })),
          rows: result.rows
            .slice(0, LIMITS.tableRows)
            .map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, clipCell(value)]))),
          ...(durationMs === undefined ? {} : { durationMs }),
        },
      };
    }
    case 'syntax-error':
    case 'abort-error':
      return { error: { message: clipStart(result.message, LIMITS.textChars).text } };
    case 'python-error':
      return {
        error: {
          name: result.ename,
          message: clipStart(result.evalue, LIMITS.textChars).text,
          ...(result.traceback.length
            ? { traceback: clipEnd(stripAnsi(result.traceback.join('\n')), LIMITS.tracebackChars).text }
            : {}),
        },
      };
  }
}
