import { z } from 'zod';

import type { ToolContext } from '../../graphql.ts';
import { rest } from '../../rest.ts';

// The API validates these as UUIDs and answers anything else with a bare 422.
export const notebookId = z.uuid().describe('ID (UUID) of the notebook, as returned by list_projects or create_notebook');

export const notebookUrl = (ctx: ToolContext, workspaceId: string, id: string) =>
  `${ctx.webUrl}/workspace/${workspaceId}/documents/${id}/notebook/edit`;

export const notebookApiPath = (workspaceId: string, id: string) => `/workspaces/${workspaceId}/documents/${id}`;

// The editor renders the title from the notebook's collaborative document, not
// from the database row, so a title has to be written there to show up.
export const setNotebookTitle = (ctx: ToolContext, workspaceId: string, id: string, title: string) =>
  rest(ctx, 'PUT', `${notebookApiPath(workspaceId, id)}/title`, { title });
