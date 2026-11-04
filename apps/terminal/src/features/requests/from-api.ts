import type { RequestData, TerminalRequests } from "@sandworm/types/terminal";

import { site } from "@/config/site";
import { fullWhen, longDay, shortDay } from "@/lib/dates";
import { webAppUrl } from "@/lib/web-app";

import type {
  QuestionEntry,
  RequestsData,
  ResearchRequest,
  ResearchStatus,
  StepState,
  TimelineStep,
} from "./types";

// How a research request reads at each status: its label, the "next" line
// and the timeline, all from the dates the API sends.

const STATUS: Record<RequestData["status"], ResearchStatus> = {
  submitted: "Submitted",
  scoping: "Scoping",
  awaiting_approval: "Scoping",
  in_progress: "In progress",
  delivered: "Delivered",
  declined: "Declined",
  failed: "Declined",
};

const step = (
  id: string,
  label: string,
  state: StepState,
  when?: string
): TimelineStep => ({ id, label, state, when });

const day = (iso: string | null) => (iso ? shortDay(iso) : undefined);
const due = (r: RequestData) =>
  r.scope ? `Due ${longDay(r.scope.dueAt)}` : undefined;

function stepsOf(r: RequestData): TimelineStep[] {
  if (r.status === "declined" || r.status === "failed") {
    return [
      step("submitted", "Submitted", "done", day(r.submittedAt)),
      step(
        "declined",
        r.status === "failed" ? "Stopped" : "Declined",
        "declined",
        day(r.closedAt)
      ),
    ];
  }
  const reached = {
    submitted: 0,
    scoping: 1,
    awaiting_approval: 1,
    in_progress: 2,
    delivered: 4,
  }[r.status];
  const state = (index: number): StepState =>
    index < reached ? "done" : index === reached ? "next" : "later";
  const scoping =
    r.status === "awaiting_approval" && r.scopedAt
      ? `Scope sent ${shortDay(r.scopedAt).toLowerCase()}`
      : day(r.scopedAt);

  return [
    step("submitted", "Submitted", "done", day(r.submittedAt)),
    step("scoping", "Scoping", state(1), scoping),
    step(
      "in-progress",
      "In progress",
      state(2),
      r.approvedAt && r.status === "in_progress"
        ? `Since ${shortDay(r.approvedAt)}`
        : day(r.approvedAt)
    ),
    step("delivered", "Delivered", state(3), day(r.closedAt) ?? due(r)),
  ];
}

function nextOf(r: RequestData): string {
  switch (r.status) {
    case "submitted":
    case "scoping":
      return "Waiting for scope";
    case "awaiting_approval":
      return "Scope ready for you";
    case "in_progress":
      return due(r) ?? "In progress";
    case "delivered":
      return r.closedAt ? longDay(r.closedAt) : "Delivered";
    default:
      return "Didn't count";
  }
}

// The latest thing Sandworm said about it
function noteOf(r: RequestData): ResearchRequest["note"] {
  const when = fullWhen(r.closedAt ?? r.scopedAt ?? r.submittedAt);
  if (r.status === "awaiting_approval" && r.scope) {
    const questions = r.scope.questions
      .map((question, index) => `${index + 1}. ${question}`)
      .join("\n");
    return {
      when,
      text: `Here is the scope. ${r.scope.summary}\nI will answer:\n${questions}\n${due(r)}.`,
    };
  }
  return {
    when,
    text:
      r.outcome ??
      r.progressNote ??
      `Got it. ${site.name} will reply with a scope for you to approve.`,
  };
}

function toResearch(r: RequestData): ResearchRequest {
  const by = [r.requestedBy, shortDay(r.submittedAt)]
    .filter(Boolean)
    .join(" · ");
  return {
    id: r.id,
    title: r.question,
    by,
    status: STATUS[r.status],
    next: nextOf(r),
    steps: stepsOf(r),
    note: noteOf(r),
    scopeApproval:
      r.status === "awaiting_approval" && r.scope && r.scopedAt
        ? { scopedOn: longDay(r.scopedAt), due: due(r)! }
        : undefined,
    reportLabel: r.reportPath ? "Read the report" : undefined,
    reportUrl: r.reportPath ? webAppUrl(r.reportPath) : undefined,
  };
}

function toQuestion(r: RequestData): QuestionEntry {
  return {
    id: r.id,
    title: r.question,
    detail: r.outcome
      ? `${site.name}: ${r.outcome}`
      : `${site.name} will answer soon.`,
    status: r.status === "delivered" ? "Answered" : "Upcoming",
    when: shortDay(r.closedAt ?? r.submittedAt),
  };
}

export function requestsFromApi({
  allowance,
  requests,
}: TerminalRequests): RequestsData {
  const resets = new Date(allowance.resetsAt);
  return {
    allowance: {
      research: { used: allowance.used, total: allowance.total },
      resetsOn: resets.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      resetsShort: resets.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      }),
      resetsMonth: resets.toLocaleDateString("en-GB", { month: "long" }),
    },
    research: requests.filter(r => r.kind === "research").map(toResearch),
    questions: requests.filter(r => r.kind === "question").map(toQuestion),
  };
}
