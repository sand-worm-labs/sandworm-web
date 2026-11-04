import { toId } from "@/lib/slug";

import type {
  QuestionEntry,
  ResearchRequest,
  StepState,
  TimelineStep,
} from "../types";

export function step(
  label: string,
  state: StepState,
  when?: string
): TimelineStep {
  return { id: toId(label), label, state, when };
}

export function researchRequest(
  init: Omit<ResearchRequest, "id">
): ResearchRequest {
  return { ...init, id: toId(init.title) };
}

export function questionEntry(init: Omit<QuestionEntry, "id">): QuestionEntry {
  return { ...init, id: toId(init.title) };
}
