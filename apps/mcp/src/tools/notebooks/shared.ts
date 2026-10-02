import { z } from 'zod';

import type { ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';

// The API validates these as UUIDs and answers anything else with a bare 422.
export const notebookId = z.uuid().describe('ID (UUID) of the notebook, as returned by list_projects or create_notebook');

export const notebookUrl = (ctx: ToolContext, workspaceId: string, id: string) =>
  `${ctx.webUrl}/workspace/${workspaceId}/documents/${id}/notebook/edit`;

export const notebookApiPath = (workspaceId: string, id: string) => `/workspaces/${workspaceId}/documents/${id}`;

// The editor shows the title from the collaborative document, not the database row.
export const setNotebookTitle = (ctx: ToolContext, workspaceId: string, id: string, title: string) =>
  rest(ctx, 'PUT', `${notebookApiPath(workspaceId, id)}/title`, { title });

// Some clients send object arguments as a JSON string.
export const objectOrJson = <T extends z.ZodType>(schema: T) =>
  z.union([
    schema,
    z
      .string()
      .transform((text, ctx) => {
        try {
          return JSON.parse(text) as unknown;
        } catch {
          ctx.issues.push({ code: 'custom', message: 'Expected an object or a JSON object string', input: text });
          return z.NEVER;
        }
      })
      .pipe(schema),
  ]);
