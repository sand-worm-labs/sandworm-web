import { MAX_WINNERS } from "@sandworm/types/escrow";
import { isAddress, parseUnits } from "viem";

export type AwardRow = { address: string; amount: string };

export type AwardCheck = {
  errors: string[];
  winners: `0x${string}`[];
  amounts: bigint[];
  total: bigint;
};

export const checkAward = (
  rows: AwardRow[],
  remaining: bigint,
  decimals: number
): AwardCheck => {
  const errors: string[] = [];
  const winners: `0x${string}`[] = [];
  const amounts: bigint[] = [];

  if (rows.length === 0) errors.push("Add at least one winner.");
  if (rows.length > MAX_WINNERS) errors.push(`At most ${MAX_WINNERS} winners.`);

  rows.forEach((row, index) => {
    const label = `Winner ${index + 1}`;
    let units = BigInt(0);
    try {
      units = parseUnits(row.amount || "0", decimals);
    } catch {
      errors.push(`${label}: the amount is not a number.`);
      return;
    }
    if (!isAddress(row.address))
      errors.push(`${label}: the address is not valid.`);
    else if (units <= BigInt(0))
      errors.push(`${label}: the amount must be greater than zero.`);
    else {
      winners.push(row.address);
      amounts.push(units);
    }
  });

  const total = amounts.reduce((sum, value) => sum + value, BigInt(0));
  if (total > remaining)
    errors.push("The total is more than what is left in the escrow.");
  if (
    new Set(winners.map(address => address.toLowerCase())).size !==
    winners.length
  ) {
    errors.push("Each winner can appear only once.");
  }
  return { errors, winners, amounts, total };
};
