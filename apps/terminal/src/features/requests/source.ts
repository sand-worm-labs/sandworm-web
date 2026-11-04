import {
  getPreviewAllowance,
  getPreviewClientKind,
} from "@/features/preview/cookies";

import { requestFixtures } from "./fixtures";
import type { RequestsData } from "./types";

export async function getRequests(): Promise<RequestsData> {
  const [clientKind, allowanceMode] = await Promise.all([
    getPreviewClientKind(),
    getPreviewAllowance(),
  ]);
  const data = requestFixtures[clientKind];

  if (allowanceMode === "available") return data;

  return {
    ...data,
    allowance: {
      ...data.allowance,
      research: {
        ...data.allowance.research,
        used: data.allowance.research.total,
      },
    },
  };
}
