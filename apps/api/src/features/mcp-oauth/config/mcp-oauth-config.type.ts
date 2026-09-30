export type McpOauthConfig = {
  // Canonical URI of the MCP server this authorization server issues tokens
  // for (RFC 8707 `resource`) — apps/mcp, not apps/api itself.
  resource: string;
  // Shared secret apps/mcp presents to POST /oauth/introspect. Keeps the JWT
  // signing secret out of apps/mcp's env entirely.
  introspectKey: string;
};
