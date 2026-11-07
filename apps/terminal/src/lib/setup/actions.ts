"use server";

import { redirect } from "next/navigation";

import { signInUrl } from "@/lib/auth/sign-in";
import { ApiUnauthenticatedError, gql } from "@/lib/api";
import type { SetupDraft } from "@/types";

import { SETUP_FIELDS } from "./api";
import { SETUP_STEP_IDS, setupStepPath } from "./routes";

const SAVE_TERMINAL_SETUP = `
  mutation SaveTerminalSetup($input: TerminalSetupInput!) {
    saveTerminalSetup(input: $input) { ${SETUP_FIELDS} }
  }
`;

// Someone who isn't signed in is sent to sign in, and comes back to setup.
export async function saveSetupDraft(draft: SetupDraft): Promise<void> {
  try {
    await gql(SAVE_TERMINAL_SETUP, { input: draft });
  } catch (err) {
    if (err instanceof ApiUnauthenticatedError) {
      redirect(signInUrl(setupStepPath(SETUP_STEP_IDS[0])));
    }
    throw err;
  }
}
