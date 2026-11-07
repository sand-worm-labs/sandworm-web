import { describe, expect, it } from "vitest";

import { resolveAccess } from "./resolve-access";

describe("resolveAccess", () => {
  it("sends someone who is not signed in to sign in", () => {
    expect(resolveAccess(null, false)).toEqual({ _tag: "signedOut" });
    expect(resolveAccess(null, true)).toEqual({ _tag: "signedOut" });
  });

  it("keeps a signed-in visitor without a client out, and remembers their email", () => {
    expect(resolveAccess({ email: "maya@robinhood.com" }, false)).toEqual({
      _tag: "noClient",
      email: "maya@robinhood.com",
    });
  });

  it("copes with an account that has no email", () => {
    expect(resolveAccess({ email: null }, false)).toEqual({
      _tag: "noClient",
      email: null,
    });
  });

  it("lets a member of a client in", () => {
    expect(resolveAccess({ email: "maya@robinhood.com" }, true)).toEqual({
      _tag: "allowed",
    });
  });
});
