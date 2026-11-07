import type { TerminalRequests } from "@sandworm/types/terminal";

import {
  getPreviewAllowance,
  getPreviewClientKind,
} from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import { liveOr } from "@/lib/live";
import { requestMockData } from "@/_mockdata/requests";
import type { RequestsData } from "@/types";

import { requestsFromApi } from "./from-api";

export const REQUEST_FIELDS = `
  id kind question status useCase about timing requestedBy scope progressNote
  outcome reportPath submittedAt scopedAt approvedAt closedAt
`;

const TERMINAL_REQUESTS = `
  query TerminalRequests {
    terminalRequests {
      allowance { used total resetsAt }
      requests { ${REQUEST_FIELDS} }
    }
  }
`;

async function fixture(): Promise<RequestsData> {
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

export async function getRequests(): Promise<RequestsData> {
  return liveOr(async () => {
    const data = await gql<{ terminalRequests: TerminalRequests }>(
      TERMINAL_REQUESTS
    );
    return requestsFromApi(data.terminalRequests);
  }, fixture);
}
