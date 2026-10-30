import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { confirm, handle, workspaceId } from '../shared.ts';
import {
  NOTEBOOK_TYPES,
  notebookId,
  notebookType,
  notebookUrl,
  setNotebookTitle,
  turnRequest,
  typeFromRuntime,
} from './shared.ts';

type Doc = {
  id: string;
  title: string;
  slug: string | null;
  workspaceId: string;
  visibility: string;
  publishedAt: string | null;
  updatedAt: string;
  orderIndex: number;
  parentId: string | null;
  description: string | null;
  tags: string[];
  runtime: string;
};

const DOC_FIELDS = 'id title slug workspaceId visibility publishedAt updatedAt orderIndex parentId description tags runtime';

export function registerNotebookManageTools(server: McpServer, ctx: ToolContext): void {
  const links = (d: Pick<Doc, 'id' | 'workspaceId' | 'slug' | 'publishedAt'>) => ({
    url: notebookUrl(ctx, d.workspaceId, d.id),
    ...(d.publishedAt && d.slug ? { publicUrl: `${ctx.webUrl}/notebooks/${d.slug}` } : {}),
  });

  const summary = (d: Doc) => ({
    notebookId: d.id,
    workspaceId: d.workspaceId,
    title: d.title,
    type: typeFromRuntime(d.runtime),
    visibility: d.visibility,
    published: d.publishedAt !== null,
    updatedAt: d.updatedAt,
    ...links(d),
  });

  const getDoc = async (documentId: string, workspaceId: string) =>
    (
      await graphql<{ getDocument: Doc }>(
        ctx,
        `query ($documentId: String!, $workspaceId: String!) {
          getDocument(documentId: $documentId, workspaceId: $workspaceId) { ${DOC_FIELDS} }
        }`,
        { documentId, workspaceId },
      )
    ).getDocument;

  server.registerTool(
    'get_notebook',
    {
      description: 'Fetch a notebook: its details, links, and its cells as markdown',
      inputSchema: { notebookId, workspaceId, request: turnRequest },
    },
    handle(async ({ notebookId, workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const doc = await getDoc(notebookId, ws);
      const res = await fetch(
        `${ctx.apiUrl}/api/yjs_documents/${encodeURIComponent(notebookId)}/ai-context?workspaceId=${encodeURIComponent(ws)}`,
        { headers: { Cookie: `access_token=${ctx.auth.token}` }, signal: AbortSignal.timeout(30_000) },
      );
      if (!res.ok) throw new Error(`Could not load notebook cells (${res.status})`);
      return {
        ...summary(doc),
        description: doc.description,
        tags: doc.tags,
        content: await res.text(),
      };
    }),
  );

  server.registerTool(
    'edit_notebook',
    {
      description: 'Rename a notebook and/or change its type. Use add_cell / update_cell / delete_cell to change its cells',
      inputSchema: {
        notebookId,
        title: z.string().min(1).optional(),
        type: notebookType.optional(),
        workspaceId,
        request: turnRequest,
      },
    },
    handle(async ({ notebookId, title, type, workspaceId }) => {
      if (title === undefined && type === undefined) throw new Error('Give a new title, a new type, or both.');
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      if (title !== undefined) await setNotebookTitle(ctx, ws, notebookId, title);
      // UpdateDocumentInput requires orderIndex, so carry over the current one.
      const current = await getDoc(notebookId, ws);
      const data = await graphql<{ updateDocument: Doc }>(
        ctx,
        `mutation ($documentId: String!, $workspaceId: String!, $input: UpdateDocumentInput!) {
          updateDocument(documentId: $documentId, workspaceId: $workspaceId, input: $input) { ${DOC_FIELDS} }
        }`,
        {
          documentId: notebookId,
          workspaceId: ws,
          input: {
            orderIndex: current.orderIndex,
            ...(title !== undefined ? { title } : {}),
            ...(type !== undefined ? { runtime: NOTEBOOK_TYPES[type] } : {}),
          },
        },
      );
      return summary(data.updateDocument);
    }),
  );

  server.registerTool(
    'delete_notebook',
    {
      description: 'Delete a notebook (moves it to trash, where it can be restored)',
      inputSchema: { notebookId, workspaceId, confirm },
    },
    handle(async ({ notebookId, workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      await graphql(
        ctx,
        `mutation ($input: DeleteDocumentInput!) { deleteDocument(input: $input) }`,
        { input: { workspaceId: ws, documentId: notebookId, isPermanent: false } },
      );
      return { deleted: notebookId, workspaceId: ws, permanent: false };
    }),
  );

  server.registerTool(
    'publish_notebook',
    {
      description:
        'Publish a notebook so it can be viewed by others, and return its link. ' +
        'visibility "public" (the default) lists it on Explore and in search, and lets anyone fork it. ' +
        'visibility "unlisted" shares it by a link alone: anyone who has the link can view it without signing in, nothing lists or searches it, ' +
        'search engines are asked to skip it, and it cannot be forked. The link carries a long random token, so it cannot be guessed; share it only with the people who should see the notebook. ' +
        'Publishing it again as unlisted keeps the same link; set newLink to true to replace it (the old link stops working). ' +
        'unpublish_notebook turns either kind off. An unlisted notebook cannot be submitted to a bounty, because a bounty page is public. ' +
        'The description (about 280 characters at most) and tags are saved either way',
      inputSchema: {
        notebookId,
        workspaceId,
        visibility: z
          .enum(['public', 'unlisted'])
          .optional()
          .describe('public (default): listed, searchable, forkable. unlisted: only people with the link, no sign-in needed, listed nowhere'),
        newLink: z
          .boolean()
          .optional()
          .describe('Unlisted only: replace the link with a new one, so the old link stops working'),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
      },
    },
    handle(async ({ notebookId, workspaceId, visibility, newLink, description, tags }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const meta = description !== undefined || tags ? { description, tags } : undefined;

      if (visibility === 'unlisted') {
        const data = await graphql<{ setDocumentUnlisted: Doc }>(
          ctx,
          `mutation ($workspaceId: String!, $documentId: String!, $rotate: Boolean, $meta: PublishDocumentMetaInput) {
            setDocumentUnlisted(workspaceId: $workspaceId, documentId: $documentId, rotate: $rotate, meta: $meta) { ${DOC_FIELDS} }
          }`,
          { workspaceId: ws, documentId: notebookId, rotate: newLink ?? false, meta },
        );
        return { ...summary(data.setDocumentUnlisted), listed: false };
      }

      if (newLink) throw new Error('newLink only applies to an unlisted notebook: set visibility to "unlisted"');
      const data = await graphql<{ publishDocument: Doc }>(
        ctx,
        `mutation ($workspaceId: String!, $documentId: String!, $meta: PublishDocumentMetaInput) {
          publishDocument(workspaceId: $workspaceId, documentId: $documentId, meta: $meta) { ${DOC_FIELDS} }
        }`,
        { workspaceId: ws, documentId: notebookId, meta },
      );
      return { ...summary(data.publishDocument), listed: true };
    }),
  );

  server.registerTool(
    'unpublish_notebook',
    { description: 'Unpublish a previously published notebook', inputSchema: { notebookId, workspaceId } },
    handle(async ({ notebookId, workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ unpublishDocument: Doc }>(
        ctx,
        `mutation ($workspaceId: String!, $documentId: String!) {
          unpublishDocument(workspaceId: $workspaceId, documentId: $documentId) { ${DOC_FIELDS} }
        }`,
        { workspaceId: ws, documentId: notebookId },
      );
      return summary(data.unpublishDocument);
    }),
  );

  server.registerTool(
    'fork_notebook',
    {
      description:
        'Fork a published notebook into a workspace. Takes the notebook\'s slug (e.g. "uniswap-v3-pool-liquidity-overview-07551da6"), its public link, or its ID',
      inputSchema: {
        notebook: z.string().min(1).describe('Slug, public link or ID of the published notebook'),
        workspaceId,
      },
    },
    handle(async ({ notebook, workspaceId }) => {
      const target = await resolveWorkspaceId(ctx, workspaceId);
      // Accept a pasted link too: the slug is its last path segment.
      const ref = notebook.trim().replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop()!;
      const documentId = z.uuid().safeParse(ref).success
        ? ref
        : (
            await graphql<{ getPublishedDocumentBySlug: { id: string } }>(
              ctx,
              `query ($slug: String!) { getPublishedDocumentBySlug(slug: $slug) { id } }`,
              { slug: ref },
            )
          ).getPublishedDocumentBySlug.id;
      const data = await graphql<{ forkDocument: Doc }>(
        ctx,
        `mutation ($input: ForkDocumentInput!) { forkDocument(input: $input) { ${DOC_FIELDS} } }`,
        { input: { documentId, targetWorkspaceId: target } },
      );
      return summary(data.forkDocument);
    }),
  );

  server.registerTool(
    'schedule_notebook',
    {
      description: 'Schedule a notebook to re-run on a cron schedule. Replaces any existing schedule. Cloud notebooks only: live_dashboard and local_analysis notebooks run in the browser when opened',
      inputSchema: {
        notebookId,
        workspaceId,
        cron: z.string().describe('Cron expression, e.g. "0 9 * * 1"'),
        timezone: z.string().optional().describe('IANA timezone, e.g. "Europe/London". Defaults to UTC'),
      },
    },
    handle(async ({ notebookId, workspaceId, cron, timezone }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const existing = await listSchedules(notebookId);
      const input = { type: 'CRON', cron, timezone: timezone ?? 'UTC', isActive: true };
      const fields = 'id cron timezone isActive nextExecutionAt';
      // A notebook gets one schedule: update it in place when there is one.
      const data = existing.length
        ? (
            await graphql<{ updateSchedule: Schedule }>(
              ctx,
              `mutation ($scheduleId: String!, $input: UpdateScheduleInput!) {
                updateSchedule(scheduleId: $scheduleId, input: $input) { ${fields} }
              }`,
              { scheduleId: existing[0]!.id, input },
            )
          ).updateSchedule
        : (
            await graphql<{ createSchedule: Schedule }>(
              ctx,
              `mutation ($workspaceId: String!, $input: CreateScheduleInput!) {
                createSchedule(workspaceId: $workspaceId, input: $input) { ${fields} }
              }`,
              { workspaceId: ws, input: { ...input, documentId: notebookId } },
            )
          ).createSchedule;
      return { notebookId, workspaceId: ws, schedule: data };
    }),
  );

  server.registerTool(
    'unschedule_notebook',
    { description: 'Remove the schedule from a notebook', inputSchema: { notebookId, workspaceId } },
    handle(async ({ notebookId, workspaceId }) => {
      const ws = await resolveWorkspaceId(ctx, workspaceId);
      const existing = await listSchedules(notebookId);
      for (const s of existing) {
        await graphql(
          ctx,
          `mutation ($input: DeleteScheduleInput!) { deleteSchedule(input: $input) }`,
          { input: { workspaceId: ws, documentId: notebookId, scheduleId: s.id } },
        );
      }
      return { notebookId, removed: existing.length };
    }),
  );

  type Schedule = { id: string; cron: string | null; timezone: string | null; isActive: boolean };
  async function listSchedules(documentId: string) {
    return (
      await graphql<{ schedules: Schedule[] }>(
        ctx,
        `query ($input: ListSchedulesInput!) { schedules(input: $input) { id cron timezone isActive } }`,
        { input: { documentId } },
      )
    ).schedules;
  }
}
