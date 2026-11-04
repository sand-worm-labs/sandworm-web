import { describe, expect, it } from "vitest";

import { canApprove } from "../requests-state";

import { requestFixtures } from ".";

const datasets = Object.entries(requestFixtures).map(([clientKind, data]) => ({
  clientKind,
  data,
}));

describe("request fixtures", () => {
  it.each(datasets)("$clientKind: requests have unique ids", ({ data }) => {
    const ids = data.research.map(request => request.id);

    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(datasets)(
    "$clientKind: every timeline has exactly one current step or is finished",
    ({ data }) => {
      data.research.forEach(request => {
        const current = request.steps.filter(step => step.state === "next");
        const isFinished = ["Delivered", "Declined"].includes(request.status);

        expect(current.length).toBe(isFinished ? 0 : 1);
      });
    }
  );

  it.each(datasets)(
    "$clientKind: a request that can be approved has room in the allowance",
    ({ data }) => {
      const approvable = data.research.filter(canApprove);

      approvable.forEach(() => {
        expect(data.allowance.research.used).toBeLessThan(
          data.allowance.research.total
        );
      });
    }
  );
});
