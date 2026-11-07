"use server";

import { redirect } from "next/navigation";

import { signInUrl } from "@/lib/auth/sign-in";
import { getPreviewAccess } from "@/lib/preview/cookies";
import { ApiUnauthenticatedError, gql } from "@/lib/api";

import { TEAM_CLIENT_FIELDS } from "./api";
import { TEAM_CLIENTS_PATH } from "./routes";
import type { TeamClientDraft, TeamClientSummary } from "./types";

const CREATE_TERMINAL_CLIENT = `
  mutation CreateTerminalClient($input: TerminalTeamClientDraftInput!) {
    createTerminalClient(input: $input) { ${TEAM_CLIENT_FIELDS} }
  }
`;

const SEND_TERMINAL_INVITE = `
  mutation SendTerminalInvite($clientId: String!) {
    sendTerminalInvite(clientId: $clientId) { ${TEAM_CLIENT_FIELDS} }
  }
`;

// Someone who isn't signed in is sent to sign in, and comes back to the team.
async function asTeam<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    if (err instanceof ApiUnauthenticatedError) {
      redirect(signInUrl(TEAM_CLIENTS_PATH));
    }
    throw err;
  }
}

// A dev preview creates nothing: there is no API to ask.
export async function createTeamClient(
  draft: TeamClientDraft
): Promise<{ name: string }> {
  if (await getPreviewAccess()) return { name: draft.details.name };

  const data = await asTeam(() =>
    gql<{ createTerminalClient: TeamClientSummary }>(CREATE_TERMINAL_CLIENT, {
      input: draft,
    })
  );
  return { name: data.createTerminalClient.name };
}

export async function sendTeamInvite(clientId: string): Promise<void> {
  if (await getPreviewAccess()) return;

  await asTeam(() => gql(SEND_TERMINAL_INVITE, { clientId }));
}
