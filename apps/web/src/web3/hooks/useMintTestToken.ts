"use client";

import { demoTokenAbi, type EscrowToken } from "@sandworm/types/escrow";
import { useCallback, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { targetChains } from "../config";

import { useTx } from "./useTx";

// =====================================
// ⬢ useMintTestToken
// =====================================
// Mints a demo token (anyone may) to the connected wallet. Throws on failure,
// after useTx has toasted it, so callers only decide what to show beside it.
export const useMintTestToken = (chainId: number) => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const runTx = useTx();
  const [isMinting, setIsMinting] = useState(false);
  const chain = targetChains.find(item => item.id === chainId);

  const mint = useCallback(
    async (token: EscrowToken, amount: bigint) => {
      if (!walletClient || !publicClient || !address || !chain) return;
      setIsMinting(true);
      try {
        await runTx(`Mint ${token.symbol}`, chain, publicClient, () =>
          walletClient.writeContract({
            account: address,
            chain,
            address: token.address,
            abi: demoTokenAbi,
            functionName: "mint",
            args: [address, amount],
          })
        );
        // A wallet only lists tokens it knows, so offer to add the minted one.
        // Declining is fine: the balance is there either way.
        await walletClient
          .watchAsset({
            type: "ERC20",
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
            },
          })
          .catch(() => undefined);
      } finally {
        setIsMinting(false);
      }
    },
    [walletClient, publicClient, address, chain, runTx]
  );

  return { mint, isMinting };
};
