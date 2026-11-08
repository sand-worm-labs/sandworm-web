import { starterResearchMockData } from "@/_mockdata/team/starter-research";
import { teamClientsMockData } from "@/_mockdata/team/clients";
import { getTeamClientMockData } from "@/_mockdata/team/client-detail";
import { teamKpisMockData } from "@/_mockdata/team/kpis";
import { getPreviewAccess } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import type {
  StarterResearch,
  TeamClientDetail,
  TeamClientSummary,
  TeamKpi,
} from "@/types";

import {
  TEAM_CLIENT_DETAIL_FIELDS,
  TEAM_CLIENT_FIELDS,
  TEAM_KPI_FIELDS,
} from "./api";

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

const TERMINAL_CLIENT = `
  query TerminalClient($clientId: String!) {
    terminalClient(clientId: $clientId) { ${TEAM_CLIENT_DETAIL_FIELDS} }
  }
`;

// One client with who reads it, what is open and the notebooks it is built
// from. Undefined when there is no such client.
export async function getTeamClient(
  id: string
): Promise<TeamClientDetail | undefined> {
  if (await getPreviewAccess()) return getTeamClientMockData(id);

  try {
    const data = await gql<{ terminalClient: TeamClientDetail }>(
      TERMINAL_CLIENT,
      { clientId: id }
    );
    return data.terminalClient;
  } catch (err) {
    if (err instanceof Error && /no such client/i.test(err.message)) {
      return undefined;
    }
    throw err;
  }
}

const TERMINAL_CLIENT_KPIS = `
  query TerminalClientKpis($clientId: String!) {
    terminalClientKpis(clientId: $clientId) { ${TEAM_KPI_FIELDS} }
  }
`;

// A client's key numbers, hidden ones too, with how each reads now
export async function getTeamClientKpis(clientId: string): Promise<TeamKpi[]> {
  if (await getPreviewAccess()) return [...teamKpisMockData];

  const data = await gql<{ terminalClientKpis: TeamKpi[] }>(
    TERMINAL_CLIENT_KPIS,
    { clientId }
  );
  return data.terminalClientKpis;
}

// The existing research a new client could start with, by client type. Today a
// fixed list; later the notebooks run during setup supply it.
export async function getStarterResearch(): Promise<
  typeof starterResearchMockData
> {
  return starterResearchMockData;
}

export type { StarterResearch };
