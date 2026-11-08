import type {
  ClientStatusId,
  OrganisationTypeId,
} from "@sandworm/types/terminal";

import { overviewMockData } from "@/_mockdata/overview/index";
import type { Kpi, Overview, OverviewStatus } from "@/types";

// What the API sends for the Overview's key numbers
export type LiveOverviewKpis = {
  clientType: OrganisationTypeId;
  clientStatus: ClientStatusId;
  kpis: readonly Kpi[];
};

// How the Overview opens, from where the client is: still being set up, live
// with numbers, or live and waiting for its first numbers
export function overviewStatusOf({
  clientStatus,
  kpis,
}: Pick<LiveOverviewKpis, "clientStatus" | "kpis">): OverviewStatus {
  if (clientStatus !== "live") return "settingUp";
  return kpis.length > 0 ? "ready" : "calculating";
}

// The key numbers come from the database; the rest of the Overview (briefing,
// signals, gaps) is still the client type's preview content until it moves too.
export function overviewFromApi(live: LiveOverviewKpis): Overview {
  const base = overviewMockData[live.clientType] ?? overviewMockData.other;

  return {
    status: overviewStatusOf(live),
    data: {
      ...base,
      blocks: base.blocks.map(block =>
        block._tag === "kpis" && live.kpis.length > 0
          ? { ...block, items: live.kpis }
          : block
      ),
    },
  };
}
