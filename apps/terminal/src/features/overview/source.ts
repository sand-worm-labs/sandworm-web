import {
  getPreviewClientKind,
  getPreviewStatus,
} from "@/features/preview/cookies";
import { overviewMockData } from "@/_mockdata/overview";

import type { Overview } from "./types";

export async function getOverview(): Promise<Overview> {
  const [clientKind, status] = await Promise.all([
    getPreviewClientKind(),
    getPreviewStatus(),
  ]);

  return { status, data: overviewMockData[clientKind] };
}
