import { z } from 'zod';

const hex = (length: number) => z.string().regex(new RegExp(`^0x[0-9a-fA-F]{${length}}$`));

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

  MPP_NETWORK: z.enum(['arbitrum-sepolia', 'arbitrum-one']).default('arbitrum-sepolia'),
  MPP_SECRET_KEY: z.string().min(16, 'use a long random string'),
  MPP_SERVER_PRIVATE_KEY: hex(64),
  MPP_RECIPIENT: hex(40).optional(),
  // Per-call price, in USDC base units (6 decimals).
  QUERY_PRICE: z.string().regex(/^[1-9]\d*$/, 'must be a positive integer of USDC base units'),


  // Save every tool call (arguments, result, timing) to a chat on the
  // notebook it touched, so a session can be debugged afterwards.
  LOG_TOOL_CALLS: z.stringbool().default(true),
});

export type Config = {
  port: number;
  network: 'arbitrum-sepolia' | 'arbitrum-one';
  secretKey: string;
  serverPrivateKey: `0x${string}`;
  recipient: `0x${string}` | undefined;
  price: string;
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
    network: e.MPP_NETWORK,
    secretKey: e.MPP_SECRET_KEY,
    serverPrivateKey: e.MPP_SERVER_PRIVATE_KEY as `0x${string}`,
    recipient: e.MPP_RECIPIENT as `0x${string}` | undefined,
    price: e.QUERY_PRICE,
    publicUrl: e.MCP_PUBLIC_URL ?? `http://localhost:${e.PORT}/mcp`,
    authServerUrl: e.AUTH_SERVER_URL.replace(/\/$/, ''),
    apiUrl: e.API_URL.replace(/\/$/, ''),
    webUrl: e.WEB_URL.replace(/\/$/, ''),
    introspectKey: e.MCP_OAUTH_INTROSPECT_KEY,
    logToolCalls: e.LOG_TOOL_CALLS,
  };
}
