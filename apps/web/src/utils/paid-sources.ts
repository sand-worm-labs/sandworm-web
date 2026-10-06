import { DataSourceId } from "@sandworm/types";

// Mirrors PaidPlanService on the API: Sandworm Cloud needs any paid plan
// (trial included), Dune needs Pro or Enterprise. The server still enforces
// this; checking here lets us stop before anything is enqueued.
export function planBlockMessage(
  plan: string | null | undefined,
  dataSourceId: string | null | undefined
): string | null {
  // Unknown plan (still loading): let the server decide.
  if (!plan) return null;
  const key = plan.toUpperCase();

  if (dataSourceId === DataSourceId.sandwormCloud && key === "FREE") {
    return "Sandworm Cloud needs a paid plan. This workspace is on the free plan.";
  }
  if (
    dataSourceId === DataSourceId.dune &&
    key !== "PRO" &&
    key !== "ENTERPRISE"
  ) {
    return "Dune needs the Pro plan. Upgrade this workspace to run it.";
  }
  return null;
}
