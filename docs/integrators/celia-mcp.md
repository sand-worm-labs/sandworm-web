# Connecting Celia to the Sandworm MCP

For the Celia developers. Goal: when a Celia staff member is signed in, Celia's server can call the
Sandworm MCP **as that staff member**. Nothing needs changing on the Sandworm side.

Verified against production on 2026-10-30: discovery documents and the 401 challenge. The sign-in and
token steps below are read from the Sandworm source and have not yet been run end to end. Running
`celia-connect.mjs` (next to this file) is that test.

## The values

| | Production |
| --- | --- |
| MCP endpoint | `https://mcp.sandwormlab.xyz/mcp` |
| Resource metadata | `https://mcp.sandwormlab.xyz/.well-known/oauth-protected-resource` |
| Authorization server | `https://app.sandwormlab.xyz` |
| Server metadata | `https://app.sandwormlab.xyz/.well-known/oauth-authorization-server` |

Read the endpoints from the metadata instead of hard-coding them.

## The flow

Celia is an OAuth 2.1 **public client** (no client secret) using **PKCE (S256)**.

### 1. Register once

```http
POST https://app.sandwormlab.xyz/api/oauth/register
content-type: application/json

{ "client_name": "Celia", "redirect_uris": ["https://<celia-host>/api/sandworm/callback"] }
```

Returns `client_id`. Store it in Celia's config. Registration is open, never expires, and the
`redirect_uri` you send later must be one of the registered strings exactly.

### 2. "Connect Sandworm" (per staff member)

Send the staff member's browser to `authorization_endpoint` with:

| Param | Value |
| --- | --- |
| `response_type` | `code` |
| `client_id` | from step 1 |
| `redirect_uri` | registered callback |
| `code_challenge`, `code_challenge_method` | SHA-256 of a random verifier, base64url; method `S256` |
| `resource` | `https://mcp.sandwormlab.xyz/mcp` (the `resource` field of the metadata, **exactly**: anything else is a 400) |
| `state` | random, tied to the Celia session; check it on return |

Keep the verifier server-side, keyed by `state`. The staff member signs in on Sandworm's page with
their own account, picks a workspace, and approves. Sandworm redirects to the callback with
`?code=…&state=…` (or `?error=access_denied`). Codes are single-use and live 5 minutes.

### 3. Exchange the code (server-side, in the callback)

```http
POST https://app.sandwormlab.xyz/api/oauth/token
content-type: application/json

{ "grant_type": "authorization_code", "code": "...", "code_verifier": "...",
  "redirect_uri": "<same as step 2>", "client_id": "..." }
```

**Send JSON.** Sandworm's token endpoint is written for JSON bodies, not the usual
`application/x-www-form-urlencoded`; an OAuth library that sends a form body may be rejected. Returns
`{ access_token, refresh_token, token_type: "Bearer", expires_in }`.

### 4. Call the MCP

```http
POST https://mcp.sandwormlab.xyz/mcp
authorization: Bearer <access_token>
content-type: application/json
accept: application/json, text/event-stream

{ "jsonrpc": "2.0", "id": 1, "method": "tools/call",
  "params": { "name": "list_workspaces", "arguments": {} } }
```

The server is stateless: no session id, no required handshake, so one HTTP request per call.
The reply is JSON or a single server-sent event. If you use the official MCP SDK
(`@modelcontextprotocol/sdk`, `StreamableHTTPClientTransport` with an `Authorization` header via
`requestInit`), a new client per request is fine.

A `401` carries a `WWW-Authenticate` header: the token is expired or revoked. Refresh, retry once.

### 5. Refresh

```http
POST https://app.sandwormlab.xyz/api/oauth/token
{ "grant_type": "refresh_token", "refresh_token": "..." }
```

Access tokens last **15 minutes**, refresh tokens **7 days**. Every refresh returns a **new** refresh
token: save it each time. Refreshing at least weekly keeps a connection alive indefinitely; after a
week of silence the staff member has to press "Connect Sandworm" again. Refresh when a call returns
401 rather than on a timer, so unused connections cost nothing.

## Storing tokens

- Keep **one refresh token per staff member**, encrypted at rest. Never send it to the browser, and
  keep it out of logs, tool-call logs and Celia's audit rows.
- It is a **full Sandworm login** for that person. Sandworm tokens have no scopes and are not tied to a
  workspace, so a leaked token can do anything the person can. Disconnecting in Celia should delete it.
- Sandworm cannot revoke an issued token; it simply expires.

## Workspace

Every Sandworm tool takes an optional `workspaceId`. **Always send Celia's workspace explicitly.**
Without it the tool uses the person's last-used workspace, which could be a personal one. The staff
member must be a member of that workspace: create a shared "Celia" workspace in Sandworm and invite
staff. Get its id from `list_workspaces`.

## Test it now

```bash
node docs/integrators/celia-connect.mjs
```

It discovers the endpoints, registers a client, opens the browser for sign-in, exchanges the code,
calls `tools/list` and `list_workspaces`, and saves the refresh token to `./.sandworm-tokens.json`.
A second run refreshes instead of signing in again. Note that it registers a new client in
production the first time; use `SANDWORM_MCP_URL=http://localhost:6789/mcp` against a local stack.
If the first run succeeds, MCP-to-MCP works.

## What Celia's MCP does with it

Celia's tool handler for a staff request looks up that person's refresh token, gets a fresh access
token, and forwards the Sandworm tool call it needs (for example `create_notebook`, `add_cell`,
`run_notebook`, `get_run_results`). Because the token is the staff member's, notebooks and the
notebook call log show the right person.

## Known limits (see the feasibility audit)

- `get_run_results` clips output: 4,000 characters of text per output, 20 outputs per cell, the first
  10 rows of a SQL result, and no plotly data or image bytes. Design the notebook so its findings
  are small, or print the findings as one compact JSON block under the limit.
- Tool arguments and results are saved to a chat on the notebook (the "MCP session"). **Do not pass
  claimant wallets, names or statements to any Sandworm tool.**

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| `400 resource does not match…` | `resource` differs from the metadata's `resource` field |
| `400 redirect_uri is not registered` | not an exact match with step 1 |
| `invalid_grant` on token | code used twice or older than 5 minutes; verifier or `redirect_uri` differ from step 2 |
| `invalid_grant` on refresh | refresh token older than 7 days or malformed: reconnect |
| `401` from `/mcp` | access token expired: refresh |
