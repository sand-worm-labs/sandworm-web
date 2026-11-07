import { starterResearchMockData } from "@/_mockdata/team/starter-research";
import { teamClientsMockData } from "@/_mockdata/team/clients";
import { getPreviewAccess } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";

import { TEAM_CLIENT_FIELDS } from "./api";
import type { StarterResearch, TeamClientSummary } from "./types";

const TERMINAL_CLIENTS = `query TerminalClients { terminalClients { ${TEAM_CLIENT_FIELDS} } }`;

// Every client the team looks after. A dev preview gets a fixed list, so the
// screen can be looked at without the API.
export async function listTeamClients(): Promise<TeamClientSummary[]> {
  if (await getPreviewAccess()) return [...teamClientsMockData];

  const data = await gql<{ terminalClients: TeamClientSummary[] }>(
    TERMINAL_CLIENTS
  );
  return data.terminalClients;
}

// The existing research a new client could start with, by client type. Today a
// fixed list; later the notebooks run during setup supply it.
export async function getStarterResearch(): Promise<
  typeof starterResearchMockData
> {
  return starterResearchMockData;
}

export type { StarterResearch };
