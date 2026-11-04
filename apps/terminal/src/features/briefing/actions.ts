"use server";

import { ApiUnauthenticatedError, gql } from "@/lib/api";

// Read state for the signed-in member. Preview visitors have no session, so
// their reads stay in the page only.

async function quietly(query: string, variables?: Record<string, unknown>) {
  try {
    await gql(query, variables);
  } catch (err) {
    if (!(err instanceof ApiUnauthenticatedError)) throw err;
  }
}

export async function markBriefingRead(itemIds: string[]): Promise<void> {
  if (!itemIds.length) return;
  await quietly(
    `mutation MarkTerminalBriefingRead($itemIds: [ID!]!) { markTerminalBriefingRead(itemIds: $itemIds) }`,
    { itemIds }
  );
}

export async function markBriefingSeen(): Promise<void> {
  await quietly(
    `mutation MarkTerminalBriefingSeen { markTerminalBriefingSeen }`
  );
}
