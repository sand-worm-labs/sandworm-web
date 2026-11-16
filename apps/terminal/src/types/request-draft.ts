import type {
  RequestTimingId,
  RequestUseCaseId,
} from "@sandworm/types/terminal";

export type RequestDraft = {
  question: string;
  useCase: RequestUseCaseId;
  about: readonly string[];
  timing: RequestTimingId;
  files: readonly string[];
};
