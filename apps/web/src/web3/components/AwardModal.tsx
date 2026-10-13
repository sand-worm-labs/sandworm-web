"use client";

import { useMemo, useState } from "react";
import { PiCheckCircleFill } from "react-icons/pi";
import { toast } from "sonner";

import { ordinalPlace } from "@/components/Bounties/bounties";

import { planAward, type AwardEntry, type AwardTier } from "../award";
import { describeError } from "../errors";
import { formatToken, shortAddress } from "../format";
import { useEscrowActions } from "../hooks/useEscrowActions";

import { ModalShell } from "./ModalShell";
import {
  modalInputClassName,
  modalPrimaryButtonClassName,
} from "./modalStyles";

// =====================================
// ⬢ Types
// =====================================
interface AwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainId: number;
  onchainId: string;
  // What each place pays, and which places have been paid already
  tiers: AwardTier[];
  taken: ReadonlySet<number>;
  // False for a bounty made before prize schedules: one winner takes what is left
  scheduled: boolean;
  entries: AwardEntry[];
  remaining: bigint;
  decimals: number;
  symbol: string;
  feeBps: number;
  // When what is not awarded can be taken back, already written out
  refundDate: string;
  onDone: () => void;
}

const placeLabel = (place: number, scheduled: boolean) =>
  scheduled ? `${ordinalPlace(place)} place` : "Winner";

// =====================================
// ⬢ Award Modal
// =====================================
// The prizes were fixed when the bounty was made, so there is nothing to type: each place shows
// what it pays, and the sponsor picks which entry earned it. The wallet is the one that entry
// gave. Places left empty stay in the escrow.
export const AwardModal = ({
  isOpen,
  onClose,
  chainId,
  onchainId,
  tiers,
  taken,
  scheduled,
  entries,
  remaining,
  decimals,
  symbol,
  feeBps,
  refundDate,
  onDone,
}: AwardModalProps) => {
  const [choices, setChoices] = useState<Record<number, string | undefined>>(
    {}
  );
  const [isSending, setIsSending] = useState(false);
  const { award } = useEscrowActions(chainId, onchainId);

  const plan = useMemo(
    () => planAward({ tiers, taken, choices, entries, remaining, feeBps }),
    [tiers, taken, choices, entries, remaining, feeBps]
  );
  const money = (amount: bigint) =>
    `${formatToken(amount, decimals)} ${symbol}`;
  const open = tiers.filter(tier => !taken.has(tier.place));
  const chosenIds = new Set(Object.values(choices).filter(Boolean));
  const nothingPicked = Object.values(choices).every(choice => !choice);
  const withWallet = entries.filter(entry => entry.wallet);

  const choose = (place: number, id: string) =>
    setChoices(current => ({ ...current, [place]: id || undefined }));

  const submit = async () => {
    setIsSending(true);
    try {
      await award(plan.winners, plan.amounts);
      toast.success(plan.lines.length === 1 ? "Winner paid." : "Winners paid.");
      setChoices({});
      onDone();
      onClose();
    } catch (err) {
      toast.error(describeError(err));
    } finally {
      setIsSending(false);
    }
  };

  const leftAfter = remaining - plan.total;

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={isSending ? () => undefined : onClose}
      title="Award winners"
      description={
        scheduled
          ? "The prizes were fixed when this bounty was made. Pick the entry that earned each place. A place you leave empty stays in the escrow."
          : "This bounty was made before prize schedules, so one winner receives everything left in the escrow."
      }
      footer={
        <button
          type="button"
          disabled={isSending || plan.errors.length > 0}
          onClick={submit}
          className={modalPrimaryButtonClassName}
        >
          {isSending
            ? "Paying..."
            : plan.lines.length > 1
              ? `Pay ${plan.lines.length} winners`
              : "Pay winner"}
        </button>
      }
    >
      {withWallet.length === 0 && open.length > 0 && (
        <p className="mb-4 rounded-xl border border-dashed border-border p-3 text-xs leading-relaxed text-ink-400 dark:border-border-tertiary dark:text-white/70">
          {entries.length === 0
            ? "There are no entries yet."
            : "No entry has given a wallet to be paid."}{" "}
          A winner is paid to the wallet their entry gave, so an entry needs one
          before it can win.
        </p>
      )}

      <ul className="space-y-3">
        {tiers.map(tier => {
          const label = placeLabel(tier.place, scheduled);
          const paid = taken.has(tier.place);
          const chosen = choices[tier.place];
          const entry = entries.find(item => item.id === chosen);
          return (
            <li
              key={tier.place}
              className="rounded-2xl border border-border-secondary p-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-ink-100 dark:text-white">
                  {label}
                </p>
                <p className="text-sm font-medium tabular-nums text-ink-100 dark:text-white">
                  {money(tier.net)}
                </p>
              </div>

              {paid ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400 dark:text-white/70">
                  <PiCheckCircleFill className="text-primary" size={14} />
                  Already paid
                </p>
              ) : (
                <>
                  <label
                    htmlFor={`award-place-${tier.place}`}
                    className="mt-3 block text-xs font-medium text-ink-100 dark:text-white"
                  >
                    Winner
                  </label>
                  <select
                    id={`award-place-${tier.place}`}
                    value={chosen ?? ""}
                    onChange={event => choose(tier.place, event.target.value)}
                    className={`${modalInputClassName} mt-1.5`}
                  >
                    <option value="">Not awarded</option>
                    {entries.map(item => (
                      <option
                        key={item.id}
                        value={item.id}
                        disabled={
                          !item.wallet ||
                          (chosenIds.has(item.id) && chosen !== item.id)
                        }
                      >
                        @{item.author} · {item.notebookTitle}
                        {!item.wallet && " (no wallet)"}
                      </option>
                    ))}
                  </select>
                  {entry?.wallet && (
                    <p className="mt-2 text-xs text-ink-400 dark:text-white/70">
                      Paid to{" "}
                      <span className="font-body-mono text-ink-100 dark:text-white">
                        {shortAddress(entry.wallet)}
                      </span>
                      , the wallet this entry gave.
                    </p>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>

      {plan.lines.length > 0 && (
        <div className="mt-5 rounded-2xl border border-border-secondary p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="text-xs font-semibold text-ink-100 dark:text-white">
            You are about to pay
          </p>
          <ul className="mt-2 space-y-1.5 text-xs">
            {plan.lines.map(line => (
              <li
                key={line.place}
                className="flex items-center justify-between gap-3 text-ink-400 dark:text-white/70"
              >
                <span className="min-w-0 truncate">
                  {placeLabel(line.place, scheduled)} · @{line.entry.author}
                </span>
                <span className="shrink-0 font-medium tabular-nums text-ink-100 dark:text-white">
                  {money(line.net)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-border-secondary pt-3 text-xs dark:border-white/10">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-400 dark:text-white/70">
                Leaves the escrow
              </dt>
              <dd className="font-medium tabular-nums text-ink-100 dark:text-white">
                {money(plan.total)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-400 dark:text-white/70">
                Of which platform fee
              </dt>
              <dd className="font-medium tabular-nums text-ink-100 dark:text-white">
                {money(plan.fees)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-400 dark:text-white/70">
                Left in the escrow after
              </dt>
              <dd className="font-medium tabular-nums text-ink-100 dark:text-white">
                {money(leftAfter < BigInt(0) ? BigInt(0) : leftAfter)}
              </dd>
            </div>
          </dl>
          {leftAfter > BigInt(0) && (
            <p className="mt-3 text-xs leading-relaxed text-ink-400 dark:text-white/70">
              What is not awarded can be taken back by the sponsor from{" "}
              {refundDate}.
            </p>
          )}
        </div>
      )}

      {!nothingPicked && plan.errors.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-red-600 dark:text-red-400">
          {plan.errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
};
