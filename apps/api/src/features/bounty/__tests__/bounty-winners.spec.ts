import { grossFor } from '@sandworm/types/escrow';
import {
  buildWinners,
  NOTE_EARLY,
  NOTE_NO_ENTRY,
  NOTE_OUTSIDE_SCHEDULE,
  type EntryByWallet,
} from '../bounty-winners';

const FEE = 500;
const DEADLINE = 1_000_000;
const TOKEN = { symbol: 'USDT', decimals: 6 };
const ADA = '0x00000000000000000000000000000000000000Aa';
const BOB = '0x00000000000000000000000000000000000000Bb';
const STRANGER = '0x00000000000000000000000000000000000000cC';

const entries: EntryByWallet = new Map([
  [ADA.toLowerCase(), { author: 'ada', notebookSlug: 'ada-notebook' }],
  [BOB.toLowerCase(), { author: 'bob', notebookSlug: 'bob-notebook' }],
]);

// What the escrow emits for a prize: the winner is paid the gross less the fee.
const paid = (winner: string, net: number, paidAt?: number | null) => {
  const gross = grossFor(BigInt(net), FEE);
  const fee = (gross * BigInt(FEE)) / 10_000n;
  return { winner, amount: gross - fee, fee, paidAt };
};

const tiers = [6_000_000n, 3_000_000n, 1_000_000n];
const base = { tiers, feeBps: FEE, deadline: DEADLINE, entries, token: TOKEN };

describe('buildWinners with a prize schedule', () => {
  it('puts each payment in the place its amount was agreed for, best first', () => {
    const winners = buildWinners({
      ...base,
      awards: [
        paid(BOB, 3_000_000, DEADLINE + 5),
        paid(ADA, 6_000_000, DEADLINE + 9),
      ],
    });
    expect(winners.map((w) => [w.place, w.author])).toEqual([
      ['1st', 'ada'],
      ['2nd', 'bob'],
    ]);
    expect(winners[0].notebookSlug).toBe('ada-notebook');
    expect(winners.every((w) => w.notes?.length === 0)).toBe(true);
  });

  it("flags a payment that is no place's prize", () => {
    const odd = { winner: ADA, amount: 123n, fee: 6n, paidAt: DEADLINE + 1 };
    const [winner] = buildWinners({ ...base, awards: [odd] });
    expect(winner.place).toBe('Outside the schedule');
    expect(winner.notes).toEqual([NOTE_OUTSIDE_SCHEDULE]);
  });

  it('flags a wallet no entry gave, and names it by its address', () => {
    const [winner] = buildWinners({
      ...base,
      awards: [paid(STRANGER, 6_000_000, DEADLINE + 1)],
    });
    expect(winner.place).toBe('1st');
    expect(winner.author).toBe('0x0000...00cC');
    expect(winner.notes).toEqual([NOTE_NO_ENTRY]);
  });

  it('flags a payment made on or before the deadline, but not when the time is unknown', () => {
    const [early] = buildWinners({
      ...base,
      awards: [paid(ADA, 6_000_000, DEADLINE - 100)],
    });
    expect(early.notes).toEqual([NOTE_EARLY]);
    const [unknown] = buildWinners({
      ...base,
      awards: [paid(ADA, 6_000_000, null)],
    });
    expect(unknown.notes).toEqual([]);
  });

  it('lists payments outside the schedule after the scheduled ones', () => {
    const odd = { winner: BOB, amount: 5n, fee: 1n, paidAt: DEADLINE + 1 };
    const winners = buildWinners({
      ...base,
      awards: [odd, paid(ADA, 1_000_000, DEADLINE + 1)],
    });
    expect(winners.map((w) => w.place)).toEqual([
      '3rd',
      'Outside the schedule',
    ]);
  });

  it('shows the amount received after the fee', () => {
    const [winner] = buildWinners({
      ...base,
      awards: [paid(ADA, 6_000_000, DEADLINE + 1)],
    });
    // A 6 USDT prize is awarded as 6.315790 so the 5% fee (0.315789) leaves 6.000001: never short.
    // It is shown to the cent.
    expect(winner.amount).toBe('6 USDT');
  });
});

describe('buildWinners for a bounty with no schedule', () => {
  it('keeps one winner per wallet with the sum, ranked by what they received, and adds no notes', () => {
    const winners = buildWinners({
      ...base,
      tiers: [],
      awards: [
        { winner: BOB, amount: 100_000_000n, fee: 0n },
        { winner: ADA, amount: 400_000_000n, fee: 0n },
        { winner: BOB, amount: 400_000_000n, fee: 0n },
      ],
    });
    expect(winners.map((w) => [w.place, w.author, w.amount])).toEqual([
      ['1st', 'bob', '500 USDT'],
      ['2nd', 'ada', '400 USDT'],
    ]);
    expect(winners.every((w) => w.notes === undefined)).toBe(true);
  });
});
