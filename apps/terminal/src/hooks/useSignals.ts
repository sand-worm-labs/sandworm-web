import type { TerminalSignals } from "@sandworm/types/terminal";

import { signalMockData } from "@/_mockdata/signals";
import { useTerminalSignalsQuery } from "@/generated/graphql";
import { ContentPreviewMode } from "@/lib/preview/modes";
import { toSignal } from "@/lib/signals/to-signal";
import { usePreview } from "@/providers/PreviewProvider";
import type { SignalsFeed } from "@/types";

import { usePreviewOr } from "./usePreviewOr";

export function useSignals() {
  const preview = usePreview();
  const { data, error } = useTerminalSignalsQuery({
    skip: preview.isForced,
  });

  const live = data?.terminalSignals as TerminalSignals | undefined;

  return usePreviewOr<SignalsFeed>(
    live && { items: live.items.map(toSignal) },
    error,
    () => {
      const feed = signalMockData[preview.clientKind];
      return preview.signals === ContentPreviewMode.EMPTY
        ? { ...feed, items: [] }
        : feed;
    }
  );
}
