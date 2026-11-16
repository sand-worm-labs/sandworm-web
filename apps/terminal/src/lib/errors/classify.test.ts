import { describe, expect, it } from "vitest";

import { errorKindOf } from "./classify";

const error = (message: string, extra: object = {}) =>
  Object.assign(new Error(message), extra);

describe("errorKindOf", () => {
  it("goes by the status code first", () => {
    expect(errorKindOf(error("x", { statusCode: 503 }))).toBe("server");
    expect(errorKindOf(error("x", { statusCode: 403 }))).toBe("auth");
    expect(errorKindOf(error("x", { statusCode: 401 }))).toBe("auth");
  });

  it("knows the errors a failed call to the API gives", () => {
    expect(errorKindOf(error("fetch failed"))).toBe("network");
    expect(errorKindOf(error("x", { code: "ECONNREFUSED" }))).toBe("server");
    expect(
      errorKindOf(error('[api] relation "terminal_kpi" does not exist'))
    ).toBe("database");
    expect(errorKindOf(error("[api] Forbidden resource"))).toBe("auth");
  });

  it("falls back to a general error", () => {
    expect(errorKindOf(error("Cannot read properties of undefined"))).toBe(
      "client"
    );
  });

  it("reads Next's hidden production message as a server problem", () => {
    expect(
      errorKindOf(
        error(
          "An error occurred in the Server Components render. The specific message is omitted in production builds"
        )
      )
    ).toBe("server");
  });
});
