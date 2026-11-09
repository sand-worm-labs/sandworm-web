import type {
  ClientStatusId,
  OrganisationTypeId,
} from "@sandworm/types/terminal";

import { overviewMockData } from "@/_mockdata/overview";
import { useTerminalOverviewKpisQuery } from "@/generated/graphql";
import { withKpis } from "@/lib/overview/blocks";
import { overviewStatusOf } from "@/lib/overview/status";
import { usePreview } from "@/providers/PreviewProvider";
import type { Kpi, Overview } from "@/types";

import { usePreviewOr } from "./usePreviewOr";

type LiveKpis = {
  clientType: OrganisationTypeId;
  clientStatus: ClientStatusId;
  kpis: readonly Kpi[];
};

export function useOverview() {
  const preview = usePreview();
  const { data, error } = useTerminalOverviewKpisQuery({
    skip: preview.isForced,
  });
  const live = data?.terminalOverviewKpis as LiveKpis | null | undefined;

  return usePreviewOr<Overview>(
    live && {
      status: overviewStatusOf(live.clientStatus, live.kpis),
      data: withKpis(
        overviewMockData[live.clientType] ?? overviewMockData.other,
        live.kpis
      ),
    },
    error,
    () => ({
      status: preview.status,
      data: overviewMockData[preview.clientKind],
    })
  );
}
