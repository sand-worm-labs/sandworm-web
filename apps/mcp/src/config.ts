import { z } from 'zod';

import type { TrinoConfig } from './trino.ts';

const hex = (length: number) => z.string().regex(new RegExp(`^0x[0-9a-fA-F]{${length}}$`));

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3100),

  MPP_NETWORK: z.enum(['arbitrum-sepolia', 'arbitrum-one']).default('arbitrum-sepolia'),
  MPP_SECRET_KEY: z.string().min(16, 'use a long random string'),
  MPP_SERVER_PRIVATE_KEY: hex(64),
  MPP_RECIPIENT: hex(40).optional(),
  QUERY_PRICE: z.string().regex(/^[1-9]\d*$/, 'must be a positive integer of USDC base units'),

  QUERY_MAX_ROWS: z.coerce.number().int().positive().default(1000),
  QUERY_TIMEOUT_MS: z.coerce.number().int().positive().default(60_000),

  TRINO_HOST: z.string().min(1),
  TRINO_PORT: z.coerce.number().int().positive().default(443),
  TRINO_CATALOG: z.string().min(1),
  TRINO_SCHEMA: z.string().optional(),
  TRINO_USER: z.string().min(1),
  TRINO_PASSWORD: z.string().optional(),
  TRINO_HTTP_SCHEME: z.enum(['http', 'https']).optional(),
});

export type Config = {
  port: number;
  network: 'arbitrum-sepolia' | 'arbitrum-one';
  secretKey: string;
  serverPrivateKey: `0x${string}`;
  recipient: `0x${string}` | undefined;
  price: string;
  maxRows: number;
  timeoutMs: number;
  trino: TrinoConfig;
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
    maxRows: e.QUERY_MAX_ROWS,
    timeoutMs: e.QUERY_TIMEOUT_MS,
    trino: {
      host: e.TRINO_HOST,
      port: e.TRINO_PORT,
      catalog: e.TRINO_CATALOG,
      schema: e.TRINO_SCHEMA || null,
      user: e.TRINO_USER,
      password: e.TRINO_PASSWORD || null,
      // Same rule as the API: TLS on 443, plain http elsewhere.
      httpScheme: e.TRINO_HTTP_SCHEME ?? (e.TRINO_PORT === 443 ? 'https' : 'http'),
    },
  };
}
