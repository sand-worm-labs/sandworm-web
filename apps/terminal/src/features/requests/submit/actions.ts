"use server";

import type { RequestDraft } from "./types";

export async function submitRequest(_draft: RequestDraft): Promise<void> {
  // Stub: persists nothing until the API has somewhere to send a request.
}
