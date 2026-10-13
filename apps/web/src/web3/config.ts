import { monad, monadTestnet } from "viem/chains";
import { escrowAddressFor } from "@sandworm/types/escrow";

// =====================================
// ⬢ Chains
// =====================================
export const targetChains = [monadTestnet, monad] as const;

export type TargetChainId = (typeof targetChains)[number]["id"];

export const defaultChain = monadTestnet;

export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

export const supportsEscrow = (chainId?: number) =>
  chainId !== undefined && Boolean(escrowAddressFor(chainId));

export const escrowChains = targetChains.filter(chain =>
  supportsEscrow(chain.id)
);

export const explorerTxUrl = (
  chain: { blockExplorers?: { default: { url: string } } },
  hash: string
) => `${chain.blockExplorers?.default.url}/tx/${hash}`;

export const explorerAddressUrl = (
  chain: { blockExplorers?: { default: { url: string } } },
  address: string
) => `${chain.blockExplorers?.default.url}/address/${address}`;

export const faucets: Partial<Record<number, { name: string; url: string }[]>> =
  {
    [monadTestnet.id]: [
      { name: "Monad faucet (gas)", url: "https://faucet.monad.xyz/" },
    ],
  };
