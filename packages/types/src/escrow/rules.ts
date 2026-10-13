export const JUDGING_PERIOD_SECONDS = 14 * 24 * 60 * 60;
export const MAX_WINNERS = 50;
export const BPS = 10_000n;

export const feeFor = (amount: bigint, feeBps: number | bigint) => (amount * BigInt(feeBps)) / BPS;

export const payoutFor = (amount: bigint, feeBps: number | bigint) => amount - feeFor(amount, feeBps);

export type EscrowPhase = "open" | "judging" | "refundable" | "closed";

export const escrowPhase = (deadline: number | bigint, closed: boolean, now = Math.floor(Date.now() / 1000)): EscrowPhase => {
  if (closed) return "closed";
  const end = Number(deadline);
  if (now <= end) return "open";
  return now <= end + JUDGING_PERIOD_SECONDS ? "judging" : "refundable";
};

// =====================================
// ⬢ Prize schedule
// =====================================
// A bounty's prizes are fixed when it is created: an ordered list of what each place's winner
// receives. The contract takes its fee out of each award, so to pay a winner exactly their prize
// the escrow is given a little more, and each award is sent at that grossed-up amount.

// The fee for a new bounty, until the contract is asked. The contract's own value is read when
// the escrow is funded and is what counts.
export const DEFAULT_FEE_BPS = 500;

// The most places a schedule can have.
export const MAX_PRIZE_PLACES = 10;

// What to award so that, after the fee, the winner is left with at least `net`. Rounded up, so
// a winner is never paid less than the prize, and never more than 1 unit over it.
export const grossFor = (net: bigint, feeBps: number | bigint) => {
  const keep = BPS - BigInt(feeBps);
  return (net * BPS + keep - 1n) / keep;
};

// What the sponsor deposits to fund every place of a schedule in full.
export const depositFor = (nets: bigint[], feeBps: number | bigint) =>
  nets.reduce((sum, net) => sum + grossFor(net, feeBps), 0n);

export type PaidAward = { amount: bigint; fee: bigint };

// Which place each payment was for, read from what the escrow actually paid. An award is for the
// first place not yet taken whose grossed-up prize equals what left the escrow (the amount paid
// plus the fee). A payment that matches no place is outside the schedule, and is null. Places
// with equal prizes are interchangeable, so taking them in order loses nothing.
export const assignPlaces = (nets: bigint[], awards: PaidAward[], feeBps: number | bigint) => {
  const grosses = nets.map(net => grossFor(net, feeBps));
  const taken = new Set<number>();
  const places = awards.map(award => {
    const paid = award.amount + award.fee;
    const index = grosses.findIndex((gross, i) => !taken.has(i) && gross === paid);
    if (index === -1) return null;
    taken.add(index);
    return index + 1;
  });
  return { places, taken };
};
