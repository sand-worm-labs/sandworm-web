import { feeFor } from "@sandworm/types/escrow";
import { isAddress } from "viem";

// One prize of a schedule: what the winner is left with, and what is awarded from the escrow
// so that the fee still leaves them that.
export type AwardTier = { place: number; net: bigint; gross: bigint };

// An entry that can be picked: it gave a wallet when it was submitted.
export type AwardEntry = {
  id: string;
  author: string;
  notebookTitle: string;
  // Set once the notebook is published
  notebookSlug?: string | null;
  wallet: string | null;
};

export type AwardLine = {
  place: number;
  entry: AwardEntry;
  wallet: `0x${string}`;
  net: bigint;
  gross: bigint;
  fee: bigint;
};

export type AwardPlan = {
  lines: AwardLine[];
  errors: string[];
  // What goes to the contract's award(): one wallet and one amount per line
  winners: `0x${string}`[];
  amounts: bigint[];
  total: bigint;
  fees: bigint;
};

interface PlanInput {
  tiers: AwardTier[];
  // Places already paid
  taken: ReadonlySet<number>;
  // The entry chosen for each place. A place left out is not awarded.
  choices: Record<number, string | undefined>;
  entries: AwardEntry[];
  remaining: bigint;
  feeBps: number;
}

// =====================================
// ⬢ Plan an award
// =====================================
// What an award would pay, and why it cannot be sent yet. Nothing here can be typed: the
// amounts come from the schedule and the wallets from the entries, so a mistake, or a wrong
// wallet, is not a thing the sponsor can make by hand.
export const planAward = ({
  tiers,
  taken,
  choices,
  entries,
  remaining,
  feeBps,
}: PlanInput): AwardPlan => {
  const errors: string[] = [];
  const lines: AwardLine[] = [];
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const wallets = new Set<string>();
  const used = new Set<string>();

  tiers.forEach(tier => {
    const chosen = choices[tier.place];
    if (!chosen) return;
    if (taken.has(tier.place)) {
      errors.push(`Place ${tier.place} has already been paid.`);
      return;
    }
    const entry = byId.get(chosen);
    if (!entry) {
      errors.push(`Place ${tier.place}: that entry is no longer there.`);
      return;
    }
    if (!entry.wallet) {
      errors.push(
        `Place ${tier.place}: @${entry.author} gave no wallet to pay.`
      );
      return;
    }
    if (!isAddress(entry.wallet)) {
      errors.push(
        `Place ${tier.place}: the wallet @${entry.author} gave is not a valid address.`
      );
      return;
    }
    if (used.has(entry.id)) {
      errors.push(`@${entry.author} can win only one place.`);
      return;
    }
    if (wallets.has(entry.wallet.toLowerCase())) {
      errors.push("Two places would pay the same wallet.");
      return;
    }
    used.add(entry.id);
    wallets.add(entry.wallet.toLowerCase());
    lines.push({
      place: tier.place,
      entry,
      wallet: entry.wallet,
      net: tier.net,
      gross: tier.gross,
      fee: feeFor(tier.gross, feeBps),
    });
  });

  if (lines.length === 0 && errors.length === 0) {
    errors.push("Pick a winner for at least one place.");
  }
  const total = lines.reduce((sum, line) => sum + line.gross, BigInt(0));
  if (total > remaining) {
    errors.push("This is more than what is left in the escrow.");
  }

  return {
    lines,
    errors,
    winners: lines.map(line => line.wallet),
    amounts: lines.map(line => line.gross),
    total,
    fees: lines.reduce((sum, line) => sum + line.fee, BigInt(0)),
  };
};
