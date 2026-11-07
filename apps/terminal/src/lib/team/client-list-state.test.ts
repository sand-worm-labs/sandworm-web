import { describe, expect, it } from "vitest";

import { countByStatus, countByType, filterClients } from "./client-list-state";
import type { TeamClientSummary } from "./types";

const client = (
  init: Partial<TeamClientSummary> & { name: string }
): TeamClientSummary => ({
  id: init.name,
  type: "exchange",
  plan: "pro",
  status: "live",
  adminEmail: null,
  createdAt: "2026-11-02T10:00:00.000Z",
  ...init,
});

const clients = [
  client({ name: "Robinhood", adminEmail: "maya@robinhood.com" }),
  client({ name: "Aave", type: "protocol", status: "setting_up" }),
  client({ name: "Base", type: "chain", status: "invite_sent" }),
  client({ name: "Phantom", adminEmail: "ops@phantom.app" }),
];

describe("filterClients", () => {
  it("returns everything for all types and an empty search", () => {
    expect(filterClients(clients, { type: "all", query: "  " })).toHaveLength(
      4
    );
  });

  it("filters by type", () => {
    expect(
      filterClients(clients, { type: "exchange", query: "" }).map(c => c.name)
    ).toEqual(["Robinhood", "Phantom"]);
  });

  it("searches the name and the admin's email, ignoring case", () => {
    expect(
      filterClients(clients, { type: "all", query: "AAVE" }).map(c => c.name)
    ).toEqual(["Aave"]);
    expect(
      filterClients(clients, { type: "all", query: "phantom.app" }).map(
        c => c.name
      )
    ).toEqual(["Phantom"]);
  });

  it("combines a type with a search", () => {
    expect(filterClients(clients, { type: "exchange", query: "aave" })).toEqual(
      []
    );
  });
});

describe("counts", () => {
  it("counts by type and by status", () => {
    expect(countByType(clients, "all")).toBe(4);
    expect(countByType(clients, "chain")).toBe(1);
    expect(countByStatus(clients, "live")).toBe(2);
    expect(countByStatus(clients, "setting_up")).toBe(1);
  });
});
