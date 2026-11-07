import type { TimingId, UseCaseId } from "@/data/requests/submit-options";

export type RequestDraft = {
  question: string;
  useCase: UseCaseId;
  about: readonly string[];
  timing: TimingId;
  files: readonly string[];
};
