#!/usr/bin/env node
// Connects to the Sandworm MCP as a signed-in Sandworm user and lists their workspaces.
// Proves the whole chain: discovery, client registration, browser sign-in (PKCE),
// token exchange, refresh, and an MCP call. No dependencies; Node 20+.
//
//   node celia-connect.mjs                      # production
//   SANDWORM_MCP_URL=http://localhost:6789/mcp node celia-connect.mjs
//
// Writes the tokens to ./.sandworm-tokens.json (mode 600). Do not commit it.
// A refresh token is a full Sandworm login: store it encrypted, per staff member.

import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';

const MCP_URL = process.env.SANDWORM_MCP_URL ?? 'https://mcp.sandwormlab.xyz/mcp';
const PORT = Number(process.env.CALLBACK_PORT ?? 8976);
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const TOKEN_FILE = '.sandworm-tokens.json';

const b64url = buf => Buffer.from(buf).toString('base64url');

async function json(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// 1. Discovery: the MCP names its authorization server, which names its endpoints.
async function discover() {
  const origin = new URL(MCP_URL).origin;
  const resource = await json(await fetch(`${origin}/.well-known/oauth-protected-resource`));
  const issuer = resource.authorization_servers?.[0];
  if (!issuer) throw new Error(`No authorization server found: ${JSON.stringify(resource)}`);
  const server = await json(await fetch(`${issuer}/.well-known/oauth-authorization-server`));
  // `resource` must match the server's configured MCP URL exactly, so use what it advertises.
  return { resource: resource.resource, server };
}

// 2. Dynamic client registration (RFC 7591). Once per Celia deployment: keep the client_id.
async function register(server) {
  const res = await fetch(server.registration_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ client_name: 'Celia', redirect_uris: [REDIRECT_URI] }),
  });
  const body = await json(res);
  if (!res.ok) throw new Error(`Registration failed: ${JSON.stringify(body)}`);
  return body.client_id;
}

// 3. Browser sign-in. The staff member logs in to Sandworm and approves; Sandworm redirects back with a code.
function signIn(server, clientId, resource) {
  const verifier = b64url(randomBytes(32));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  const state = b64url(randomBytes(16));

  const url = new URL(server.authorization_endpoint);
  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    resource,
    state,
  }).toString();

  return new Promise((resolve, reject) => {
    const listener = createServer((req, res) => {
      const callback = new URL(req.url, REDIRECT_URI);
      if (callback.pathname !== '/callback') return res.writeHead(404).end();
      res.end('Connected. You can close this tab.');
      listener.close();
      if (callback.searchParams.get('state') !== state) return reject(new Error('State mismatch'));
      const error = callback.searchParams.get('error');
      if (error) return reject(new Error(`Sign-in refused: ${error}`));
      resolve({ code: callback.searchParams.get('code'), verifier });
    });
    listener.listen(PORT, '127.0.0.1', () => {
      console.log(`Open this URL to sign in to Sandworm:\n\n${url}\n`);
      execFile(process.platform === 'darwin' ? 'open' : 'xdg-open', [url.toString()], () => {});
    });
  });
}

// 4. Token endpoint. Sandworm reads JSON bodies, which is what is sent here.
async function token(server, body) {
  const res = await fetch(server.token_endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await json(res);
  if (!res.ok) throw new Error(`Token request failed: ${JSON.stringify(result)}`);
  return result;
}

// 5. One MCP call. The server is stateless, so each request stands alone.
async function mcp(accessToken, method, params, id = 1) {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  const text = await res.text();
  if (res.status === 401) throw new Error('401: the access token is missing, expired or revoked');
  // The reply is plain JSON or a single server-sent event.
  const data = text.startsWith('{') ? text : text.split('\n').find(line => line.startsWith('data:'))?.slice(5);
  const message = JSON.parse(data ?? 'null');
  if (message?.error) throw new Error(`MCP error: ${JSON.stringify(message.error)}`);
  return message?.result;
}

const { resource, server } = await discover();

let saved;
try {
  saved = JSON.parse(readFileSync(TOKEN_FILE, 'utf8'));
} catch {}

let tokens;
if (saved?.refresh_token) {
  console.log('Refreshing the saved login…');
  try {
    tokens = await token(server, { grant_type: 'refresh_token', refresh_token: saved.refresh_token });
  } catch (err) {
    console.log(`Saved login no longer works (${err.message}); signing in again.`);
  }
}
if (!tokens) {
  const clientId = saved?.client_id ?? (await register(server));
  const { code, verifier } = await signIn(server, clientId, resource);
  tokens = await token(server, {
    grant_type: 'authorization_code',
    code,
    code_verifier: verifier,
    redirect_uri: REDIRECT_URI,
    client_id: clientId,
  });
  tokens.client_id = clientId;
}
// Every refresh returns a new refresh token: always keep the latest.
writeFileSync(TOKEN_FILE, JSON.stringify({ client_id: saved?.client_id ?? tokens.client_id, refresh_token: tokens.refresh_token }), { mode: 0o600 });
console.log(`Signed in. Access token valid for ${tokens.expires_in}s.\n`);

await mcp(tokens.access_token, 'initialize', {
  protocolVersion: '2025-03-26',
  capabilities: {},
  clientInfo: { name: 'celia', version: '0.1.0' },
});
const { tools } = await mcp(tokens.access_token, 'tools/list', {}, 2);
console.log(`${tools.length} tools available, e.g. ${tools.slice(0, 8).map(t => t.name).join(', ')}\n`);

const workspaces = await mcp(tokens.access_token, 'tools/call', { name: 'list_workspaces', arguments: {} }, 3);
console.log('list_workspaces →');
console.log(workspaces?.content?.map(part => part.text).join('\n'));
