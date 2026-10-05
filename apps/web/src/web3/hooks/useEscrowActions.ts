"use client";

import { bountyEscrowAbi, escrowAddressFor } from "@sandworm/types/escrow";
import { useCallback } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { targetChains } from "../config";

import { useTx } from "./useTx";

// =====================================
// ⬢ useEscrowActions
// =====================================
export const useEscrowActions = (chainId: number, onchainId: string) => {
  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const runTx = useTx();

  const send = useCallback(
    (
      label: string,
      functionName: "award" | "refund",
      args: readonly unknown[]
    ) => {
      const chain = targetChains.find(item => item.id === chainId);
      const address = escrowAddressFor(chainId);
      if (!walletClient || !publicClient || !account || !chain || !address) {
        throw new Error("Connect your wallet first.");
      }
      return runTx(label, chain, publicClient, () =>
        walletClient.writeContract({
          account,
          chain,
          address,
          abi: bountyEscrowAbi,
          functionName,
          args: args as never,
        } as never)
      );
    },
    [account, chainId, publicClient, runTx, walletClient]
  );

  const award = useCallback(
    (winners: `0x${string}`[], amounts: bigint[]) =>
      send("Award winners", "award", [BigInt(onchainId), winners, amounts]),
    [onchainId, send]
  );

  const refund = useCallback(
    () => send("Refund", "refund", [BigInt(onchainId)]),
    [onchainId, send]
  );

  return { award, refund };
};
