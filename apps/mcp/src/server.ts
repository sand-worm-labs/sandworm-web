import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

import { handleRunQuery, type RunQueryDeps } from './run-query.ts';

const MAX_BODY_BYTES = 1_000_000;

export function createMcpServer(deps: RunQueryDeps, price: { display: string }): McpServer {
  const server = new McpServer({ name: 'sandworm', version: '0.1.0' });

  server.registerTool(
    'run_query',
    {
      title: 'Run a SQL query',
      description:
        `Run a read-only SQL query (Trino dialect) against Sandworm's onchain data. Costs ${price.display} per call, ` +
        'paid in USDC on Arbitrum. Results are capped in size; add a LIMIT and select only the columns you need.',
      inputSchema: { sql: z.string().describe('A single read-only statement: SELECT, WITH, SHOW or DESCRIBE.') },
    },
    // `extra` carries the caller's payment credential in its `_meta`.
    async ({ sql }, extra) => handleRunQuery({ sql }, extra, deps)
  );

  return server;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new Error('Request body too large');
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : undefined;
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
}

// Stateless: every request gets its own MCP server + transport, so nothing is
// shared between callers and the process can be scaled or restarted freely.
export function createHttpServer(deps: RunQueryDeps, price: { display: string }): Server {
  return createServer(async (req, res) => {
    const path = (req.url ?? '').split('?')[0];

    if (req.method === 'GET' && path === '/health') return send(res, 200, { ok: true });

    if (path !== '/mcp') return send(res, 404, { error: 'Not found' });
    if (req.method !== 'POST') {
      return send(res, 405, { jsonrpc: '2.0', error: { code: -32000, message: 'Method not allowed' }, id: null });
    }

    try {
      const body = await readJsonBody(req);
      const mcp = createMcpServer(deps, price);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => {
        void transport.close();
        void mcp.close();
      });
      await mcp.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (err) {
      console.error('MCP request failed', err);
      if (!res.headersSent) {
        send(res, 500, { jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
      }
    }
  });
}
