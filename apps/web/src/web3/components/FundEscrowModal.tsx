"use client";

import { demoTokenAbi, escrowTokens } from "@sandworm/types/escrow";
import { useState } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWalletClient,
} from "wagmi";

import { tintPillDarkClassName } from "@/styles/interactive";

import { defaultChain, faucets, supportsEscrow, targetChains } from "../config";
import { erc20Abi } from "../erc20";
import { describeError } from "../errors";
import { formatDate, formatToken } from "../format";
import { useFundBounty } from "../hooks/useFundBounty";
import { useTx } from "../hooks/useTx";

import { ConnectWalletButton } from "./ConnectWalletButton";
import { ModalShell } from "./ModalShell";

// =====================================
// ⬢ Types
// =====================================
export type FundableBounty = {
  slug: string;
  title: string;
  rewardToken?: string | null;
  rewardAmount?: string | null;
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

const primaryButtonClassName = `w-full py-3.5 px-4 bg-primary hover:bg-primary-720 disabled:bg-disabled dark:disabled:bg-[#4a4a48] text-border-secondary font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-transparent ${tintPillDarkClassName}`;

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
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });
  const runTx = useTx();
  const [isMinting, setIsMinting] = useState(false);
  const balance = useReadContract({
    chainId,
    address: token?.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(token && address), refetchInterval: 10_000 },
  });

  const amount = bounty.rewardAmount ?? "0";
  const needed = token ? parseUnits(amount, token.decimals) : BigInt(0);
  const hasBalance = balance.data !== undefined && balance.data >= needed;
  const isRunning = step !== "idle" && step !== "done";

  const mint = async () => {
    if (!token || !walletClient || !publicClient || !address) return;
    setError(null);
    setIsMinting(true);
    try {
      await runTx(`Mint ${token.symbol}`, chain, publicClient, () =>
        walletClient.writeContract({
          account: address,
          chain,
          address: token.address,
          abi: demoTokenAbi,
          functionName: "mint",
          args: [address, needed],
        })
      );
      await balance.refetch();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsMinting(false);
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
          className={primaryButtonClassName}
        >
          Switch to {chain.name}
        </button>
      );
    }
    return (
      <button
        type="button"
        disabled={!token || !hasBalance || isRunning}
        onClick={run}
        className={primaryButtonClassName}
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
      description="Locks the reward in the escrow contract. The bounty opens once the deposit is confirmed onchain."
      footer={action()}
    >
      <div className="divide-y divide-border-secondary dark:divide-border-tertiary">
        <Row label="Bounty" value={bounty.title} />
        <Row label="Reward" value={`${amount} ${bounty.rewardToken ?? ""}`} />
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
