import type { SectionCounts } from "@/lib/sections/types";
import type { WelcomeData } from "@/lib/welcome/types";
import { exhaustiveCheck } from "@/lib/exhaustive";
import type { Overview } from "@/lib/overview/types";

import { OverviewCalculating } from "./OverviewCalculating";
import { OverviewReady } from "./OverviewReady";
import { OverviewSettingUp } from "./OverviewSettingUp";

type OverviewPageProps = {
  overview: Overview;
  counts: SectionCounts;
  viewer: { clientName: string; firstName: string };
  welcome?: WelcomeData;
};

export function OverviewPage({
  overview,
  counts,
  viewer,
  welcome,
}: OverviewPageProps) {
  switch (overview.status) {
    case "ready":
      return (
        <OverviewReady
          data={overview.data}
          counts={counts}
          welcome={welcome}
          viewer={viewer}
        />
      );
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
