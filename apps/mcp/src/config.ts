import { z } from 'zod';

const hex = (length: number) => z.string().regex(new RegExp(`^0x[0-9a-fA-F]{${length}}$`));

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3100),

  MPP_NETWORK: z.enum(['arbitrum-sepolia', 'arbitrum-one']).default('arbitrum-sepolia'),
  MPP_SECRET_KEY: z.string().min(16, 'use a long random string'),
  MPP_SERVER_PRIVATE_KEY: hex(64),
  MPP_RECIPIENT: hex(40).optional(),
  // Per-call price, in USDC base units (6 decimals). Kept generic now that no
  // tool is registered yet — rename/split if different tools need different
  // prices.
  QUERY_PRICE: z.string().regex(/^[1-9]\d*$/, 'must be a positive integer of USDC base units'),
});

export type Config = {
  port: number;
  network: 'arbitrum-sepolia' | 'arbitrum-one';
  secretKey: string;
  serverPrivateKey: `0x${string}`;
  recipient: `0x${string}` | undefined;
  price: string;
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
  };
}
