import { ClientStatusId } from "@sandworm/types/terminal";

import { isEnumValue } from "@/lib/enum";
import type { Kpi } from "@/types";

export enum OverviewStatus {
  READY = "ready",
  SETTING_UP = "settingUp",
  CALCULATING = "calculating",
}

export const isOverviewStatus = isEnumValue(OverviewStatus);

// How the Overview opens, from where the client is: still being set up, live
// with numbers, or live and waiting for its first numbers
export function overviewStatusOf(
  clientStatus: ClientStatusId,
  kpis: readonly Kpi[]
): OverviewStatus {
  if (clientStatus !== ClientStatusId.LIVE) return OverviewStatus.SETTING_UP;
  return kpis.length > 0 ? OverviewStatus.READY : OverviewStatus.CALCULATING;
}
