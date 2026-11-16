import { describe, expect, it } from "vitest";

import {
  canSubmitAccessRequest,
  EMPTY_REQUEST_ACCESS_DRAFT,
} from "./request-draft";

describe("canSubmitAccessRequest", () => {
  it("needs an organisation, and nothing else", () => {
    expect(canSubmitAccessRequest(EMPTY_REQUEST_ACCESS_DRAFT)).toBe(false);
    expect(
      canSubmitAccessRequest({ organisation: "   ", interest: "Anything" })
    ).toBe(false);
    expect(
      canSubmitAccessRequest({ organisation: "Robinhood", interest: "" })
    ).toBe(true);
  });
});
