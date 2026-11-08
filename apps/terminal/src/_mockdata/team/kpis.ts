import type { TeamKpi } from "@/types";

const DAY = 86_400_000;
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();

const kpi = (
  init: Pick<TeamKpi, "key" | "label" | "format"> & {
    value: string;
    delta: NonNullable<TeamKpi["display"]["delta"]>;
  },
  position: number
): TeamKpi => ({
  id: init.key,
  subjectId: null,
  key: init.key,
  label: init.label,
  description: "",
  position,
  isVisible: true,
  format: init.format,
  direction: "up_good",
  comparison: { kind: "previous" },
  source: { kind: "manual" },
  lastReadingAt: ago(1),
  display: {
    id: init.key,
    label: init.label,
    value: init.value,
    delta: init.delta,
    comparison: "vs last month",
  },
});

// What the preview shows in a client's Key numbers: nothing here is saved
export const teamKpisMockData: readonly TeamKpi[] = [
  kpi(
    {
      key: "swap-volume",
      label: "Swap volume",
      format: { kind: "currency", currency: "USD", compact: true },
      value: "$1.84B",
      delta: { text: "▼ 9%", tone: "negative" },
    },
    0
  ),
  kpi(
    {
      key: "active-wallets",
      label: "Active wallets",
      format: { kind: "number" },
      value: "312,400",
      delta: { text: "▲ 4%", tone: "positive" },
    },
    1
  ),
  kpi(
    {
      key: "retention-90",
      label: "Still trading after 90 days",
      format: { kind: "percent" },
      value: "34%",
      delta: { text: "▼ 3 pts", tone: "negative" },
    },
    2
  ),
];
