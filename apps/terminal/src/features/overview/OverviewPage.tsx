import type { SectionCounts } from "@/features/sections/types";
import { exhaustiveCheck } from "@/lib/exhaustive";

import { OverviewCalculating } from "./OverviewCalculating";
import { OverviewReady } from "./OverviewReady";
import { OverviewSettingUp } from "./OverviewSettingUp";
import type { Overview } from "./types";

type OverviewPageProps = {
  overview: Overview;
  counts: SectionCounts;
  viewer: { clientName: string; firstName: string };
};

export function OverviewPage({ overview, counts, viewer }: OverviewPageProps) {
  switch (overview.status) {
    case "ready":
      return <OverviewReady data={overview.data} counts={counts} />;
    case "settingUp":
      return (
        <OverviewSettingUp data={overview.data} firstName={viewer.firstName} />
      );
    case "calculating":
      return (
        <OverviewCalculating
          data={overview.data}
          clientName={viewer.clientName}
        />
      );
    default:
      return exhaustiveCheck(overview.status);
  }
}
