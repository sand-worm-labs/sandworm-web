import { describe, expect, it } from "vitest";
import {
  assignPlaces,
  depositFor,
  escrowPhase,
  feeFor,
  grossFor,
  payoutFor,
} from "@sandworm/types/escrow";
import { BaseError } from "viem";

import { planAward } from "../award";
import { describeError } from "../errors";
import { formatToken } from "../format";

const WINNER = "0x000000000000000000000000000000000000dEaD";
const OTHER = "0x000000000000000000000000000000000000bEEF";
const USDG = 6;

describe("planAward", () => {
  const FEE = 500;
  const tier = (place: number, net: number) => ({
    place,
    net: BigInt(net),
    gross: grossFor(BigInt(net), FEE),
  });
  const tiers = [tier(1, 6_000_000), tier(2, 3_000_000), tier(3, 1_000_000)];
  const entry = (id: string, wallet: string | null) => ({
    id,
    author: id,
    notebookTitle: `${id} notebook`,
    wallet,
  });
  const entries = [
    entry("ada", WINNER),
    entry("bob", OTHER),
    entry("eve", null),
  ];
  const base = {
    tiers,
    taken: new Set<number>(),
    entries,
    remaining: depositFor(
      tiers.map(t => t.net),
      FEE
    ),
    feeBps: FEE,
  };

  it("pays each place its scheduled amount, to the wallet its entry gave", () => {
    const plan = planAward({ ...base, choices: { 1: "ada", 2: "bob" } });
    expect(plan.errors).toEqual([]);
    expect(plan.winners).toEqual([WINNER, OTHER]);
    expect(plan.amounts).toEqual([tiers[0]?.gross, tiers[1]?.gross]);
    // After the fee the winners are left with the prizes, give or take a unit
    plan.lines.forEach(line => {
      const left = line.gross - line.fee;
      expect(left >= line.net && left <= line.net + BigInt(1)).toBe(true);
    });
  });

  it("lets places stay empty, and needs at least one winner", () => {
    expect(planAward({ ...base, choices: { 3: "ada" } }).errors).toEqual([]);
    expect(planAward({ ...base, choices: {} }).errors).toEqual([
      "Pick a winner for at least one place.",
    ]);
  });

  it("will not pay an entry with no wallet, or one entry twice", () => {
    expect(planAward({ ...base, choices: { 1: "eve" } }).errors[0]).toContain(
      "gave no wallet"
    );
    expect(
      planAward({ ...base, choices: { 1: "ada", 2: "ada" } }).errors
    ).toContain("@ada can win only one place.");
  });

  it("says so when the wallet an entry gave is not an address", () => {
    const broken = [entry("ada", "0x123"), ...entries.slice(1)];
    expect(
      planAward({ ...base, entries: broken, choices: { 1: "ada" } }).errors[0]
    ).toContain("is not a valid address");
  });

  it("will not pay two entries to the same wallet", () => {
    const same = [entry("ada", WINNER), entry("bob", WINNER.toLowerCase())];
    expect(
      planAward({ ...base, entries: same, choices: { 1: "ada", 2: "bob" } })
        .errors
    ).toContain("Two places would pay the same wallet.");
  });

  it("will not pay a place twice", () => {
    expect(
      planAward({ ...base, taken: new Set([1]), choices: { 1: "ada" } }).errors
    ).toContain("Place 1 has already been paid.");
  });

  it("never pays more than the escrow holds", () => {
    const plan = planAward({
      ...base,
      remaining: BigInt(1),
      choices: { 1: "ada" },
    });
    expect(plan.errors).toContain(
      "This is more than what is left in the escrow."
    );
  });
});

describe("prize schedule", () => {
  it("grosses a prize up so the fee leaves the winner the prize", () => {
    // 5% fee: a 950 prize needs 1000 awarded
    expect(grossFor(BigInt(950), 500)).toBe(BigInt(1000));
    expect(grossFor(BigInt(1000), 0)).toBe(BigInt(1000));
    // Rounds up, so a winner is never short
    const gross = grossFor(BigInt(1_000_001), 500);
    expect(payoutFor(gross, 500) >= BigInt(1_000_001)).toBe(true);
  });

  it("adds up the deposit of a whole schedule", () => {
    const nets = [BigInt(6_000_000), BigInt(3_000_000), BigInt(1_000_000)];
    const deposit = depositFor(nets, 500);
    expect(deposit).toBe(
      nets.reduce((sum, n) => sum + grossFor(n, 500), BigInt(0))
    );
    expect(deposit > BigInt(10_000_000)).toBe(true);
  });

  it("reads which place each payment was for", () => {
    const nets = [BigInt(6_000_000), BigInt(3_000_000), BigInt(3_000_000)];
    const paid = (net: bigint) => {
      const gross = grossFor(net, 500);
      return { amount: gross - feeFor(gross, 500), fee: feeFor(gross, 500) };
    };
    const { places, taken } = assignPlaces(
      nets,
      [
        paid(BigInt(3_000_000)),
        paid(BigInt(6_000_000)),
        paid(BigInt(3_000_000)),
      ],
      500
    );
    // Equal prizes take their places in order
    expect(places).toEqual([2, 1, 3]);
    expect(Array.from(taken).sort()).toEqual([0, 1, 2]);
  });

  it("marks a payment that matches no place as outside the schedule", () => {
    const { places, taken } = assignPlaces(
      [BigInt(6_000_000)],
      [{ amount: BigInt(123), fee: BigInt(6) }],
      500
    );
    expect(places).toEqual([null]);
    expect(taken.size).toBe(0);
  });
});

describe("escrow rules", () => {
  it("takes the fee out of each award, as the contract does", () => {
    expect(feeFor(BigInt(500_000_000), 500)).toBe(BigInt(25_000_000));
    expect(payoutFor(BigInt(500_000_000), 500)).toBe(BigInt(475_000_000));
    expect(feeFor(BigInt(19), 500)).toBe(BigInt(0));
  });

  it("moves from open to judging to refundable around the deadline", () => {
    const deadline = 1_000_000;
    const day = 86_400;
    expect(escrowPhase(deadline, false, deadline)).toBe("open");
    expect(escrowPhase(deadline, false, deadline + 1)).toBe("judging");
    expect(escrowPhase(deadline, false, deadline + 14 * day)).toBe("judging");
    expect(escrowPhase(deadline, false, deadline + 14 * day + 1)).toBe(
      "refundable"
    );
    expect(escrowPhase(deadline, true, deadline + 100 * day)).toBe("closed");
  });
});

describe("formatting and errors", () => {
  it("formats token amounts", () => {
    expect(formatToken(BigInt(1_234_567_890), USDG)).toBe("1,234.56789");
    expect(formatToken(BigInt(1_000_000), USDG)).toBe("1");
  });

  it("explains a rejected wallet request", () => {
    expect(describeError(new BaseError("User rejected the request."))).toMatch(
      /cancelled/
    );
    expect(describeError(new Error("boom"))).toBe("boom");
  });
});
