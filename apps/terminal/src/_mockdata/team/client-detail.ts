import type { TeamClientDetail, TeamClientSource } from "@/types";

import { teamClientsMockData } from "./clients";

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();
const ahead = (days: number) => new Date(Date.now() + days * DAY).toISOString();

const source = (
  init: Pick<TeamClientSource, "documentId" | "title" | "cells" | "items"> &
    Partial<TeamClientSource>
): TeamClientSource => ({
  path: `/workspace/preview/documents/${init.documentId}`,
  lastRanAt: ago(1),
  schedule: { isActive: true, nextRunAt: ahead(1), lastRunAt: ago(1) },
  ...init,
});

// What the preview shows on a client's page: the same story for every client,
// with a stale notebook so the "needs attention" list has something to say.
const sources: readonly TeamClientSource[] = [
  source({
    documentId: "paycrest-payouts",
    title: "Paycrest: payouts by country",
    cells: 4,
    items: 6,
  }),
  source({
    documentId: "cash-out-fees",
    title: "Cash-out fees by route",
    cells: 3,
    items: 4,
    lastRanAt: ago(2),
  }),
  source({
    documentId: "leaver-destinations",
    title: "Where users go when they leave",
    cells: 2,
    items: 2,
    lastRanAt: ago(12),
    schedule: null,
  }),
];

export function getTeamClientMockData(
  id: string
): TeamClientDetail | undefined {
  const client = teamClientsMockData.find(candidate => candidate.id === id);
  if (!client) return undefined;

  const isLive = client.status === "live";
  return {
    ...client,
    website: `https://${client.id}.example`,
    description: "",
    members: isLive ? 4 : client.status === "invite_sent" ? 0 : 1,
    lastReadAt: isLive ? ago(1) : null,
    openRequests: isLive ? 2 : 0,
    newSignals: isLive ? 3 : 0,
    researchAllowance: 5,
    sources: isLive ? [...sources] : [],
  };
}
