import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";
import type { Session } from "@/features/session/types";

type ClientSeed = { clientName: string; userName: string };

function buildSession(seed: ClientSeed): Session {
  return {
    user: { name: seed.userName },
    client: {
      name: seed.clientName,
      firstBriefingDays: 2,
    },
  };
}

export const sessionMockData: Record<OrganisationTypeId, Session> = {
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
