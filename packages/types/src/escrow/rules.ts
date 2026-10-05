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
