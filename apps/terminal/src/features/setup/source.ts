import { setupDraftFixture } from "./fixtures";
import type { SetupDraft } from "./types";

export async function loadSetupDraft(): Promise<SetupDraft> {
  return setupDraftFixture;
}
