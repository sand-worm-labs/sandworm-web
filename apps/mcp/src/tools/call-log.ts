import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { ClientInfo } from '../client.ts';
import type { ToolContext } from '../graphql.ts';
import { rest } from '../rest.ts';
import { describeCall, parseResult, promptOf, type Display, type Prompt } from './call-display.ts';

export type ToolCall = {
  toolName: string;
  arguments: Record<string, unknown>;
  result: string;
  isError: boolean;
  durationMs: number;
  at: string;
  requestId?: string;
  display: Display[];
};

type Held = { calls: ToolCall[]; prompt?: Prompt };
export type Session = Held & { client?: ClientInfo };
export type Recorder = (notebookId: string, session: Session) => void;

// `value` covers set_env_vars, whose variables are { name, value } pairs.
const SENSITIVE_KEY = /pass(word)?|secret|token|api[-_]?key|authorization|cookie|credential|private[-_]?key|^value$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_RESULT_CHARS = 20_000;
const MAX_PENDING = 20;
const PENDING_TTL_MS = 15 * 60 * 1000;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, SENSITIVE_KEY.test(k) ? '[redacted]' : redact(v)]),
  );
}

const uuid = (value: unknown) => (typeof value === 'string' && UUID.test(value) ? value : undefined);
const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

type ToolResult = { isError?: boolean; content?: { type: string; text?: string }[] };

const resultText = (result: ToolResult) => (result.content ?? []).map(part => part.text ?? `[${part.type}]`).join('\n');

// A chat belongs to a notebook, so calls made before one is known
// (plan_notebook, list_workspaces) wait here, per user, and are saved with
// that user's next call that names a notebook. Best effort: held in this
// process only, and dropped after PENDING_TTL_MS.
export type PendingCalls = Map<string, Held>;
const sharedPending: PendingCalls = new Map();

function takePending(pending: PendingCalls, userId: string): Held {
  const held = pending.get(userId);
  pending.delete(userId);
  const cutoff = Date.now() - PENDING_TTL_MS;
  const calls = (held?.calls ?? []).filter(call => Date.parse(call.at) >= cutoff);
  return { calls, prompt: calls.length ? held?.prompt : undefined };
}

export type CallLogOptions = {
  userId: string;
  record: Recorder;
  client?: ClientInfo;
  pending?: PendingCalls;
};

// Wraps every tool registered after this call, so call it before the tools are registered.
export function logToolCalls(
  server: McpServer,
  { userId, record, client, pending = sharedPending }: CallLogOptions,
): void {
  const register = server.registerTool.bind(server) as (...args: unknown[]) => unknown;

  server.registerTool = ((name: string, config: unknown, handler: (...params: unknown[]) => unknown) =>
    register(name, config, async (...params: unknown[]) => {
      // Handlers get (args, extra), or just (extra) when the tool has no input schema.
      const args = (params.length > 1 ? params[0] : {}) as Record<string, unknown>;
      const extra = params.at(-1) as { requestId?: string | number } | undefined;
      const started = Date.now();

      const save = (text: string, isError: boolean) => {
        const call: ToolCall = {
          toolName: name,
          arguments: redact(args) as Record<string, unknown>,
          result: text.slice(0, MAX_RESULT_CHARS),
          isError,
          durationMs: Date.now() - started,
          at: new Date(started).toISOString(),
          requestId: extra?.requestId === undefined ? undefined : String(extra.requestId),
          display: describeCall(name, args, text, isError),
        };
        const held = takePending(pending, userId);
        const calls = [...held.calls, call];
        const prompt = held.prompt ?? promptOf(name, args);
        // create_notebook and fork_notebook take no notebookId but return one.
        const notebookId = uuid(args.notebookId) ?? uuid(parseResult(text).notebookId);

        if (notebookId) record(notebookId, { calls, prompt, client });
        else pending.set(userId, { calls: calls.slice(-MAX_PENDING), prompt });
      };

      // Logging must never break the tool call it describes.
      const saveSafely = (text: string, isError: boolean) => {
        try {
          save(text, isError);
        } catch (err) {
          console.error('Tool call log failed', err);
        }
      };

      try {
        const result = (await handler(...params)) as ToolResult;
        saveSafely(resultText(result), result.isError === true);
        return result;
      } catch (err) {
        saveSafely(errorMessage(err), true);
        throw err;
      }
    })) as typeof server.registerTool;
}

// Fire and forget: the agent gets its answer without waiting on the write.
export const apiRecorder =
  (ctx: ToolContext): Recorder =>
  (notebookId, session) => {
    rest(ctx, 'POST', '/chat/mcp/tool-calls', { documentId: notebookId, ...session }).catch(err =>
      console.error(`Tool call log failed for notebook ${notebookId}: ${errorMessage(err)}`),
    );
  };
