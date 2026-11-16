import {
  ClientStatusId,
  OrganisationTypeId,
  PlanId,
} from "@sandworm/types/terminal";

import type { TeamClientSummary } from "@/types";

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
    type: OrganisationTypeId.EXCHANGE,
    plan: PlanId.PRO,
    status: ClientStatusId.SETTING_UP,
    adminEmail: "maya@robinhood.com",
    daysAgo: 0,
  }),
  client({
    name: "Aave",
    type: OrganisationTypeId.PROTOCOL,
    plan: PlanId.ENTERPRISE,
    status: ClientStatusId.LIVE,
    adminEmail: "lena@aave.com",
    daysAgo: 21,
  }),
  client({
    name: "Base",
    type: OrganisationTypeId.CHAIN,
    plan: PlanId.ENTERPRISE,
    status: ClientStatusId.LIVE,
    adminEmail: "ama@base.org",
    daysAgo: 30,
  }),
  client({
    name: "Kestrel Ventures",
    type: OrganisationTypeId.VC,
    plan: PlanId.PRO,
    status: ClientStatusId.LIVE,
    adminEmail: "rhea@kestrel.vc",
    daysAgo: 45,
  }),
  client({
    name: "Y Combinator",
    type: OrganisationTypeId.ACCELERATOR,
    plan: PlanId.PRO,
    status: ClientStatusId.LIVE,
    adminEmail: "sam@ycombinator.com",
    daysAgo: 60,
  }),
  client({
    name: "Phantom",
    type: OrganisationTypeId.EXCHANGE,
    plan: PlanId.STARTER,
    status: ClientStatusId.INVITE_SENT,
    adminEmail: "ops@phantom.app",
    daysAgo: 3,
  }),
  client({
    name: "Morpho",
    type: OrganisationTypeId.PROTOCOL,
    plan: PlanId.PRO,
    status: ClientStatusId.SETTING_UP,
    adminEmail: "team@morpho.org",
    daysAgo: 1,
  }),
  client({
    name: "Northfield Capital",
    type: OrganisationTypeId.VC,
    plan: PlanId.STARTER,
    status: ClientStatusId.LIVE,
    adminEmail: "ops@northfield.capital",
    daysAgo: 90,
  }),
];
