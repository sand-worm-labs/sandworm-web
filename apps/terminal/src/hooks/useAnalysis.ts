import type { TerminalAnalysis } from "@sandworm/types/terminal";

import { analysisMockData } from "@/_mockdata/analysis";
import { useTerminalAnalysisQuery } from "@/generated/graphql";
import { catalogOf } from "@/lib/analysis/catalog-state";
import { usePreview } from "@/providers/PreviewProvider";

import { usePreviewOr } from "./usePreviewOr";

export function useAnalysis() {
  const preview = usePreview();
  const { data, error } = useTerminalAnalysisQuery({
    skip: preview.isForced,
  });

  return usePreviewOr(
    data && catalogOf((data.terminalAnalysis as TerminalAnalysis).subjects),
    error,
    () => analysisMockData[preview.clientKind]
  );
}
