"use server";

import { redirect } from "next/navigation";
import type { KpiDirection, KpiFormat } from "@sandworm/types/terminal";

import { signInUrl } from "@/lib/auth/sign-in";
import { getPreviewAccess } from "@/lib/preview/cookies";
import { ApiUnauthenticatedError, gql } from "@/lib/api";
import type {
  TeamClientDraft,
  TeamClientSummary,
  TeamSourceRun,
} from "@/types";

import { TEAM_CLIENT_FIELDS, TEAM_KPI_FIELDS } from "./api";
import { TEAM_CLIENTS_PATH } from "./routes";

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

const RUN_TERMINAL_SOURCE = `
  mutation RunTerminalSource($clientId: String!, $documentId: String!) {
    runTerminalSource(clientId: $clientId, documentId: $documentId) {
      status cells failed { title message }
    }
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

export type RunSourceResult =
  | { ok: true; run: TeamSourceRun }
  | { ok: false; message: string };

// Runs one of a client's notebooks as the signed-in team member. The API says
// why when it can't (no access to the notebook, already running), and that is
// what the page shows, so a refusal comes back as a result, not an error.
export async function runTeamSource(
  clientId: string,
  documentId: string
): Promise<RunSourceResult> {
  if (await getPreviewAccess()) {
    return { ok: true, run: { status: "idle", cells: 4, failed: [] } };
  }

  try {
    const data = await gql<{ runTerminalSource: TeamSourceRun }>(
      RUN_TERMINAL_SOURCE,
      { clientId, documentId }
    );
    return { ok: true, run: data.runTerminalSource };
  } catch (err) {
    if (err instanceof ApiUnauthenticatedError) {
      redirect(signInUrl(TEAM_CLIENTS_PATH));
    }
    if (err instanceof Error) {
      return { ok: false, message: err.message.replace(/^\[api\]\s*/, "") };
    }
    throw err;
  }
}

export type TeamActionResult = { ok: true } | { ok: false; message: string };

// A refusal from the API (a bad key, a key taken, no access) comes back as a
// message to show, not an error. Someone signed out is sent to sign in.
async function asResult(
  run: () => Promise<unknown>
): Promise<TeamActionResult> {
  try {
    await run();
    return { ok: true };
  } catch (err) {
    if (err instanceof ApiUnauthenticatedError) {
      redirect(signInUrl(TEAM_CLIENTS_PATH));
    }
    if (err instanceof Error) {
      return { ok: false, message: err.message.replace(/^\[api\]\s*/, "") };
    }
    throw err;
  }
}

const SAVE_TERMINAL_KPI = `
  mutation SaveTerminalKpi($clientId: String!, $input: TerminalKpiInput!) {
    saveTerminalKpi(clientId: $clientId, input: $input) { ${TEAM_KPI_FIELDS} }
  }
`;

const RECORD_TERMINAL_KPI_VALUE = `
  mutation RecordTerminalKpiValue($kpiId: String!, $input: TerminalKpiValueInput!) {
    recordTerminalKpiValue(kpiId: $kpiId, input: $input) { ${TEAM_KPI_FIELDS} }
  }
`;

const DELETE_TERMINAL_KPI = `
  mutation DeleteTerminalKpi($kpiId: String!) {
    deleteTerminalKpi(kpiId: $kpiId)
  }
`;

export type TeamKpiChange = {
  key: string;
  label?: string;
  isVisible?: boolean;
  direction?: KpiDirection;
  format?: KpiFormat;
};

// Adds a key number, or changes the one with this key. A dev preview saves nothing.
export async function saveTeamKpi(
  clientId: string,
  input: TeamKpiChange
): Promise<TeamActionResult> {
  if (await getPreviewAccess()) return { ok: true };

  return asResult(() => gql(SAVE_TERMINAL_KPI, { clientId, input }));
}

export async function recordTeamKpiValue(
  kpiId: string,
  input: { value?: number; textValue?: string }
): Promise<TeamActionResult> {
  if (await getPreviewAccess()) return { ok: true };

  return asResult(() => gql(RECORD_TERMINAL_KPI_VALUE, { kpiId, input }));
}

export async function deleteTeamKpi(kpiId: string): Promise<TeamActionResult> {
  if (await getPreviewAccess()) return { ok: true };

  return asResult(() => gql(DELETE_TERMINAL_KPI, { kpiId }));
}
