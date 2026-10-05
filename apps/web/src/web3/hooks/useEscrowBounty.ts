"use client";

import {
  bountyEscrowAbi,
  escrowAddressFor,
  escrowPhase,
} from "@sandworm/types/escrow";
import { useQuery } from "@tanstack/react-query";
import type { Hash } from "viem";
import { usePublicClient, useReadContract } from "wagmi";

// =====================================
// ⬢ Types
// =====================================
export type Payout = {
  winner: `0x${string}`;
  amount: bigint;
  fee: bigint;
  txHash: Hash;
};

type Args = {
  chainId?: number | null;
  onchainId?: string | null;
  fundTxHash?: string | null;
};

// =====================================
// ⬢ useEscrowBounty
// =====================================
export const useEscrowBounty = ({ chainId, onchainId, fundTxHash }: Args) => {
  const address = chainId ? escrowAddressFor(chainId) : undefined;
  const enabled = Boolean(chainId && address && onchainId);
  const id = onchainId ? BigInt(onchainId) : undefined;
  const publicClient = usePublicClient({ chainId: chainId ?? undefined });

  const bounty = useReadContract({
    chainId: chainId ?? undefined,
    address,
    abi: bountyEscrowAbi,
    functionName: "getBounty",
    args: id === undefined ? undefined : [id],
    query: { enabled, refetchInterval: 15_000 },
  });

  const remaining = useReadContract({
    chainId: chainId ?? undefined,
    address,
    abi: bountyEscrowAbi,
    functionName: "remaining",
    args: id === undefined ? undefined : [id],
    query: { enabled, refetchInterval: 15_000 },
  });

  const events = useQuery({
    queryKey: [
      "escrow-events",
      chainId,
      onchainId,
      bounty.data?.paid?.toString(),
    ],
    enabled: enabled && Boolean(publicClient),
    queryFn: async () => {
      const fromBlock = fundTxHash
        ? (
            await publicClient!.getTransactionReceipt({
              hash: fundTxHash as Hash,
            })
          ).blockNumber
        : undefined;
      const [awards, refunds] = await Promise.all([
        publicClient!.getContractEvents({
          address,
          abi: bountyEscrowAbi,
          eventName: "Awarded",
          args: { id },
          fromBlock,
        }),
        publicClient!.getContractEvents({
          address,
          abi: bountyEscrowAbi,
          eventName: "Refunded",
          args: { id },
          fromBlock,
        }),
      ]);
      const payouts: Payout[] = awards.map(log => ({
        winner: log.args.winner!,
        amount: log.args.amount!,
        fee: log.args.fee!,
        txHash: log.transactionHash,
      }));
      const refund = refunds[0]
        ? {
            amount: refunds[0].args.amount!,
            txHash: refunds[0].transactionHash,
          }
        : undefined;
      return { payouts, refund };
    },
  });

  const { data } = bounty;
  return {
    enabled,
    address,
    isLoading: bounty.isLoading || remaining.isLoading,
    isError: bounty.isError,
    refetch: () =>
      Promise.all([bounty.refetch(), remaining.refetch(), events.refetch()]),
    bounty: data,
    remaining: remaining.data,
    payouts: events.data?.payouts ?? [],
    refund: events.data?.refund,
    phase: data ? escrowPhase(data.deadline, data.closed) : undefined,
  };
};
