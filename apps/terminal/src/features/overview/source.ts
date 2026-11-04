import {
  getPreviewClientKind,
  getPreviewStatus,
} from "@/features/preview/cookies";

import { overviewFixtures } from "./fixtures";
import type { Overview } from "./types";

export async function getOverview(): Promise<Overview> {
  const [clientKind, status] = await Promise.all([
    getPreviewClientKind(),
    getPreviewStatus(),
  ]);

  return { status, data: overviewFixtures[clientKind] };
}
