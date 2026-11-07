import type { ComponentType } from "react";

import type { Session } from "@/lib/session/types";
import type { SetupDraft } from "@/lib/setup/types";
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
