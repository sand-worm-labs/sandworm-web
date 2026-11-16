"use client";

import { createContext, useContext } from "react";
import { OrganisationTypeId } from "@sandworm/types/terminal";

import type { Preview } from "@/lib/preview/cookies";
import { OverviewStatus } from "@/lib/overview/status";
import { AllowancePreviewMode, ContentPreviewMode } from "@/lib/preview/modes";
import type { ChildrenProps } from "@/types";

const PreviewContext = createContext<Preview>({
  isForced: false,
  clientKind: OrganisationTypeId.EXCHANGE,
  status: OverviewStatus.READY,
  briefing: ContentPreviewMode.ITEMS,
  signals: ContentPreviewMode.ITEMS,
  allowance: AllowancePreviewMode.AVAILABLE,
});

export const usePreview = () => useContext(PreviewContext);

export function PreviewProvider({
  preview,
  children,
}: ChildrenProps & { preview: Preview }) {
  return (
    <PreviewContext.Provider value={preview}>
      {children}
    </PreviewContext.Provider>
  );
}
