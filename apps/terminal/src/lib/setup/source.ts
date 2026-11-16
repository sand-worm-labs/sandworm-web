import { ApiUnauthenticatedError, gql } from "@/lib/api";
import type { SetupDraft } from "@/types";

import { SETUP_FIELDS } from "./api";
import { EMPTY_SETUP_DRAFT } from "./defaults";

const TERMINAL_SETUP = `query TerminalSetup { terminalSetup { ${SETUP_FIELDS} } }`;

// The setup the visitor saved so far. Someone new, or not signed in, starts
// from an empty one.
export async function loadSetupDraft(): Promise<SetupDraft> {
  try {
    const data = await gql<{ terminalSetup: SetupDraft | null }>(
      TERMINAL_SETUP
    );
    return data.terminalSetup ?? EMPTY_SETUP_DRAFT;
  } catch (err) {
    if (err instanceof ApiUnauthenticatedError) return EMPTY_SETUP_DRAFT;
    throw err;
  }
}
