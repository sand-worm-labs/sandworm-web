import type { BountyWinner } from '@sandworm/postgresql-typeorm';
import { assignPlaces } from '@sandworm/types/escrow';
import { formatUnits } from 'viem';
import { formatAmount, ordinal, shortAddress } from './bounty.format';

export type PaidEvent = {
  winner: string;
  // What the winner received, after the fee, and the fee itself
  amount: bigint;
  fee: bigint;
  // When it was paid, in seconds. Left out when the block could not be read.
  paidAt?: number | null;
};

export type EntryByWallet = Map<
  string,
  { author: string; notebookSlug: string }
>;

type Input = {
  awards: PaidEvent[];
  // What each place of the schedule pays its winner, in order. Empty for a bounty made before schedules.
  tiers: bigint[];
  feeBps: number;
  // Seconds
  deadline: number;
  entries: EntryByWallet;
  token?: { symbol: string; decimals: number };
};

export const NOTE_OUTSIDE_SCHEDULE = 'Not an amount in the prize schedule';
export const NOTE_NO_ENTRY = 'Paid to a wallet no entry gave';
export const NOTE_EARLY = 'Paid before the deadline';

// What a winner received, to the cent. The escrow rounds an award up so the fee never leaves a
// winner short, which can add a millionth of a token: that is not worth showing.
const money = (
  amount: bigint,
  token?: { symbol: string; decimals: number },
) => {
  if (!token) return null;
  const value = formatUnits(amount, token.decimals);
  const shown =
    Number(value) >= 1
      ? Number(value).toLocaleString('en-US', { maximumFractionDigits: 2 })
      : formatAmount(value);
  return `${shown} ${token.symbol}`;
};

// The winners a bounty shows, read from what its escrow actually paid.
//
// A bounty with a prize schedule shows one winner per payment, in the place it paid for. Anything
// that departs from what was agreed is written on the winner as a note, so a reader can see it:
// a payment that is no place's prize, a wallet no entry gave, a payment made before the deadline.
// A bounty made before schedules has no places: a wallet paid more than once is one winner with
// the sum, ranked by what they received.
export const buildWinners = ({
  awards,
  tiers,
  feeBps,
  deadline,
  entries,
  token,
}: Input): BountyWinner[] => {
  if (tiers.length === 0) {
    const paid = new Map<string, bigint>();
    awards.forEach((award) =>
      paid.set(award.winner, (paid.get(award.winner) ?? 0n) + award.amount),
    );
    return [...paid.entries()]
      .sort(([, a], [, b]) => (a < b ? 1 : a > b ? -1 : 0))
      .map(([address, amount], index): BountyWinner => {
        const entry = entries.get(address.toLowerCase());
        return {
          place: ordinal(index + 1),
          author: entry ? entry.author : shortAddress(address),
          notebookSlug: entry?.notebookSlug ?? '',
          amount: money(amount, token),
          address,
        };
      });
  }

  const { places } = assignPlaces(tiers, awards, feeBps);
  return awards
    .map((award, index): { place: number | null; winner: BountyWinner } => {
      const place = places[index];
      const entry = entries.get(award.winner.toLowerCase());
      const notes: string[] = [];
      if (place === null) notes.push(NOTE_OUTSIDE_SCHEDULE);
      if (!entry) notes.push(NOTE_NO_ENTRY);
      if (award.paidAt != null && award.paidAt <= deadline)
        notes.push(NOTE_EARLY);
      return {
        place,
        winner: {
          place: place === null ? 'Outside the schedule' : ordinal(place),
          author: entry ? entry.author : shortAddress(award.winner),
          notebookSlug: entry?.notebookSlug ?? '',
          amount: money(award.amount, token),
          address: award.winner,
          notes,
        },
      };
    })
    .sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity))
    .map((item) => item.winner);
};
