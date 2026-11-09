import { RequestKindId, type RequestData } from "@sandworm/types/terminal";

import { toId } from "@/lib/slug";

type RequestInit = Pick<RequestData, "question" | "status" | "submittedAt"> &
  Partial<RequestData>;

export function request(init: RequestInit): RequestData {
  return {
    id: toId(init.question),
    kind: RequestKindId.RESEARCH,
    useCase: null,
    about: [],
    timing: null,
    requestedBy: null,
    scope: null,
    progressNote: null,
    outcome: null,
    reportPath: null,
    scopedAt: null,
    approvedAt: null,
    closedAt: null,
    ...init,
  };
}
