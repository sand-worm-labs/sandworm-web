"use client";

import {
  bountyEscrowAbi,
  depositFor,
  escrowAddressFor,
  escrowTokens,
} from "@sandworm/types/escrow";
import { useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useSwitchChain } from "wagmi";

import { ordinalPlace } from "@/components/Bounties/bounties";

import { defaultChain, faucets, supportsEscrow, targetChains } from "../config";
import { erc20Abi } from "../erc20";
import { describeError } from "../errors";
import { formatDate, formatToken } from "../format";
import { useFundBounty } from "../hooks/useFundBounty";
import { useMintTestToken } from "../hooks/useMintTestToken";

import { ConnectWalletButton } from "./ConnectWalletButton";
import { ModalShell } from "./ModalShell";
import { modalPrimaryButtonClassName } from "./modalStyles";

// =====================================
// ⬢ Types
// =====================================
export type FundableBounty = {
  slug: string;
  title: string;
  rewardToken?: string | null;
  // What the winners are paid in all. For a bounty with prizes, the escrow holds this plus the fee.
  rewardAmount?: string | null;
  // What each place's winner receives. Empty for a bounty made before schedules.
  prizeTiers?: { place: number; amount: string }[] | null;
  deadline?: string | null;
};

interface FundEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  bounty: FundableBounty;
  onFunded: () => void;
}

const STEP_LABEL = {
  idle: "",
  approving: "Approving the token...",
  depositing: "Depositing into the escrow...",
  confirming: "Confirming with Sandworm...",
  done: "Done",
} as const;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 py-2 text-sm">
    <span className="text-ink-400">{label}</span>
    <span className="font-medium text-ink-100 dark:text-white">{value}</span>
  </div>
);

// =====================================
// ⬢ Fund Escrow Modal
// =====================================
export const FundEscrowModal = ({
  isOpen,
  onClose,
  bounty,
  onFunded,
}: FundEscrowModalProps) => {
  const { address, chainId: connectedChainId, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitching } = useSwitchChain();
  const [error, setError] = useState<string | null>(null);

  const chainId =
    connectedChainId && supportsEscrow(connectedChainId)
      ? connectedChainId
      : defaultChain.id;
  const chain = targetChains.find(item => item.id === chainId) ?? defaultChain;
  const token = escrowTokens[chainId]?.find(
    item => item.symbol === bounty.rewardToken
  );
  const onRightChain = connectedChainId === chainId;

  const { fund, step } = useFundBounty(chainId);
  const { mint: mintTestToken, isMinting } = useMintTestToken(chainId);
  const balance = useReadContract({
    chainId,
    address: token?.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(token && address), refetchInterval: 10_000 },
  });

  // The fee is the contract's own and is fixed for the bounty when it is created, so it is read
  // here rather than assumed: the escrow is funded with exactly what pays every place after it.
  const escrowAddress = escrowAddressFor(chainId);
  const feeRead = useReadContract({
    chainId,
    address: escrowAddress,
    abi: bountyEscrowAbi,
    functionName: "feeBps",
    query: { enabled: Boolean(escrowAddress) },
  });
  const feeBps = feeRead.data === undefined ? undefined : Number(feeRead.data);

  const tiers = bounty.prizeTiers ?? [];
  const scheduled = tiers.length > 0;
  const nets = token
    ? tiers.map(tier => parseUnits(tier.amount, token.decimals))
    : [];
  const pool = nets.reduce((sum, net) => sum + net, BigInt(0));
  const feeReady = !scheduled || feeBps !== undefined;

  let needed = BigInt(0);
  if (token) {
    needed =
      scheduled && feeBps !== undefined
        ? depositFor(nets, feeBps)
        : parseUnits(bounty.rewardAmount ?? "0", token.decimals);
  }
  const amount =
    token && (scheduled ? feeReady : true)
      ? formatUnits(needed, token.decimals)
      : "0";
  const hasBalance = balance.data !== undefined && balance.data >= needed;
  const isRunning = step !== "idle" && step !== "done";

  const mint = async () => {
    if (!token) return;
    setError(null);
    try {
      await mintTestToken(token, needed);
      await balance.refetch();
    } catch (err) {
      setError(describeError(err));
    }
  };

  const run = async () => {
    if (!token || !bounty.deadline) return;
    setError(null);
    try {
      await fund({
        slug: bounty.slug,
        chainId,
        tokenSymbol: token.symbol,
        amount,
        deadline: new Date(bounty.deadline),
      });
      toast.success("Escrow funded. Your bounty is open.");
      onFunded();
      onClose();
    } catch (err) {
      setError(describeError(err));
    }
  };

  const action = () => {
    if (!isConnected)
      return <ConnectWalletButton className="w-full justify-center" />;
    if (!onRightChain) {
      return (
        <button
          type="button"
          disabled={isSwitching}
          onClick={() => switchChainAsync({ chainId })}
          className={modalPrimaryButtonClassName}
        >
          Switch to {chain.name}
        </button>
      );
    }
    return (
      <button
        type="button"
        disabled={!token || !feeReady || !hasBalance || isRunning}
        onClick={run}
        className={modalPrimaryButtonClassName}
      >
        {isRunning
          ? STEP_LABEL[step]
          : `Fund ${amount} ${bounty.rewardToken ?? ""}`}
      </button>
    );
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={isRunning ? () => undefined : onClose}
      title="Fund escrow"
      description="Locks the prizes in the escrow contract. The schedule is fixed once funded, and the bounty opens once the deposit is confirmed onchain."
      footer={action()}
    >
      <div className="divide-y divide-border-secondary dark:divide-border-tertiary">
        <Row label="Bounty" value={bounty.title} />
        {scheduled && token ? (
          <>
            {tiers.map((tier, index) => (
              <Row
                key={tier.place}
                label={`${ordinalPlace(tier.place)} place prize`}
                value={`${formatToken(nets[index] ?? BigInt(0), token.decimals)} ${token.symbol}`}
              />
            ))}
            <Row
              label={`Platform fee${feeBps === undefined ? "" : ` (${feeBps / 100}%)`}, on top`}
              value={
                feeReady
                  ? `${formatToken(needed - pool, token.decimals)} ${token.symbol}`
                  : "..."
              }
            />
            <Row
              label="You lock in escrow"
              value={feeReady ? `${amount} ${token.symbol}` : "..."}
            />
          </>
        ) : (
          <Row label="Reward" value={`${amount} ${bounty.rewardToken ?? ""}`} />
        )}
        <Row label="Network" value={chain.name} />
        {bounty.deadline && (
          <Row
            label="Deadline"
            value={formatDate(new Date(bounty.deadline).getTime() / 1000)}
          />
        )}
        {isConnected && onRightChain && token && (
          <Row
            label="Your balance"
            value={
              balance.data === undefined
                ? "..."
                : `${formatToken(balance.data, token.decimals)} ${token.symbol}`
            }
          />
        )}
      </div>

      {!token && (
        <p className="mt-4 text-xs text-red-600 dark:text-red-400">
          {bounty.rewardToken} is not available on {chain.name}.
        </p>
      )}

      {onRightChain && token && balance.data !== undefined && !hasBalance && (
        <div className="mt-4 rounded-2xl bg-base-600 p-4 text-xs text-ink-400">
          <p>
            You need {amount} {token.symbol} in this wallet to fund this bounty.
          </p>
          {token.demo && (
            <button
              type="button"
              disabled={isMinting}
              onClick={mint}
              className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-710 disabled:opacity-50"
            >
              {isMinting ? "Minting..." : `Mint ${amount} test ${token.symbol}`}
            </button>
          )}
          {!token.demo && faucets[chainId] && (
            <ul className="mt-2 space-y-1">
              {faucets[chainId]!.map(faucet => (
                <li key={faucet.url}>
                  <a
                    href={faucet.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {faucet.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p className="mt-4 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </ModalShell>
  );
};
