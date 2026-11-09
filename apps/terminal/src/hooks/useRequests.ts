import type { TerminalRequests } from "@sandworm/types/terminal";

import { requestMockData } from "@/_mockdata/requests";
import { useTerminalRequestsQuery } from "@/generated/graphql";
import { AllowancePreviewMode } from "@/lib/preview/modes";
import { usePreview } from "@/providers/PreviewProvider";

import { usePreviewOr } from "./usePreviewOr";

export function useRequests() {
  const preview = usePreview();
  const { data, error } = useTerminalRequestsQuery({
    skip: preview.isForced,
  });

  return usePreviewOr(
    data?.terminalRequests as TerminalRequests | undefined,
    error,
    () => {
      const fixture = requestMockData[preview.clientKind]();
      return preview.allowance === AllowancePreviewMode.AVAILABLE
        ? fixture
        : {
            ...fixture,
            allowance: { ...fixture.allowance, used: fixture.allowance.total },
          };
    }
  );
}
