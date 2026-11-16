"use server";

import type { RequestAccessDraft } from "./request-draft";

export async function requestAccess(_draft: RequestAccessDraft): Promise<void> {
  // Stub: persists nothing until the API has somewhere to record an access request.
}
