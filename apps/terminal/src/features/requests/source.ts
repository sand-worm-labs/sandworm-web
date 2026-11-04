import {
  getPreviewAllowance,
  getPreviewClientKind,
} from "@/features/preview/cookies";
import { requestMockData } from "@/_mockdata/requests";

import type { RequestsData } from "./types";

export async function getRequests(): Promise<RequestsData> {
  const [clientKind, allowanceMode] = await Promise.all([
    getPreviewClientKind(),
    getPreviewAllowance(),
  ]);
  const data = requestMockData[clientKind];

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
