import { RequestStatusId, type RequestData } from "@sandworm/types/terminal";

import { site } from "@/config/site";
import { fullWhen, longDay, shortDay } from "@/lib/dates";
import type {
  QuestionStatus,
  ResearchStatus,
  StepState,
  TimelineStep,
} from "@/types";

// How a research request reads at each status: its label, the "next" line
// and the timeline, all from the dates the API sends.

const STATUS: Record<RequestStatusId, ResearchStatus> = {
  submitted: "Submitted",
  scoping: "Scoping",
  awaiting_approval: "Scoping",
  in_progress: "In progress",
  delivered: "Delivered",
  declined: "Declined",
  failed: "Declined",
};

export const researchStatus = (r: RequestData) => STATUS[r.status];

const step = (
  id: string,
  label: string,
  state: StepState,
  when?: string
): TimelineStep => ({ id, label, state, when });

const day = (iso: string | null) => (iso ? shortDay(iso) : undefined);
const due = (r: RequestData) =>
  r.scope ? `Due ${longDay(r.scope.dueAt)}` : undefined;

export const canApprove = (r: RequestData) =>
  r.status === RequestStatusId.AWAITING_APPROVAL && !!r.scope && !!r.scopedAt;

export function stepsOf(r: RequestData): TimelineStep[] {
  if (
    r.status === RequestStatusId.DECLINED ||
    r.status === RequestStatusId.FAILED
  ) {
    return [
      step("submitted", "Submitted", "done", day(r.submittedAt)),
      step(
        "declined",
        r.status === RequestStatusId.FAILED ? "Stopped" : "Declined",
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
    r.status === RequestStatusId.AWAITING_APPROVAL && r.scopedAt
      ? `Scope sent ${shortDay(r.scopedAt).toLowerCase()}`
      : day(r.scopedAt);

  return [
    step("submitted", "Submitted", "done", day(r.submittedAt)),
    step("scoping", "Scoping", state(1), scoping),
    step(
      "in-progress",
      "In progress",
      state(2),
      r.approvedAt && r.status === RequestStatusId.IN_PROGRESS
        ? `Since ${shortDay(r.approvedAt)}`
        : day(r.approvedAt)
    ),
    step("delivered", "Delivered", state(3), day(r.closedAt) ?? due(r)),
  ];
}

export function nextOf(r: RequestData): string {
  switch (r.status) {
    case RequestStatusId.SUBMITTED:
    case RequestStatusId.SCOPING:
      return "Waiting for scope";
    case RequestStatusId.AWAITING_APPROVAL:
      return "Scope ready for you";
    case RequestStatusId.IN_PROGRESS:
      return due(r) ?? "In progress";
    case RequestStatusId.DELIVERED:
      return r.closedAt ? longDay(r.closedAt) : "Delivered";
    default:
      return "Didn't count";
  }
}

export const byLine = (r: RequestData) =>
  [r.requestedBy, shortDay(r.submittedAt)].filter(Boolean).join(" · ");

// The latest thing Sandworm said about it
export function noteOf(r: RequestData): { when: string; text: string } {
  const when = fullWhen(r.closedAt ?? r.scopedAt ?? r.submittedAt);
  const isScoped =
    r.status === RequestStatusId.AWAITING_APPROVAL ||
    (!r.outcome && !r.progressNote);
  if (r.scope && isScoped) {
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

export function questionOf(r: RequestData) {
  const status: QuestionStatus =
    r.status === RequestStatusId.DELIVERED ? "Answered" : "Upcoming";
  return {
    title: r.question,
    detail: r.outcome
      ? `${site.name}: ${r.outcome}`
      : `${site.name} will answer soon.`,
    status,
    when: shortDay(r.closedAt ?? r.submittedAt),
  };
}
