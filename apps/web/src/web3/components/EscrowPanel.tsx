"use client";

import {
  bountyEscrowAbi,
  escrowTokens,
  JUDGING_PERIOD_SECONDS,
} from "@sandworm/types/escrow";
import { useState } from "react";
import { PiLockKey } from "react-icons/pi";
import { useAccount, useReadContract, useSwitchChain } from "wagmi";

import { Tag } from "@/components/Tag";

import { explorerAddressUrl, explorerTxUrl, targetChains } from "../config";
import { describeError } from "../errors";
import { formatDate, formatToken, shortAddress } from "../format";
import { useEscrowActions } from "../hooks/useEscrowActions";
import { useEscrowBounty, type Payout } from "../hooks/useEscrowBounty";

import { AwardModal } from "./AwardModal";
import { FundEscrowModal, type FundableBounty } from "./FundEscrowModal";

// =====================================
// ⬢ Types
// =====================================
export type EscrowBounty = FundableBounty & {
  status: string;
  sample: boolean;
  chainId?: number | null;
  onchainId?: string | null;
  fundTxHash?: string | null;
};

const PHASE_LABEL = {
  open: "Open",
  judging: "Judging",
  refundable: "Ready to refund",
  closed: "Closed",
} as const;

const buttonClassName =
  "h-[30px] rounded-lg px-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const primaryClassName = `${buttonClassName} bg-primary text-white hover:bg-primary-710`;
const secondaryClassName = `${buttonClassName} border border-border dark:border-border-tertiary text-ink-100 dark:text-white hover:bg-hover-bg dark:hover:bg-base-600`;

const Row = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4 py-2 text-xs">
    <span className="text-ink-400">{label}</span>
    <span className="text-right font-medium text-ink-100 dark:text-white">
      {children}
    </span>
  </div>
);

const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-primary hover:underline"
  >
    {children}
  </a>
);

// =====================================
// ⬢ Draft funding
// =====================================
const DraftFunding = ({
  bounty,
  onChanged,
}: {
  bounty: EscrowBounty;
  onChanged: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mt-5 rounded-2xl bg-base-600 p-4">
      <p className="flex items-center gap-1.5 text-sm font-medium text-ink-100 dark:text-white">
        <PiLockKey size={16} /> Not funded yet
      </p>
      <p className="mt-1 text-xs leading-relaxed text-ink-400">
        This draft is only visible to you. Lock the reward in the escrow
        contract to open it to everyone.
      </p>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${primaryClassName} mt-3`}
      >
        Fund escrow
      </button>
      <FundEscrowModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        bounty={bounty}
        onFunded={onChanged}
      />
    </div>
  );
};

// =====================================
// ⬢ Live escrow
// =====================================
const LiveEscrow = ({
  bounty,
  onChanged,
}: {
  bounty: EscrowBounty;
  onChanged: () => void;
}) => {
  const chainId = bounty.chainId!;
  const onchainId = bounty.onchainId!;
  const chain = targetChains.find(item => item.id === chainId);
  const { address: account, chainId: connectedChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const escrow = useEscrowBounty({
    chainId,
    onchainId,
    fundTxHash: bounty.fundTxHash,
  });
  const { refund } = useEscrowActions(chainId, onchainId);
  const [isAwarding, setIsAwarding] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const arbiter = useReadContract({
    chainId,
    address: escrow.address,
    abi: bountyEscrowAbi,
    functionName: "arbiter",
    query: { enabled: Boolean(escrow.address) },
  });

  const data = escrow.bounty;
  if (!chain || !data || escrow.remaining === undefined) {
    return (
      <p className="mt-5 text-xs text-ink-400">
        {escrow.isError
          ? "Could not read the escrow."
          : "Reading the escrow..."}
      </p>
    );
  }

  const token = escrowTokens[chainId]?.find(
    item => item.address.toLowerCase() === data.token.toLowerCase()
  );
  const decimals = token?.decimals ?? 6;
  const symbol = token?.symbol ?? "";
  const money = (amount: bigint) =>
    `${formatToken(amount, decimals)} ${symbol}`;

  const me = account?.toLowerCase();
  const isSponsor = me === data.sponsor.toLowerCase();
  const isArbiter = me !== undefined && me === arbiter.data?.toLowerCase();
  const pastDeadline = escrow.phase !== "open";
  const onRightChain = connectedChainId === chainId;
  const canAward =
    !data.closed &&
    escrow.remaining > BigInt(0) &&
    (isSponsor || (isArbiter && pastDeadline));
  const canRefund =
    !data.closed && ((isSponsor && escrow.phase === "refundable") || isArbiter);
  const refundDate = formatDate(Number(data.deadline) + JUDGING_PERIOD_SECONDS);
  const label = escrow.refund
    ? "Refunded"
    : data.closed
      ? "Paid out"
      : PHASE_LABEL[escrow.phase!];

  const runRefund = async () => {
    setIsRefunding(true);
    setError(null);
    try {
      await refund();
      await escrow.refetch();
      onChanged();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink-100 dark:text-white">
          <PiLockKey size={16} /> Escrow
        </p>
        <Tag>{label}</Tag>
      </div>

      <div className="mt-2 divide-y divide-border-secondary dark:divide-border-tertiary">
        <Row label="Locked">{money(data.amount)}</Row>
        <Row label="Paid out">{money(data.paid)}</Row>
        <Row label="Left">
          {money(data.closed ? BigInt(0) : escrow.remaining)}
        </Row>
        <Row label="Platform fee">{data.feeBps / 100}%</Row>
        <Row label="Deadline">{formatDate(data.deadline)}</Row>
        <Row label="Sponsor can refund after">{refundDate}</Row>
        <Row label="Sponsor wallet">
          <ExternalLink href={explorerAddressUrl(chain, data.sponsor)}>
            {shortAddress(data.sponsor)}
          </ExternalLink>
        </Row>
        <Row label="Contract">
          <ExternalLink href={explorerAddressUrl(chain, escrow.address!)}>
            {shortAddress(escrow.address!)}
          </ExternalLink>
        </Row>
        {bounty.fundTxHash && (
          <Row label="Funding transaction">
            <ExternalLink href={explorerTxUrl(chain, bounty.fundTxHash)}>
              {shortAddress(bounty.fundTxHash)}
            </ExternalLink>
          </Row>
        )}
      </div>

      {(escrow.payouts.length > 0 || escrow.refund) && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-ink-100 dark:text-white">
            Payments
          </p>
          <ul className="mt-1.5 space-y-1 text-xs text-ink-400">
            {escrow.payouts.map((payout: Payout) => (
              <li key={`${payout.txHash}-${payout.winner}`}>
                {shortAddress(payout.winner)} received {money(payout.amount)} (
                <ExternalLink href={explorerTxUrl(chain, payout.txHash)}>
                  tx
                </ExternalLink>
                )
              </li>
            ))}
            {escrow.refund && (
              <li>
                {money(escrow.refund.amount)} returned to the sponsor (
                <ExternalLink href={explorerTxUrl(chain, escrow.refund.txHash)}>
                  tx
                </ExternalLink>
                )
              </li>
            )}
          </ul>
        </div>
      )}

      {(canAward || canRefund) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {!onRightChain ? (
            <button
              type="button"
              onClick={() => switchChainAsync({ chainId })}
              className={primaryClassName}
            >
              Switch to {chain.name}
            </button>
          ) : (
            <>
              {canAward && (
                <button
                  type="button"
                  onClick={() => setIsAwarding(true)}
                  className={primaryClassName}
                >
                  Award winners
                </button>
              )}
              {canRefund && (
                <button
                  type="button"
                  disabled={isRefunding}
                  onClick={runRefund}
                  className={secondaryClassName}
                >
                  {isArbiter && !isSponsor
                    ? "Cancel and refund sponsor"
                    : "Refund what is left"}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {isSponsor && !data.closed && escrow.phase !== "refundable" && (
        <p className="mt-3 text-xs text-ink-400">
          You can take back what is left on {refundDate}, 14 days after the
          deadline.
        </p>
      )}
      {error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <AwardModal
        isOpen={isAwarding}
        onClose={() => setIsAwarding(false)}
        chainId={chainId}
        onchainId={onchainId}
        remaining={escrow.remaining}
        decimals={decimals}
        symbol={symbol}
        feeBps={data.feeBps}
        onDone={() => {
          escrow.refetch();
          onChanged();
        }}
      />
    </div>
  );
};

// =====================================
// ⬢ Escrow Panel
// =====================================
export const EscrowPanel = ({
  bounty,
  onChanged,
}: {
  bounty: EscrowBounty;
  onChanged: () => void;
}) => {
  if (bounty.sample) return null;
  if (bounty.status === "draft")
    return <DraftFunding bounty={bounty} onChanged={onChanged} />;
  if (!bounty.chainId || !bounty.onchainId) return null;
  return <LiveEscrow bounty={bounty} onChanged={onChanged} />;
};
