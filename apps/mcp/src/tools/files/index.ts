import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { graphql, resolveWorkspaceId, type ToolContext } from '../../graphql.ts';
import { confirm, handle, workspaceId } from '../shared.ts';

type SandwormFile = {
  name: string;
  path: string;
  size: number;
  mimeType: string | null;
  isDirectory: boolean;
  createdAt: number;
};

// Matches the API's request body limit.
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
// Downloads come back through the agent's context, so keep them small.
const MAX_READ_BYTES = 256 * 1024;

const filePath = z.string().describe('Path of the file, as returned by list_files');

// Upload and download are REST endpoints, not GraphQL; they read the same
// access_token cookie.
async function filesRequest(ctx: ToolContext, workspaceId: string, suffix: string, init: RequestInit) {
  const res = await fetch(`${ctx.apiUrl}/api/workspaces/${encodeURIComponent(workspaceId)}/files${suffix}`, {
    ...init,
    headers: { Cookie: `access_token=${ctx.auth.token}`, ...init.headers },
    signal: AbortSignal.timeout(60_000),
  });
  return res;
}

export function registerFileTools(server: McpServer, ctx: ToolContext): void {
  server.registerTool(
    'upload_file',
    {
      description: 'Upload a file (e.g. CSV) to a workspace so analyses can use it',
      inputSchema: {
        workspaceId,
        fileName: z.string().min(1),
        contentBase64: z.string().describe('File contents, base64-encoded'),
        replace: z.boolean().optional().describe('Overwrite an existing file with the same name. Defaults to false'),
      },
    },
    handle(async ({ workspaceId, fileName, contentBase64, replace }) => {
      const body = Buffer.from(contentBase64, 'base64');
      if (!body.length) throw new Error('File is empty');
      if (body.length > MAX_UPLOAD_BYTES) throw new Error('File is larger than the 20MB upload limit');

      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      const res = await filesRequest(ctx, resolved, `?replace=${replace === true}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream', 'X-File-Name': fileName },
        body,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Upload failed (${res.status})${text ? `: ${text}` : ''}`);
      }
      return { uploaded: fileName, size: body.length, workspaceId: resolved };
    }),
  );

  server.registerTool(
    'list_files',
    { description: 'List files uploaded to a workspace', inputSchema: { workspaceId } },
    handle(async ({ workspaceId }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      const data = await graphql<{ listFiles: SandwormFile[] }>(
        ctx,
        `query ($input: ListFilesInput!) {
          listFiles(input: $input) { name path size mimeType isDirectory createdAt }
        }`,
        // The API rejects a missing path; "./data" is what the web app lists too.
        { input: { workspaceId: resolved, path: './data' } },
      );
      return data.listFiles;
    }),
  );

  server.registerTool(
    'read_file',
    {
      description: `Read a text file from a workspace. Returns up to ${MAX_READ_BYTES / 1024}KB per call; for larger files, call again with offset set to the nextOffset from the previous result`,
      inputSchema: {
        workspaceId,
        path: filePath,
        offset: z.number().int().min(0).optional().describe('Byte offset to start reading from. Defaults to 0'),
      },
    },
    handle(async ({ workspaceId, path, offset = 0 }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      const res = await filesRequest(ctx, resolved, `/file?path=${encodeURIComponent(path)}`, { method: 'GET' });
      if (res.status === 404) throw new Error(`File not found: ${path}`);
      if (!res.ok || !res.body) throw new Error(`Download failed (${res.status})`);

      // Stream the file, keep only [offset, offset + MAX_READ_BYTES), and stop
      // downloading once the window is full.
      const end = offset + MAX_READ_BYTES;
      const parts: Buffer[] = [];
      let pos = 0;
      let more = false;
      const reader = res.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = Buffer.from(value);
        const from = Math.max(offset - pos, 0);
        const to = Math.min(end - pos, chunk.length);
        if (from < to) parts.push(chunk.subarray(from, to));
        pos += chunk.length;
        if (pos > end) {
          more = true;
          await reader.cancel();
          break;
        }
      }

      const bytes = Buffer.concat(parts);
      if (bytes.includes(0)) throw new Error('File looks binary; read_file only returns text');
      // A window can split a multi-byte character; the partial one is dropped
      // here and re-read at the start of the next window.
      let text = bytes.toString('utf8');
      let consumed = bytes.length;
      if (more && text.endsWith('\uFFFD')) {
        text = text.slice(0, -1);
        consumed = Buffer.byteLength(text);
      }
      const nextOffset = offset + consumed;
      return { content: text, offset, nextOffset: more ? nextOffset : null, truncated: more };
    }),
  );

  server.registerTool(
    'delete_file',
    {
      description: 'Delete an uploaded file',
      inputSchema: { workspaceId, path: filePath, confirm },
    },
    handle(async ({ workspaceId, path }) => {
      const resolved = await resolveWorkspaceId(ctx, workspaceId);
      await graphql<{ deleteFile: boolean }>(
        ctx,
        `mutation ($input: DeleteFileInput!) { deleteFile(input: $input) }`,
        { input: { workspaceId: resolved, path } },
      );
      return { deleted: path };
    }),
  );
}
