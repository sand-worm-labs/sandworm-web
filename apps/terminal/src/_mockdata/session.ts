import type { MockClientId } from "@/_mockdata/clients";
import type { Session } from "@/types";

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

export const sessionMockData: Record<MockClientId, Session> = {
  exchange: buildSession({ clientName: "Acme", userName: "Alex Morgan" }),
  protocol: buildSession({ clientName: "Aave", userName: "Lena Ortiz" }),
  chain: buildSession({ clientName: "Base", userName: "Ama Mensah" }),
  vc: buildSession({ clientName: "Kestrel Ventures", userName: "Rhea Kapoor" }),
  accelerator: buildSession({
    clientName: "Y Combinator",
    userName: "Sam Okafor",
  }),
  other: buildSession({ clientName: "Northwind", userName: "Alex Morgan" }),
  paycrest: buildSession({
    clientName: "Paycrest",
    userName: "Paycrest team",
  }),
};
