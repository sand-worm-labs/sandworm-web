// Environment and the fixed ERC-8004 deployment on Monad mainnet.

import type { Address } from 'viem';
import { monad } from 'viem/chains';

// =====================================
// ⬢ Chain and registries
// =====================================
export const CHAIN = monad;

export const REGISTRIES = {
  identity: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
  reputation: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63',
  validation: '0x8004Cc8439f36fd5F9F049D9fF86523Df6dAAB58',
} as const satisfies Record<string, Address>;

// The CAIP-10 style id of the identity registry, as the registration file names it.
export const AGENT_REGISTRY = `eip155:${CHAIN.id}:${REGISTRIES.identity}`;

export const TAG = 'sandworm-inputs-v1';

// =====================================
// ⬢ Environment
// =====================================
export function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Set ${name} in packages/trust/.env (see .env.example)`);
  return value;
}

export const optional = (name: string): string | undefined => process.env[name]?.trim() || undefined;
