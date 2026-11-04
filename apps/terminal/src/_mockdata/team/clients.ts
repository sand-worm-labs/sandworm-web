import type { TeamClientSummary } from "@/features/team/types";

const client = (
  init: Omit<TeamClientSummary, "id" | "createdAt"> & { daysAgo: number }
): TeamClientSummary => {
  const { daysAgo, ...rest } = init;
  return {
    ...rest,
    id: rest.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    createdAt: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
  };
};

export const teamClientsMockData: readonly TeamClientSummary[] = [
  client({
    name: "Robinhood",
    type: "exchange",
    plan: "pro",
    status: "setting_up",
    adminEmail: "maya@robinhood.com",
    daysAgo: 0,
  }),
  client({
    name: "Aave",
    type: "protocol",
    plan: "enterprise",
    status: "live",
    adminEmail: "lena@aave.com",
    daysAgo: 21,
  }),
  client({
    name: "Base",
    type: "chain",
    plan: "enterprise",
    status: "live",
    adminEmail: "ama@base.org",
    daysAgo: 30,
  }),
  client({
    name: "Kestrel Ventures",
    type: "vc",
    plan: "pro",
    status: "live",
    adminEmail: "rhea@kestrel.vc",
    daysAgo: 45,
  }),
  client({
    name: "Y Combinator",
    type: "accelerator",
    plan: "pro",
    status: "live",
    adminEmail: "sam@ycombinator.com",
    daysAgo: 60,
  }),
  client({
    name: "Phantom",
    type: "exchange",
    plan: "starter",
    status: "invite_sent",
    adminEmail: "ops@phantom.app",
    daysAgo: 3,
  }),
  client({
    name: "Morpho",
    type: "protocol",
    plan: "pro",
    status: "setting_up",
    adminEmail: "team@morpho.org",
    daysAgo: 1,
  }),
  client({
    name: "Northfield Capital",
    type: "vc",
    plan: "starter",
    status: "live",
    adminEmail: "ops@northfield.capital",
    daysAgo: 90,
  }),
];
