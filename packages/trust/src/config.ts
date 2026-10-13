// Environment and the fixed ERC-8004 deployments on Monad.

import type { Address } from 'viem';
import { monad, monadTestnet } from 'viem/chains';

// =====================================
// ⬢ Chain and registries
// =====================================
// ERC-8004 is deployed on both Monad networks, at different addresses. Mainnet
// is the default; TRUST_NETWORK=testnet runs the same flow where gas is free,
// for trying it out. Attestations on one network mean nothing on the other.
const NETWORKS = {
  mainnet: {
    chain: monad,
    registries: {
      identity: '0x8004A169FB4a3325136EB29fA0ceB6D2e539a432',
      reputation: '0x8004BAa17C55a88189AE136b182e5fdA19dE9b63',
      validation: '0x8004Cc8439f36fd5F9F049D9fF86523Df6dAAB58',
    },
  },
  testnet: {
    chain: monadTestnet,
    registries: {
      identity: '0x8004A818BFB912233c491871b3d84c89A494BD9e',
      reputation: '0x8004B663056A597Dffe9eCcC1965A193B7388713',
      validation: '0x8004Cb1BF31DAf7788923b405b754f57acEB4272',
    },
  },
} as const satisfies Record<string, { chain: unknown; registries: Record<string, Address> }>;

export type TrustNetwork = keyof typeof NETWORKS;

// Read when used, not when this file loads: the API reads its .env after its
// imports have run.
export function network(): TrustNetwork {
  const name = process.env.TRUST_NETWORK?.trim().toLowerCase() || 'mainnet';
  if (name !== 'mainnet' && name !== 'testnet') {
    throw new Error(`TRUST_NETWORK must be "mainnet" or "testnet", not "${name}"`);
  }
  return name;
}

export const chain = () => NETWORKS[network()].chain;

export const REGISTRIES = {
  get identity(): Address {
    return NETWORKS[network()].registries.identity;
  },
  get reputation(): Address {
    return NETWORKS[network()].registries.reputation;
  },
  get validation(): Address {
    return NETWORKS[network()].registries.validation;
  },
};

// The CAIP-10 style id of the identity registry, as the registration file names it.
export const agentRegistry = () => `eip155:${chain().id}:${REGISTRIES.identity}`;

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
