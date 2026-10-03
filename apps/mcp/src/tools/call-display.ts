// What a tool call looks like in the notebook's chat. The API turns these into
// the stream events the AI sidecar emits for its own turns (a "Planning..."
// thinking step, then Created / Edited / Ran rows per block), so an MCP
// session reads like an AI turn. Every call shows something: one that changes
// no block gets a one-line step.
export type Display =
  | { kind: 'thinking'; text: string }
  | {
      kind: 'block';
      action: 'created' | 'edited' | 'ran' | 'deleted';
      blockId: string;
      blockType: string;
      blockTitle: string;
      // Of a run, so the same run reported twice is shown once.
      executedAt?: string;
    }
  // Closing message of the turn.
  | { kind: 'text'; text: string }
  // What the user asked, saved as their message in the chat.
  | { kind: 'prompt'; text: string; afterWork: boolean };

type Cell = { id?: string; kind?: string; title?: string; state?: string; executedAt?: string; error?: unknown };
type Args = Record<string, unknown>;

const MAX_TITLE = 60;
const firstLine = (text: string) => text.split('\n').find(line => line.trim())?.trim() ?? '';
const lastLine = (text: string) => text.trim().split('\n').at(-1)?.trim() ?? '';

// Markdown and rich text cells have no title: use their opening line.
function cellTitle(cell: Cell, args: Args): string {
  if (cell.title) return cell.title;
  if (typeof args.title === 'string' && args.title) return args.title;
  const content = typeof args.content === 'string' ? firstLine(args.content).replace(/^#+\s*/, '') : '';
  return content.slice(0, MAX_TITLE) || 'Untitled';
}

const block = (action: 'created' | 'edited', cell: Cell, args: Args): Display[] =>
  cell.id
    ? [{ kind: 'block', action, blockId: cell.id, blockType: cell.kind ?? String(args.type ?? ''), blockTitle: cellTitle(cell, args) }]
    : [];

function planDisplay(args: Args): Display[] {
  const blocks = Array.isArray(args.blocks) ? (args.blocks as { type?: string; title?: string }[]) : [];
  if (!blocks.length) return [{ kind: 'thinking', text: `Researching data for: ${String(args.goal ?? '')}` }];
  // Same wording as the sidecar's planning step (apps/ai/src/services/pipeline/service.py).
  const summary = blocks.map(b => `${b.type}: ${b.title}`).join(', ');
  return [{ kind: 'thinking', text: `Planning ${blocks.length} block(s): ${summary}` }];
}

function runDisplay(cells: Cell[]): Display[] {
  const ran = cells.filter(cell => cell.id && (cell.state === 'success' || cell.state === 'error'));
  return ran.flatMap((cell): Display[] => {
    const title = cell.title || 'Untitled';
    const row: Display = {
      kind: 'block',
      action: 'ran',
      blockId: cell.id!,
      blockType: cell.kind ?? '',
      blockTitle: title,
      executedAt: cell.executedAt,
    };
    if (cell.state !== 'error') return [row];
    const error = typeof cell.error === 'string' ? cell.error : JSON.stringify(cell.error ?? '');
    return [row, { kind: 'thinking', text: `${title} failed: ${lastLine(error).slice(0, 300)}` }];
  });
}

// One line per call that changes no block, so the chat shows every step.
const STEPS: Record<string, (args: Args, result: Record<string, unknown>) => string> = {
  list_workspaces: () => 'Listed workspaces',
  list_projects: () => 'Listed notebooks',
  list_data_sources: () => 'Listed data sources',
  get_data_source_schema: args => `Read the ${String(args.dataSourceId ?? 'data source')} schema`,
  search_notebooks: args => `Searched notebooks for: ${String(args.query ?? '')}`,
  search_tools: args => `Searched tools for: ${String(args.query ?? '')}`,
  get_notebook: () => 'Read the notebook',
  create_notebook: (args, result) => `Created notebook: ${String(result.title ?? args.title ?? '')}`,
  edit_notebook: args => `Renamed the notebook to: ${String(args.title ?? '')}`,
  publish_notebook: (_, result) => `Published the notebook: ${String(result.publicUrl ?? '')}`,
  run_notebook: () => 'Started a run',
  get_run_results: () => 'Checked the run',
};

function workDisplay(toolName: string, args: Args, resultText: string, isError: boolean): Display[] {
  if (isError) return [{ kind: 'thinking', text: `\`${toolName}\` failed: ${firstLine(resultText).slice(0, 300)}` }];
  if (toolName === 'plan_notebook') return planDisplay(args);
  // The reply is the message itself, like the text an AI turn ends with.
  if (toolName === 'save_reply') return typeof args.message === 'string' ? [{ kind: 'text', text: args.message }] : [];

  let result: Record<string, unknown> = {};
  try {
    const parsed = JSON.parse(resultText) as unknown;
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) result = parsed as Record<string, unknown>;
  } catch {
    // Not JSON: the step line below still says the call happened.
  }

  let rows: Display[] = [];
  if (toolName === 'add_cell') rows = block('created', (result.cell ?? {}) as Cell, args);
  if (toolName === 'update_cell') rows = block('edited', (result.cell ?? {}) as Cell, args);
  if (toolName === 'delete_cell' && typeof args.cellId === 'string') {
    rows = [{ kind: 'block', action: 'deleted', blockId: args.cellId, blockType: 'cell', blockTitle: args.cellId }];
  }
  if ((toolName === 'run_notebook' || toolName === 'get_run_results') && Array.isArray(result.cells)) {
    rows = runDisplay(result.cells as Cell[]);
  }
  if (rows.length) return rows;

  return [{ kind: 'thinking', text: STEPS[toolName]?.(args, result) ?? `Called ${toolName}` }];
}

export function describeCall(toolName: string, args: Args, resultText: string, isError: boolean): Display[] {
  const work = workDisplay(toolName, args, resultText, isError);
  if (typeof args.request !== 'string' || !args.request.trim()) return work;
  // save_reply comes last, so a prompt first seen there belongs before the work.
  const prompt: Display = { kind: 'prompt', text: args.request.trim(), afterWork: toolName === 'save_reply' };
  return [prompt, ...work];
}
