"use server";

import type { RequestInput } from "@sandworm/types/terminal";

import { ApiUnauthenticatedError, gql } from "@/lib/api";
import type { RequestDraft } from "@/types";

const SUBMIT_TERMINAL_REQUEST = `
  mutation SubmitTerminalRequest($input: TerminalRequestInput!) {
    submitTerminalRequest(input: $input) { id }
  }
`;

const APPROVE_TERMINAL_REQUEST_SCOPE = `
  mutation ApproveTerminalRequestScope($requestId: ID!) {
    approveTerminalRequestScope(requestId: $requestId) { id }
  }
`;

// Preview visitors have no session: their request stays in the page only.
async function quietly(query: string, variables: Record<string, unknown>) {
  try {
    await gql(query, variables);
  } catch (err) {
    if (!(err instanceof ApiUnauthenticatedError)) throw err;
  }
}

// The submit form asks for research; questions are asked elsewhere.
export async function submitRequest(draft: RequestDraft): Promise<void> {
  const input: RequestInput = {
    kind: "research",
    question: draft.question,
    useCase: draft.useCase,
    about: [...draft.about],
    timing: draft.timing,
    files: [...draft.files],
  };
  await quietly(SUBMIT_TERMINAL_REQUEST, { input });
}

export async function approveRequestScope(requestId: string): Promise<void> {
  await quietly(APPROVE_TERMINAL_REQUEST_SCOPE, { requestId });
}
