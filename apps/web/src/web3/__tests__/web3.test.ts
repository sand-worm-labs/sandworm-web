import { describe, expect, it } from "vitest";
import { escrowPhase, feeFor, payoutFor } from "@sandworm/types/escrow";
import { BaseError } from "viem";

import { checkAward } from "../award";
import { describeError } from "../errors";
import { formatToken } from "../format";

const WINNER = "0x000000000000000000000000000000000000dEaD";
const OTHER = "0x000000000000000000000000000000000000bEEF";
const USDG = 6;

describe("checkAward", () => {
  const remaining = BigInt(1_000_000_000);

  it("accepts winners within what is left", () => {
    const check = checkAward(
      [
        { address: WINNER, amount: "500" },
        { address: OTHER, amount: "250.5" },
      ],
      remaining,
      USDG
    );
    expect(check.errors).toEqual([]);
    expect(check.amounts).toEqual([BigInt(500_000_000), BigInt(250_500_000)]);
    expect(check.total).toBe(BigInt(750_500_000));
  });

  it("rejects bad addresses, amounts and totals", () => {
    expect(
      checkAward([{ address: "nope", amount: "1" }], remaining, USDG).errors[0]
    ).toMatch(/address/);
    expect(
      checkAward([{ address: WINNER, amount: "0" }], remaining, USDG).errors[0]
    ).toMatch(/greater than zero/);
    expect(
      checkAward([{ address: WINNER, amount: "abc" }], remaining, USDG)
        .errors[0]
    ).toMatch(/not a number/);
    expect(
      checkAward([{ address: WINNER, amount: "1001" }], remaining, USDG).errors
    ).toContain("The total is more than what is left in the escrow.");
    expect(checkAward([], remaining, USDG).errors).toContain(
      "Add at least one winner."
    );
  });

  it("rejects the same winner twice and more than 50 winners", () => {
    const twice = checkAward(
      [
        { address: WINNER, amount: "1" },
        { address: WINNER.toLowerCase(), amount: "1" },
      ],
      remaining,
      USDG
    );
    expect(twice.errors).toContain("Each winner can appear only once.");

    const many = Array.from({ length: 51 }, (_, i) => ({
      address: `0x${(i + 1).toString(16).padStart(40, "0")}`,
      amount: "1",
    }));
    expect(checkAward(many, BigInt("1000000000000"), USDG).errors).toContain(
      "At most 50 winners."
    );
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
