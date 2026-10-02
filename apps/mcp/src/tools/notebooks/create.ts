import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { errorResult, jsonResult, workspaceId } from '../shared.ts';

// How long to wait for the AI to finish building the notebook before returning
// what exists so far (generation keeps going server side).
const GENERATION_TIMEOUT_MS = 4 * 60 * 1000;
const MAX_REPLY_CHARS = 4000;

type BlockEvent = { action: string; blockId: string; blockType: string; blockTitle: string };

// Reads the chat's SSE stream to the end, collecting the assistant's text and
// which blocks it created, edited or ran.
async function runChatStream(ctx: ToolContext, chatId: string, messageId: string) {
  const res = await fetch(`${ctx.apiUrl}/api/chat/${chatId}/${messageId}/stream`, {
    method: 'POST',
    headers: {
      Cookie: `access_token=${ctx.auth.token}`,
      Accept: 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(GENERATION_TIMEOUT_MS),
  });
  if (!res.ok || !res.body) throw new Error(`AI stream failed (${res.status})`);

  let text = '';
  let error: string | null = null;
  let finished = false;
  const blocks = new Map<string, BlockEvent>();

  const handle = (data: string) => {
    const trimmed = data.trimEnd();
    if (trimmed === '[DONE]') return (finished = true);
    if (trimmed === '[ERROR]') return (finished = true), (error ??= 'AI run failed');
    let ev: any;
    try {
      ev = JSON.parse(trimmed);
    } catch {
      return;
    }
    if (ev.type === 'error') error = ev.error?.message ?? 'AI run failed';
    if (ev.type === 'content_block_start' && ev.content_block?.type === 'block_action') {
      const b = ev.content_block;
      blocks.set(b.block_id, {
        action: 'generating',
        blockId: b.block_id ?? '',
        blockType: b.block_type ?? '',
        blockTitle: b.block_title ?? '',
      });
    }
    if (ev.type === 'content_block_delta') {
      const d = ev.delta;
      if (d?.type === 'text_delta') text += d.text ?? '';
      if (d?.type === 'block_action_delta') {
        blocks.set(d.block_id, {
          action: d.action ?? 'ran',
          blockId: d.block_id ?? '',
          blockType: d.block_type ?? '',
          blockTitle: d.block_title ?? '',
        });
      }
    }
  };

  try {
    const decoder = new TextDecoder();
    let buffer = '';
    for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) if (line.startsWith('data: ')) handle(line.slice(6));
      if (finished) break;
    }
  } catch (err) {
    if (!(err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError'))) throw err;
  }

  return { text: text.trim(), error, finished, blocks: [...blocks.values()] };
}

export function registerCreateNotebookTool(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'create_notebook',
    {
      description:
        'Create a new notebook in a workspace. When a prompt is given, Sandworm\'s AI builds the notebook from it (SQL, Python and Markdown cells, charts) and this returns the notebook link, what was generated and the AI\'s reply. May take a few minutes',
      inputSchema: {
        workspaceId,
        title: z.string().min(1),
        prompt: z.string().max(2000).optional().describe('What the notebook should answer'),
      },
    },
    async ({ workspaceId, title, prompt }) => {
      try {
        const resolved = await resolveWorkspaceId(ctx, workspaceId);

        const created = await graphql<{ createDocument: { id: string; title: string } }>(
          ctx,
          `mutation ($workspaceId: String!, $input: CreateDocumentInput!) {
            createDocument(workspaceId: $workspaceId, input: $input) { id title }
          }`,
          { workspaceId: resolved, input: { title, version: 2, orderIndex: 0 } },
        );
        const notebookId = created.createDocument.id;
        const base = `${ctx.webUrl}/workspace/${resolved}/documents/${notebookId}`;
        const result: Record<string, unknown> = {
          notebookId,
          workspaceId: resolved,
          title: created.createDocument.title,
          url: `${base}/notebook/edit`,
        };
        if (!prompt) return jsonResult(result);

        // Everything below is best effort: the notebook already exists, so a
        // failure here is reported next to its link instead of failing the call.
        try {
          const ws = await graphql<{ getUserWorkspaces: { id: string; assistantModel: string }[] }>(
            ctx,
            `query { getUserWorkspaces { id assistantModel } }`,
          );
          const model = ws.getUserWorkspaces.find(w => w.id === resolved)?.assistantModel;
          if (!model) throw new Error('Workspace has no assistant model configured');

          const chat = await graphql<{ createChat: { id: string } }>(
            ctx,
            `mutation ($input: CreateChatInput!) { createChat(input: $input) { id } }`,
            { input: { workspaceId: resolved, documentId: notebookId, message: prompt, model, title } },
          );
          const chatId = chat.createChat.id;
          const msgs = await graphql<{ chatMessages: { id: string }[] }>(
            ctx,
            `query ($chatId: String!) { chatMessages(chatId: $chatId) { id } }`,
            { chatId },
          );
          const first = msgs.chatMessages[0];
          if (!first) throw new Error('Chat has no messages');

          const run = await runChatStream(ctx, chatId, first.id);
          Object.assign(result, {
            prompt,
            model,
            chatId,
            chatUrl: `${base}/notebook/edit?panel=ai`,
            status: run.error ? 'error' : run.finished ? 'done' : 'still_generating',
            blocks: run.blocks,
            reply: run.text.slice(0, MAX_REPLY_CHARS),
            ...(run.error ? { error: run.error } : {}),
          });
        } catch (err) {
          result.status = 'error';
          result.error = `Notebook created, but the AI run failed: ${err instanceof Error ? err.message : String(err)}`;
        }
        return jsonResult(result);
      } catch (err) {
        return errorResult(err);
      }
    },
  );
}
