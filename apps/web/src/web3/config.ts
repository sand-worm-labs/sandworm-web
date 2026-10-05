import {
  arbitrum,
  arbitrumSepolia,
  robinhood,
  robinhoodTestnet,
} from "viem/chains";
import { escrowAddressFor } from "@sandworm/types/escrow";

// =====================================
// ⬢ Chains
// =====================================
export const targetChains = [
  robinhoodTestnet,
  arbitrumSepolia,
  robinhood,
  arbitrum,
] as const;

export type TargetChainId = (typeof targetChains)[number]["id"];

export const defaultChain = robinhoodTestnet;

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
    [robinhoodTestnet.id]: [
      {
        name: "Robinhood Chain faucet (gas)",
        url: "https://faucet.testnet.chain.robinhood.com/",
      },
      { name: "Paxos faucet (USDG)", url: "https://faucet.paxos.com/" },
    ],
  };
