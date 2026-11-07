import { describe, expect, it } from "vitest";

import type { TeamClientDraft } from "@/types";

import {
  canLeaveDetails,
  describeInvite,
  isValidEmail,
  toggleId,
} from "./draft";

const draft = (
  details: Partial<TeamClientDraft["details"]>
): TeamClientDraft => ({
  details: {
    name: "Robinhood",
    website: "robinhood.com",
    type: "exchange",
    description: "",
    plan: "pro",
    adminName: "Maya Chen",
    adminEmail: "maya@robinhood.com",
    ...details,
  },
  tracking: {
    addresses: "",
    autoDiscover: true,
    competitors: [],
    regions: [],
    shareInternalData: false,
  },
  starterIds: [],
  inviteTiming: "when_ready",
});

describe("isValidEmail", () => {
  it("accepts an address and rejects things that are not one", () => {
    expect(isValidEmail("maya@robinhood.com")).toBe(true);
    expect(isValidEmail("  maya@robinhood.com ")).toBe(true);
    expect(isValidEmail("maya@")).toBe(false);
    expect(isValidEmail("maya robinhood.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("canLeaveDetails", () => {
  it("needs a client name and a valid admin email", () => {
    expect(canLeaveDetails(draft({}))).toBe(true);
    expect(canLeaveDetails(draft({ name: "   " }))).toBe(false);
    expect(canLeaveDetails(draft({ adminEmail: "not an email" }))).toBe(false);
  });

  it("does not need the admin's name or the website", () => {
    expect(canLeaveDetails(draft({ adminName: "", website: "" }))).toBe(true);
  });
});

describe("toggleId", () => {
  it("adds a missing id and removes a present one, without mutating", () => {
    const ids = ["a", "b"];

    expect(toggleId(ids, "c")).toEqual(["a", "b", "c"]);
    expect(toggleId(ids, "a")).toEqual(["b"]);
    expect(ids).toEqual(["a", "b"]);
  });
});

describe("describeInvite", () => {
  it("names the admin and their email", () => {
    expect(describeInvite(draft({}))).toBe(
      "Maya Chen, maya@robinhood.com, as admin."
    );
  });

  it("copes with a missing name or nothing at all", () => {
    expect(describeInvite(draft({ adminName: "" }))).toBe(
      "maya@robinhood.com, as admin."
    );
    expect(describeInvite(draft({ adminName: "", adminEmail: "" }))).toBe(
      "Add the client admin on the first step."
    );
  });
});
