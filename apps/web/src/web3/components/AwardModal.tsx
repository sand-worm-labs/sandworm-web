"use client";

import { MAX_WINNERS, feeFor } from "@sandworm/types/escrow";
import { useMemo, useRef, useState } from "react";
import { PiPlus, PiTrash } from "react-icons/pi";
import { toast } from "sonner";

import { tintPillDarkClassName } from "@/styles/interactive";

import { checkAward, type AwardRow } from "../award";
import { describeError } from "../errors";
import { formatToken } from "../format";
import { useEscrowActions } from "../hooks/useEscrowActions";

import { ModalShell } from "./ModalShell";

// =====================================
// ⬢ Types
// =====================================
interface AwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  chainId: number;
  onchainId: string;
  remaining: bigint;
  decimals: number;
  symbol: string;
  feeBps: number;
  onDone: () => void;
}

const inputClassName =
  "w-full px-3 py-2.5 rounded-xl bg-inputBg dark:bg-base-400 border border-border dark:border-border-tertiary text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium";

const primaryButtonClassName = `w-full py-3.5 px-4 bg-primary hover:bg-primary-720 disabled:bg-disabled dark:disabled:bg-[#4a4a48] text-border-secondary font-medium rounded-xl transition-colors disabled:cursor-not-allowed text-sm border border-transparent ${tintPillDarkClassName}`;

// =====================================
// ⬢ Award Modal
// =====================================
export const AwardModal = ({
  isOpen,
  onClose,
  chainId,
  onchainId,
  remaining,
  decimals,
  symbol,
  feeBps,
  onDone,
}: AwardModalProps) => {
  const nextId = useRef(1);
  const [rows, setRows] = useState<(AwardRow & { id: number })[]>([
    { id: 0, address: "", amount: "" },
  ]);
  const [isSending, setIsSending] = useState(false);
  const { award } = useEscrowActions(chainId, onchainId);
  const check = useMemo(
    () => checkAward(rows, remaining, decimals),
    [rows, remaining, decimals]
  );
  const fees = check.amounts.reduce(
    (sum, amount) => sum + feeFor(amount, feeBps),
    BigInt(0)
  );

  const update = (index: number, patch: Partial<AwardRow>) =>
    setRows(current =>
      current.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );

  const addRow = () => {
    nextId.current += 1;
    const id = nextId.current;
    setRows(current => [...current, { id, address: "", amount: "" }]);
  };

  const submit = async () => {
    setIsSending(true);
    try {
      await award(check.winners, check.amounts);
      toast.success("Winners paid.");
      onDone();
      onClose();
    } catch (err) {
      toast.error(describeError(err));
    } finally {
      setIsSending(false);
    }
  };

  const touched = rows.some(row => row.address || row.amount);

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={isSending ? () => undefined : onClose}
      title="Award winners"
      description={`Pays winners straight from the escrow. ${formatToken(remaining, decimals)} ${symbol} is left, and a ${feeBps / 100}% platform fee comes out of each award.`}
      footer={
        <button
          type="button"
          disabled={isSending || check.errors.length > 0}
          onClick={submit}
          className={primaryButtonClassName}
        >
          {isSending ? "Paying winners..." : "Award winners"}
        </button>
      }
    >
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id} className="flex items-center gap-2">
            <input
              aria-label={`Winner ${index + 1} address`}
              value={row.address}
              onChange={e => update(index, { address: e.target.value.trim() })}
              placeholder="0x... wallet address"
              className={`${inputClassName} min-w-0 flex-1`}
            />
            <input
              aria-label={`Winner ${index + 1} amount`}
              value={row.amount}
              inputMode="decimal"
              onChange={e => update(index, { amount: e.target.value.trim() })}
              placeholder={symbol}
              className={`${inputClassName} w-28 shrink-0`}
            />
            <button
              type="button"
              aria-label="Remove winner"
              disabled={rows.length === 1}
              onClick={() =>
                setRows(current => current.filter((_, i) => i !== index))
              }
              className="shrink-0 p-2 text-ink-400 hover:text-ink-100 disabled:opacity-40"
            >
              <PiTrash size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={rows.length >= MAX_WINNERS}
        onClick={addRow}
        className="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline disabled:opacity-40"
      >
        <PiPlus size={12} /> Add winner
      </button>

      <div className="mt-5 rounded-2xl bg-base-600 p-4 text-xs text-ink-400">
        <p>
          Total {formatToken(check.total, decimals)} {symbol}, platform fee{" "}
          {formatToken(fees, decimals)} {symbol}, winners receive{" "}
          {formatToken(check.total - fees, decimals)} {symbol}.
        </p>
      </div>

      {touched && check.errors.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-red-600 dark:text-red-400">
          {check.errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </ModalShell>
  );
};
