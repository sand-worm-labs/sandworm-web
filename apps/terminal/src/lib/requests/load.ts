import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";

import { getRequests } from "./source";

export async function loadRequestsScreen() {
  const [data, counts, session] = await Promise.all([
    getRequests(),
    getSectionCounts(),
    getSession(),
  ]);

  return { data, counts, session };
}
