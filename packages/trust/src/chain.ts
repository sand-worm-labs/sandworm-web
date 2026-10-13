// Viem clients for Monad, the two registries' ABIs, and explorer links.

import {
  createPublicClient,
  createWalletClient,
  http,
  type Abi,
  type Address,
  type Hex,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount, type PrivateKeyAccount } from 'viem/accounts';

import { identityAbi } from './abi-identity.ts';
import { validationAbi } from './abi-validation.ts';
import { REGISTRIES, chain, network, optional, required } from './config.ts';

export const IDENTITY_ABI = identityAbi as unknown as Abi;
export const VALIDATION_ABI = validationAbi as unknown as Abi;

// =====================================
// ⬢ Clients
// =====================================
const transport = () => http(optional('MONAD_RPC_URL') ?? chain().rpcUrls.default.http[0]);

export const publicClient = (): PublicClient => createPublicClient({ chain: chain(), transport: transport() });

// A wallet from a private key. The key is never logged or written.
export type TrustWallet = { account: PrivateKeyAccount; client: WalletClient<Transport, ReturnType<typeof chain>, PrivateKeyAccount> };

export function walletFrom(key: string): TrustWallet {
  const account = privateKeyToAccount((key.startsWith('0x') ? key : `0x${key}`) as Hex);
  return { account, client: createWalletClient({ account, chain: chain(), transport: transport() }) };
}

// The same, from the env var that holds the key.
export const wallet = (keyVar: 'AGENT_PRIVATE_KEY' | 'VALIDATOR_PRIVATE_KEY'): TrustWallet => walletFrom(required(keyVar));

// =====================================
// ⬢ Explorer links
// =====================================
// Monadscan on both networks: viem's default for testnet redirects to a host that fails its TLS handshake.
const explorer = () => (network() === 'testnet' ? 'https://testnet.monadscan.com' : 'https://monadscan.com');

export const txUrl = (hash: Hex) => `${explorer()}/tx/${hash}`;
export const addressUrl = (address: Address) => `${explorer()}/address/${address}`;
export const tokenUrl = (registry: Address, agentId: bigint) => `${explorer()}/token/${registry}?a=${agentId}`;

// =====================================
// ⬢ Registry reads
// =====================================
// The verdict the validation registry holds for a request. Zeros when there is none.
export async function validationStatus(requestHash: Hex) {
  const [validator, agentId, response, responseHash, tag, lastUpdate] = (await publicClient().readContract({
    address: REGISTRIES.validation,
    abi: VALIDATION_ABI,
    functionName: 'getValidationStatus',
    args: [requestHash],
  } as never)) as readonly [Address, bigint, number, Hex, string, bigint];
  return { validator, agentId, response: Number(response), responseHash, tag, lastUpdate };
}

export async function agentOwner(agentId: bigint): Promise<Address> {
  return (await publicClient().readContract({
    address: REGISTRIES.identity,
    abi: IDENTITY_ABI,
    functionName: 'ownerOf',
    args: [agentId],
  } as never)) as Address;
}
