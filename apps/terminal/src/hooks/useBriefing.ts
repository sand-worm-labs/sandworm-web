import type { TerminalBriefing } from "@sandworm/types/terminal";

import { briefingMockData } from "@/_mockdata/briefing";
import { useTerminalBriefingQuery } from "@/generated/graphql";
import { ContentPreviewMode } from "@/lib/preview/modes";
import { usePreview } from "@/providers/PreviewProvider";

import { usePreviewOr } from "./usePreviewOr";

export function useBriefing() {
  const preview = usePreview();
  const { data, error } = useTerminalBriefingQuery({
    skip: preview.isForced,
  });

  return usePreviewOr(
    data?.terminalBriefing as TerminalBriefing | undefined,
    error,
    () => {
      const feed = briefingMockData[preview.clientKind]();
      return preview.briefing === ContentPreviewMode.EMPTY
        ? { ...feed, items: [] }
        : feed;
    }
  );
}
