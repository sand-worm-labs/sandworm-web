import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';

import type { ToolContext } from '../../../graphql.ts';
import { registerNotebookManageTools } from '../manage.ts';

type Tool = { description: string; inputSchema: Record<string, z.ZodType> };
type Handler = (args: Record<string, unknown>) => Promise<{ isError?: boolean; content: { text: string }[] }>;

const tools = new Map<string, { config: Tool; handler: Handler }>();
const server = { registerTool: (name: string, config: Tool, handler: Handler) => tools.set(name, { config, handler }) };
const ctx = { auth: { userId: 'u', token: 't' }, apiUrl: 'http://api', webUrl: 'http://web' } as ToolContext;
registerNotebookManageTools(server as never, ctx);

const NOTEBOOK = '2d3d71d2-c2db-4c60-87b4-d67a537176ba';
const WORKSPACE = '1f42401c-4934-45a2-9ac7-cf8af9cd6d1f';

const requests: { query: string; variables: Record<string, unknown> }[] = [];
let doc: Record<string, unknown> = {};
globalThis.fetch = (async (_url: string, init: { body?: string }) => {
  const body = JSON.parse(init.body ?? '{}');
  requests.push({ query: body.query, variables: body.variables });
  const field = /(publishDocument|setDocumentUnlisted)\(/.exec(body.query)?.[1] ?? 'getDocument';
  return new Response(JSON.stringify({ data: { [field]: doc } }), { status: 200 });
}) as unknown as typeof fetch;

const call = async (args: Record<string, unknown>) => {
  const { config, handler } = tools.get('publish_notebook')!;
  return handler(z.object(config.inputSchema).parse({ notebookId: NOTEBOOK, workspaceId: WORKSPACE, ...args }));
};

const docWith = (visibility: string, slug: string) => ({
  id: NOTEBOOK, title: 'T', slug, workspaceId: WORKSPACE, visibility, publishedAt: '2026-10-21T00:00:00Z',
  updatedAt: '2026-10-21T00:00:00Z', orderIndex: 0, parentId: null, description: null, tags: [], runtime: 'CLOUD',
});

test('publish_notebook publishes publicly by default, as before', async () => {
  requests.length = 0;
  doc = docWith('PUBLIC', 'my-notebook-12345678');

  const result = JSON.parse((await call({})).content[0]!.text);

  assert.match(requests[0]!.query, /publishDocument\(/);
  assert.doesNotMatch(requests[0]!.query, /setDocumentUnlisted/);
  assert.equal(result.listed, true);
  assert.equal(result.publicUrl, 'http://web/notebooks/my-notebook-12345678');
});

test('publish_notebook shares an unlisted notebook by its secret link and says it is not listed', async () => {
  requests.length = 0;
  doc = docWith('UNLISTED', 'my-notebook-AbCdEfGhIjKlMnOpQrStUv');

  const result = JSON.parse((await call({ visibility: 'unlisted' })).content[0]!.text);

  assert.match(requests[0]!.query, /setDocumentUnlisted\(/);
  assert.deepEqual(requests[0]!.variables, { workspaceId: WORKSPACE, documentId: NOTEBOOK, rotate: false });
  assert.equal(result.listed, false);
  assert.equal(result.visibility, 'UNLISTED');
  assert.equal(result.publicUrl, 'http://web/notebooks/my-notebook-AbCdEfGhIjKlMnOpQrStUv');
});

test('publish_notebook replaces the unlisted link on newLink, and carries the description and tags', async () => {
  requests.length = 0;
  doc = docWith('UNLISTED', 'my-notebook-newnewnewnewnewnewnew');

  await call({ visibility: 'unlisted', newLink: true, description: 'A note', tags: ['nansen'] });

  assert.deepEqual(requests[0]!.variables, {
    workspaceId: WORKSPACE, documentId: NOTEBOOK, rotate: true, meta: { description: 'A note', tags: ['nansen'] },
  });
});

test('publish_notebook refuses newLink for a public notebook instead of ignoring it', async () => {
  requests.length = 0;
  const result = await call({ newLink: true });
  assert.equal(result.isError, true);
  assert.match(result.content[0]!.text, /unlisted/);
  assert.equal(requests.length, 0);
});

test('publish_notebook only accepts public or unlisted', () => {
  const schema = z.object(tools.get('publish_notebook')!.config.inputSchema);
  assert.equal(schema.safeParse({ notebookId: NOTEBOOK, visibility: 'link' }).success, false);
});

test('the tool description tells an agent what unlisted means before it chooses it', () => {
  const { description } = tools.get('publish_notebook')!.config;
  assert.match(description, /without signing in/);
  assert.match(description, /cannot be forked/);
  assert.match(description, /bounty/);
});
