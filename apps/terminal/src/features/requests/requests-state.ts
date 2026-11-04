import type { Allowance, ResearchRequest } from "./types";

export function canApprove(request: ResearchRequest): boolean {
  return request.status === "Scoping" && request.scopeApproval !== undefined;
}

export function approveScope(request: ResearchRequest): ResearchRequest {
  const { scopeApproval } = request;
  const current = request.steps.findIndex(step => step.state === "next");
  if (!canApprove(request) || !scopeApproval || current === -1) return request;

  const last = request.steps.length - 1;

  return {
    ...request,
    status: "In progress",
    next: scopeApproval.due,
    scopeApproval: undefined,
    steps: request.steps.map((step, index) => {
      if (index === current) {
        return { ...step, state: "done", when: scopeApproval.scopedOn };
      }
      if (index === current + 1) {
        return { ...step, state: "next", when: "Just now" };
      }
      if (index === last) return { ...step, when: scopeApproval.due };
      return step;
    }),
  };
}

export function withApprovedResearch(
  allowance: Allowance,
  approvedCount: number
): Allowance {
  return {
    ...allowance,
    research: {
      ...allowance.research,
      used: allowance.research.used + approvedCount,
    },
  };
}

export function isResearchUsedUp(allowance: Allowance): boolean {
  return allowance.research.used >= allowance.research.total;
}

export function pickDefaultRequest(
  requests: readonly ResearchRequest[]
): ResearchRequest | undefined {
  return requests.find(canApprove) ?? requests[0];
}
