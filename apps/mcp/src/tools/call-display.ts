// How a tool call is shown in the notebook's chat. The API turns these into
// the stream events the AI sidecar emits, so an MCP session reads like an AI turn.
export type Display =
  | { kind: 'thinking'; text: string }
  | {
      kind: 'block';
      action: 'created' | 'edited' | 'ran' | 'deleted';
      blockId: string;
      blockType: string;
      blockTitle: string;
      executedAt?: string;
    }
  | { kind: 'text'; text: string };

// `afterWork`: the prompt arrived with the closing reply, after the work it asked for.
export type Prompt = { text: string; afterWork: boolean };

type Cell = { id?: string; kind?: string; title?: string; state?: string; executedAt?: string; error?: unknown };
type Args = Record<string, unknown>;
type Result = Record<string, unknown>;

const MAX_TITLE = 60;
const MAX_ERROR = 300;

const str = (value: unknown) => (typeof value === 'string' ? value : '');
const firstLine = (text: string) => text.split('\n').find(line => line.trim())?.trim() ?? '';
const lastLine = (text: string) => text.trim().split('\n').at(-1)?.trim() ?? '';
const step = (text: string): Display[] => [{ kind: 'thinking', text }];

export function parseResult(text: string): Result {
  try {
    const parsed = JSON.parse(text) as unknown;
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Result) : {};
  } catch {
    return {};
  }
}

// Markdown and rich text cells have no title: use their opening line.
const cellTitle = (cell: Cell, args: Args) =>
  cell.title || str(args.title) || firstLine(str(args.content)).replace(/^#+\s*/, '').slice(0, MAX_TITLE) || 'Untitled';

function changedCell(action: 'created' | 'edited', cell: Cell = {}, args: Args): Display[] {
  if (!cell.id) return [];
  return [{ kind: 'block', action, blockId: cell.id, blockType: cell.kind ?? str(args.type), blockTitle: cellTitle(cell, args) }];
}

function ranCells(cells: Cell[]): Display[] {
  return cells
    .filter(cell => cell.id && (cell.state === 'success' || cell.state === 'error'))
    .flatMap((cell): Display[] => {
      const title = cell.title || 'Untitled';
      const ran: Display = {
        kind: 'block',
        action: 'ran',
        blockId: cell.id!,
        blockType: cell.kind ?? '',
        blockTitle: title,
        executedAt: cell.executedAt,
      };
      if (cell.state !== 'error') return [ran];
      const error = typeof cell.error === 'string' ? cell.error : JSON.stringify(cell.error ?? '');
      return [ran, ...step(`${title} failed: ${lastLine(error).slice(0, MAX_ERROR)}`)];
    });
}

function blockRows(toolName: string, args: Args, result: Result): Display[] {
  switch (toolName) {
    case 'add_cell':
      return changedCell('created', result.cell as Cell, args);
    case 'update_cell':
      return changedCell('edited', result.cell as Cell, args);
    case 'delete_cell':
      return [{ kind: 'block', action: 'deleted', blockId: str(args.cellId), blockType: 'cell', blockTitle: str(args.cellId) }];
    case 'run_notebook':
    case 'get_run_results':
      return Array.isArray(result.cells) ? ranCells(result.cells as Cell[]) : [];
    default:
      return [];
  }
}

function planStep(args: Args): string {
  const blocks = Array.isArray(args.blocks) ? (args.blocks as { type?: string; title?: string }[]) : [];
  if (!blocks.length) return `Researching data for: ${str(args.goal)}`;
  // Same wording as the sidecar's planning step (apps/ai/src/services/pipeline/service.py).
  return `Planning ${blocks.length} block(s): ${blocks.map(b => `${b.type}: ${b.title}`).join(', ')}`;
}

// Calls that change no block still get one line, so the chat shows every step.
const STEPS: Record<string, (args: Args, result: Result) => string> = {
  plan_notebook: planStep,
  list_workspaces: () => 'Listed workspaces',
  list_projects: () => 'Listed notebooks',
  list_data_sources: () => 'Listed data sources',
  get_data_source_schema: args => `Read the ${str(args.dataSourceId) || 'data source'} schema`,
  search_notebooks: args => `Searched notebooks for: ${str(args.query)}`,
  search_tools: args => `Searched tools for: ${str(args.query)}`,
  get_notebook: () => 'Read the notebook',
  create_notebook: (args, result) => `Created notebook: ${str(result.title) || str(args.title)}`,
  edit_notebook: args => `Renamed the notebook to: ${str(args.title)}`,
  publish_notebook: (_, result) => `Published the notebook: ${str(result.publicUrl)}`,
  run_notebook: () => 'Started a run',
  get_run_results: () => 'Checked the run',
};

export function describeCall(toolName: string, args: Args, resultText: string, isError: boolean): Display[] {
  if (isError) return step(`\`${toolName}\` failed: ${firstLine(resultText).slice(0, MAX_ERROR)}`);
  // The reply is the message itself, like the text an AI turn ends with.
  if (toolName === 'save_reply') return [{ kind: 'text', text: str(args.message) }];

  const result = parseResult(resultText);
  const rows = blockRows(toolName, args, result);
  return rows.length ? rows : step(STEPS[toolName]?.(args, result) ?? `Called ${toolName}`);
}

export function promptOf(toolName: string, args: Args): Prompt | undefined {
  const text = str(args.request).trim();
  return text ? { text, afterWork: toolName === 'save_reply' } : undefined;
}
