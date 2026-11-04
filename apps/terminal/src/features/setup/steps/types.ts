import type { ComponentType } from "react";

import type { Session } from "@/features/session/types";

import type { SetupDraft } from "../types";

import type { SetupStepId } from "./routes";

export type SetupStepDefinition = {
  id: SetupStepId;
  label: string;
  title: (session: Session) => string;
  description: (session: Session) => string;
  Component: ComponentType;
  canContinue: (draft: SetupDraft) => boolean;
  previewNote: (context: { draft: SetupDraft; session: Session }) => string;
};
