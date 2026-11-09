import type { TerminalAnalysis } from "@sandworm/types/terminal";

import { entityFixtures, findEntity } from "@/_mockdata/analysis/entity";
import { useTerminalAnalysisQuery } from "@/generated/graphql";
import { usePreview } from "@/providers/PreviewProvider";

import { usePreviewOr } from "./usePreviewOr";

// A collection comes from the same analysis query as the list, so opening one
// from the list needs no second request. `data` is set once loaded; its
// `subject` is undefined when there is no such collection.
export function useEntityPage(id: string) {
  const preview = usePreview();
  const { data, error } = useTerminalAnalysisQuery({
    skip: preview.isForced,
  });
  const subjects = (data?.terminalAnalysis as TerminalAnalysis | undefined)
    ?.subjects;

  return usePreviewOr(
    subjects && { subject: findEntity(subjects, id) },
    error,
    () => ({
      subject: findEntity(entityFixtures(preview.clientKind), id),
    })
  );
}
