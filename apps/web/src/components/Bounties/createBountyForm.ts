import {
  DEFAULT_FEE_BPS,
  MAX_PRIZE_PLACES,
  depositFor,
  escrowTokens,
} from "@sandworm/types/escrow";
import { formatUnits, parseUnits } from "viem";

import type { BountyDraftForm } from "@/store/bountyDraft";
import { escrowChains } from "@/web3/config";

import { REWARD_TOKENS } from "./tokens";

export const STEPS = ["Basics", "Details", "Reward"];
export const TYPES = ["Dashboard", "Research", "Investigation"];

const AMOUNT_PATTERN = /^\d+(\.\d{1,6})?$/;

const escrowSymbols = new Set(
  escrowChains.flatMap(chain =>
    (escrowTokens[chain.id] ?? []).map(token => token.symbol)
  )
);

export const ESCROW_TOKENS = REWARD_TOKENS.filter(token =>
  escrowSymbols.has(token.symbol)
);

export const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

export { MAX_PRIZE_PLACES };

const DECIMALS = 6;

// What the person types for an amount, kept to digits and one point, with at most 6 decimals.
export const cleanAmount = (value: string) => {
  const kept = value.replace(/[^\d.]/g, "");
  const [whole = "", ...rest] = kept.split(".");
  return rest.length === 0
    ? whole
    : `${whole}.${rest.join("").slice(0, DECIMALS)}`;
};

const unitsOf = (prize: string) =>
  AMOUNT_PATTERN.test(prize) ? parseUnits(prize, DECIMALS) : null;

// Why a prize schedule cannot be saved, per place (index) or for the whole list (key "all").
export const prizeProblems = (
  prizes: string[]
): Record<number | "all", string> => {
  const problems: Record<number | "all", string> = {} as never;
  if (prizes.length === 0) problems.all = "Add at least one prize.";
  if (prizes.length > MAX_PRIZE_PLACES) {
    problems.all = `At most ${MAX_PRIZE_PLACES} places.`;
  }
  let previous: bigint | null = null;
  prizes.forEach((prize, index) => {
    const units = unitsOf(prize);
    if (units === null || units <= BigInt(0)) {
      if (prize !== "") problems[index] = "Enter an amount more than zero.";
      return;
    }
    if (previous !== null && units > previous) {
      problems[index] = "Cannot be more than the place above.";
    }
    previous = units;
  });
  return problems;
};

export const prizesAreValid = (prizes: string[]) =>
  prizes.length > 0 &&
  prizes.length <= MAX_PRIZE_PLACES &&
  prizes.every(prize => (unitsOf(prize) ?? BigInt(0)) > BigInt(0)) &&
  Object.keys(prizeProblems(prizes)).length === 0;

// What the winners are paid in all, and what is locked to pay it with the fee on top. The fee is
// the contract's own, read when the escrow is funded: this is what it will be at the usual rate.
export const prizeTotals = (prizes: string[], feeBps = DEFAULT_FEE_BPS) => {
  const units = prizes
    .map(unitsOf)
    .filter((unit): unit is bigint => unit !== null);
  const pool = units.reduce((sum, unit) => sum + unit, BigInt(0));
  const deposit = depositFor(units, feeBps);
  return {
    pool: formatUnits(pool, DECIMALS),
    fee: formatUnits(deposit - pool, DECIMALS),
    deposit: formatUnits(deposit, DECIMALS),
  };
};

export const isStepValid = (step: number, form: BountyDraftForm) => {
  if (step === 0) {
    return [form.title, form.sponsor, form.summary].every(v => v.trim());
  }
  if (step === 1) return form.details.trim().length > 0;
  return prizesAreValid(form.prizes) && form.deadline >= tomorrow();
};
