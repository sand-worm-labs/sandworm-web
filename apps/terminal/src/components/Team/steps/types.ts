import type { ComponentType } from "react";

import type { TeamStepId } from "@/lib/team/routes";
import type { TeamClientDraft } from "@/lib/team/types";

export type TeamStepDefinition = {
  id: TeamStepId;
  label: string;
  title: string;
  description: string;
  Component: ComponentType;
  canContinue: (draft: TeamClientDraft) => boolean;
  previewNote: (draft: TeamClientDraft) => string;
};
