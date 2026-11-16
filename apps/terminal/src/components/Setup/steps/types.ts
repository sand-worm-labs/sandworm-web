import type { ComponentType } from "react";

import type { Session, SetupDraft } from "@/types";
import type { SetupStepId } from "@/lib/setup/routes";

export type SetupStepDefinition = {
  id: SetupStepId;
  label: string;
  title: (session: Session) => string;
  description: (session: Session) => string;
  Component: ComponentType;
  canContinue: (draft: SetupDraft) => boolean;
  previewNote: (context: { draft: SetupDraft; session: Session }) => string;
};
