import type { OverviewStatus } from "@/types";

export const OVERVIEW_STATUSES = ["ready", "settingUp", "calculating"] as const;

export function isOverviewStatus(value: string): value is OverviewStatus {
  return OVERVIEW_STATUSES.some(status => status === value);
}
