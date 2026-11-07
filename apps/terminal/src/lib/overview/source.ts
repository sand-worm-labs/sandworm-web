import { getPreviewClientKind, getPreviewStatus } from "@/lib/preview/cookies";
import { overviewMockData } from "@/_mockdata/overview/index";
import type { Overview } from "@/types";

export async function getOverview(): Promise<Overview> {
  const [clientKind, status] = await Promise.all([
    getPreviewClientKind(),
    getPreviewStatus(),
  ]);

  return { status, data: overviewMockData[clientKind] };
}
