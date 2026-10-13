import { describe, expect, it } from "vitest";

import { explainTrustFailure } from "../trustFailure";

describe("explainTrustFailure", () => {
  it("tells someone whose cells have not run to run them", () => {
    const failure = explainTrustFailure(
      "Run the notebook first: none of its cells has a result yet. Run it, then verify it."
    );
    expect(failure.steps[0]).toMatch(/run every cell/i);
  });

  it("explains that only cloud notebooks can be verified", () => {
    const failure = explainTrustFailure(
      "This is a Live notebook: it runs in the browser"
    );
    expect(failure.steps.join(" ")).toMatch(/Cloud/);
  });

  it("points at the failing cell when the re-run failed", () => {
    const failure = explainTrustFailure(
      "a cell failed when the notebook was run again"
    );
    expect(failure.message).toBe(
      "A cell failed when the notebook was run again."
    );
    expect(failure.steps.join(" ")).toMatch(/error/i);
  });

  it("says verification is off when the server is not set up", () => {
    const failure = explainTrustFailure(
      "Onchain attestation is not set up on this server"
    );
    expect(failure.steps.join(" ")).toMatch(/set it up/i);
  });

  it("makes the reason a sentence", () => {
    expect(
      explainTrustFailure("the notebook changed while it was being checked")
        .message
    ).toBe("The notebook changed while it was being checked.");
  });

  it("still helps when the reason is unknown or missing", () => {
    expect(explainTrustFailure(null).message).toBe(
      "The notebook could not be verified."
    );
    expect(explainTrustFailure("something odd").steps.length).toBeGreaterThan(
      0
    );
  });
});
