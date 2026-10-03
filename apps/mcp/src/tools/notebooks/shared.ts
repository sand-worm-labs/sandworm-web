import { z } from 'zod';

import type { ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';

// The API validates these as UUIDs and answers anything else with a bare 422.
export const notebookId = z.uuid().describe('ID (UUID) of the notebook, as returned by list_projects or create_notebook');

// The server never sees the conversation, so the prompt reaches the notebook's
// chat only if the agent passes it along (see ../call-display.ts).
export const request = z
  .string()
  .min(1)
  .max(4000)
  .describe('The user\'s message that led to this work, word for word. It is saved as their message in the notebook\'s chat');

// On the tools an agent starts a follow-up with. The chat cannot tell one user
// message from the next unless a call carries it, and plan_notebook, which
// requires it, is not called for a small change.
export const turnRequest = request
  .optional()
  .describe('The user\'s message that led to this call, word for word. Pass it on the first call you make for each new message from the user, so their message is saved in the notebook\'s chat ahead of the work');

export const notebookUrl = (ctx: ToolContext, workspaceId: string, id: string) =>
  `${ctx.webUrl}/workspace/${workspaceId}/documents/${id}/notebook/edit`;

export const notebookApiPath = (workspaceId: string, id: string) => `/workspaces/${workspaceId}/documents/${id}`;

// The editor shows the title from the collaborative document, not the database row.
export const setNotebookTitle = (ctx: ToolContext, workspaceId: string, id: string, title: string) =>
  rest(ctx, 'PUT', `${notebookApiPath(workspaceId, id)}/title`, { title });

// Some clients send object and array arguments as a JSON string.
export const objectOrJson = <T extends z.ZodType>(schema: T) =>
  z.union([
    schema,
    z
      .string()
      .transform((text, ctx) => {
        try {
          return JSON.parse(text) as unknown;
        } catch {
          ctx.issues.push({ code: 'custom', message: 'Expected a value or its JSON string', input: text });
          return z.NEVER;
        }
      })
      .pipe(schema),
  ]);
