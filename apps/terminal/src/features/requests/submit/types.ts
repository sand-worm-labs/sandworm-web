import type { TimingId, UseCaseId } from "./options";

export type RequestDraft = {
  question: string;
  useCase: UseCaseId;
  about: readonly string[];
  timing: TimingId;
  files: readonly string[];
};
