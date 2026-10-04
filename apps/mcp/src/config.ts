import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(6789),

  // Public URL of this MCP endpoint. Must equal MCP_OAUTH_RESOURCE on the API,
  // because the authorization server rejects any other `resource`.
  MCP_PUBLIC_URL: z.url().optional(),
  // Authorization server (apps/api) as clients see it: its issuer URL.
  AUTH_SERVER_URL: z.url().default('http://localhost:8081'),
  // Where this server reaches the API directly, for token introspection.
  API_URL: z.url().default('http://localhost:8003'),
  // Web app, used to build notebook links returned to the agent.
  WEB_URL: z.url().default('http://localhost:8081'),
  // Shared secret for POST /api/oauth/introspect; equals MCP_OAUTH_INTROSPECT_KEY on the API.
  MCP_OAUTH_INTROSPECT_KEY: z.string().min(1),

  // Save every tool call (arguments, result, timing) to a chat on the
  // notebook it touched, so a session can be debugged afterwards.
  LOG_TOOL_CALLS: z.stringbool().default(true),
});

export type Config = {
  port: number;
  publicUrl: string;
  authServerUrl: string;
  apiUrl: string;
  webUrl: string;
  introspectKey: string;
  logToolCalls: boolean;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map(issue => `  ${issue.path.join('.')}: ${issue.message}`).join('\n');
    throw new Error(`Invalid environment:\n${problems}`);
  }
  const e = parsed.data;

  return {
    port: e.PORT,
    publicUrl: e.MCP_PUBLIC_URL ?? `http://localhost:${e.PORT}/mcp`,
    authServerUrl: e.AUTH_SERVER_URL.replace(/\/$/, ''),
    apiUrl: e.API_URL.replace(/\/$/, ''),
    webUrl: e.WEB_URL.replace(/\/$/, ''),
    introspectKey: e.MCP_OAUTH_INTROSPECT_KEY,
    logToolCalls: e.LOG_TOOL_CALLS,
  };
}
