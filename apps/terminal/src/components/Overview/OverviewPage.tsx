"use client";

import { BarLoader } from "@sandworm/ui/kit/bar-loader";

import { useOverview } from "@/hooks/useOverview";
import type { SectionCounts, WelcomeData } from "@/types";
import { exhaustiveCheck } from "@/lib/exhaustive";
import { OverviewStatus } from "@/lib/overview/status";

import { OverviewCalculating } from "./OverviewCalculating";
import { OverviewReady } from "./OverviewReady";
import { OverviewSettingUp } from "./OverviewSettingUp";

type OverviewPageProps = {
  counts: SectionCounts;
  viewer: { clientName: string; firstName: string };
  welcome?: WelcomeData;
};

export function OverviewPage({ counts, viewer, welcome }: OverviewPageProps) {
  const { data: overview, error } = useOverview(viewer.clientName);
  if (error) {
    return (
      <p className="text-sm text-ink-400">
        Could not load the overview. Please try again.
      </p>
    );
  }
  if (!overview) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <BarLoader />
      </div>
    );
  }

  switch (overview.status) {
    case OverviewStatus.READY:
      return (
        <OverviewReady
          data={overview.data}
          counts={counts}
          welcome={welcome}
          viewer={viewer}
        />
      );
    case OverviewStatus.SETTING_UP:
      return (
        <OverviewSettingUp data={overview.data} firstName={viewer.firstName} />
      );
    case OverviewStatus.CALCULATING:
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
