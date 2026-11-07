export const OVERVIEW_STATUSES = ["ready", "settingUp", "calculating"] as const;

export type OverviewStatus = (typeof OVERVIEW_STATUSES)[number];

export function isOverviewStatus(value: string): value is OverviewStatus {
  return OVERVIEW_STATUSES.some(status => status === value);
}
