import {
  RequestStatusId,
  type RequestData,
  type TerminalRequests,
} from "@sandworm/types/terminal";
import { format } from "date-fns";

import { canApprove } from "./status";

type Allowance = TerminalRequests["allowance"];

// The screen's own view of an approval, until the API's answer comes back
export function approveScope(request: RequestData): RequestData {
  return canApprove(request)
    ? {
        ...request,
        status: RequestStatusId.IN_PROGRESS,
        approvedAt: new Date().toISOString(),
      }
    : request;
}

export const withApprovedResearch = (
  allowance: Allowance,
  approvedCount: number
): Allowance => ({ ...allowance, used: allowance.used + approvedCount });

export const isResearchUsedUp = (allowance: Allowance) =>
  allowance.used >= allowance.total;

export const pickDefaultRequest = (requests: readonly RequestData[]) =>
  requests.find(canApprove) ?? requests[0];

export const resetsOn = (allowance: Allowance) =>
  format(new Date(allowance.resetsAt), "d MMM yyyy");
export const resetsShort = (allowance: Allowance) =>
  format(new Date(allowance.resetsAt), "d MMM");
export const resetsMonth = (allowance: Allowance) =>
  format(new Date(allowance.resetsAt), "MMMM");
