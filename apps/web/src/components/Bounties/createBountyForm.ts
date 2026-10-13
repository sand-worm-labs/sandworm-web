import { escrowTokens } from "@sandworm/types/escrow";

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

export const isStepValid = (step: number, form: BountyDraftForm) => {
  if (step === 0) {
    return [form.title, form.sponsor, form.summary].every(v => v.trim());
  }
  if (step === 1) return form.details.trim().length > 0;
  return (
    AMOUNT_PATTERN.test(form.amount) &&
    Number(form.amount) > 0 &&
    form.deadline >= tomorrow()
  );
};
