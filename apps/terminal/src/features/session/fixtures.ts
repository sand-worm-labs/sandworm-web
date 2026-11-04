import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

import type { Analyst, Session } from "./types";

export const analystFixture: Analyst = {
  name: "Tobi",
  fullName: "Tobi Adeyemi",
  initials: "TA",
  role: "Senior analyst, Sandworm",
};

type ClientSeed = { clientName: string; userName: string };

function buildSession(seed: ClientSeed): Session {
  return {
    user: { name: seed.userName },
    client: {
      name: seed.clientName,
      analyst: analystFixture,
      kickoffCall: { when: "Thu 5 Nov, 15:00 PT · 30 minutes" },
      firstBriefingDays: 2,
    },
  };
}

export const sessionFixtures: Record<OrganisationTypeId, Session> = {
  exchange: buildSession({ clientName: "Robinhood", userName: "Maya Chen" }),
  nft: buildSession({ clientName: "OpenSea", userName: "Jordan Lee" }),
  protocol: buildSession({ clientName: "Aave", userName: "Lena Ortiz" }),
  chain: buildSession({ clientName: "Base", userName: "Ama Mensah" }),
  vc: buildSession({ clientName: "Kestrel Ventures", userName: "Rhea Kapoor" }),
  accelerator: buildSession({
    clientName: "Y Combinator",
    userName: "Sam Okafor",
  }),
};
