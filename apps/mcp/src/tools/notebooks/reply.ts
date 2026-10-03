import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import type { ToolContext } from '../../graphql.ts';
import { handle } from '../shared.ts';
import { notebookId, request } from './shared.ts';

// Keep in step with McpDisplayDto.text in apps/api (chat/dto/mcp-tool-calls.dto.ts):
// a reply longer than either limit is rejected and never reaches the chat.
const MAX_REPLY_CHARS = 20_000;

export const SAVE_REPLY_INSTRUCTIONS =
  'Every tool call is saved to the notebook\'s chat in Sandworm. Pass the user\'s message as `request` on the first tool call you make for each new message from them, and wherever a tool requires it. Every time you finish working on a notebook, after a follow-up too, call save_reply with the closing message you are about to give the user, before you give it.';

// The server never sees what the agent tells the user, so the agent hands its
// closing message over here. The tool does nothing itself: the call log
// (../call-log.ts) saves it like any other call.
export function registerReplyTool(server: McpServer, _ctx: ToolContext): void {
  server.registerTool(
    'save_reply',
    {
      description:
        'Save your closing message to the notebook\'s chat, so the session can be reviewed later in Sandworm. Call it once, last, after the notebook work is done and before you answer the user. It changes nothing in the notebook.',
      inputSchema: {
        notebookId,
        message: z
          .string()
          .min(1)
          .max(MAX_REPLY_CHARS)
          .describe('The closing message you are giving the user, in full: what was built, what it shows, any caveats. Markdown'),
        request,
      },
    },
    handle(async ({ notebookId }) => ({ notebookId, saved: true })),
  );
}
