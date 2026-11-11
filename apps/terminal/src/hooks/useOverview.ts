import type {
  ClientStatusId,
  OrganisationTypeId,
  SignalData,
  TerminalBriefing,
} from "@sandworm/types/terminal";

import { overviewMockData } from "@/_mockdata/overview";
import {
  useTerminalBriefingQuery,
  useTerminalOverviewKpisQuery,
  useTerminalSignalsQuery,
} from "@/generated/graphql";
import { detailOf, sinceLabel } from "@/lib/briefing/display";
import { feedGroup, listTime } from "@/lib/dates";
import { withLive } from "@/lib/overview/blocks";
import { overviewStatusOf } from "@/lib/overview/status";
import { toSignal } from "@/lib/signals/to-signal";
import { usePreview } from "@/providers/PreviewProvider";
import type { Kpi, Overview } from "@/types";

import { usePreviewOr } from "./usePreviewOr";

type LiveKpis = {
  clientType: OrganisationTypeId;
  clientStatus: ClientStatusId;
  isUpdating: boolean;
  kpis: readonly Kpi[];
};

// How many briefing items and signals the Overview lists
const LISTED = 5;

export function useOverview(clientName: string) {
  const preview = usePreview();
  const skip = preview.isForced;
  const kpisQuery = useTerminalOverviewKpisQuery({ skip });
  const briefingQuery = useTerminalBriefingQuery({ skip });
  const signalsQuery = useTerminalSignalsQuery({ skip });

  const kpis = kpisQuery.data?.terminalOverviewKpis as
    | LiveKpis
    | null
    | undefined;
  const briefing = briefingQuery.data?.terminalBriefing as
    | TerminalBriefing
    | undefined;
  const signals = signalsQuery.data?.terminalSignals.items as
    | SignalData[]
    | undefined;

  // Null while the user belongs to no client, which is the preview
  const live =
    kpis === null
      ? null
      : kpis &&
        briefing &&
        signals && {
          // kpis.isUpdating is not passed yet: a change to what the client tracks
          // keeps showing its numbers until something recalculates them
          status: overviewStatusOf(kpis.clientStatus, kpis.kpis),
          data: withLive(
            overviewMockData[kpis.clientType] ?? overviewMockData.other,
            {
              subtitle: clientName,
              kpis: kpis.kpis,
              briefing: {
                subtitle: sinceLabel(briefing.lastSeenAt),
                entries: briefing.items.slice(0, LISTED).map(item => ({
                  id: item.id,
                  group: feedGroup(item.publishedAt),
                  kind: item.kind,
                  title: item.title,
                  summary: item.summary,
                  entity: item.subject,
                  time: listTime(item.publishedAt),
                  isUnread: !item.isRead,
                  route: "briefing",
                })),
              },
              cells: briefing.items.flatMap(item => {
                const { outputs } = detailOf(item);
                return outputs?.length
                  ? [{ id: item.id, title: item.title, outputs }]
                  : [];
              }),
              signals: signals
                .map(toSignal)
                .flatMap(({ status, ...signal }) =>
                  status === "Not for us" ? [] : [{ ...signal, status }]
                )
                .slice(0, LISTED),
            }
          ),
        };

  return usePreviewOr<Overview>(
    live,
    kpisQuery.error ?? briefingQuery.error ?? signalsQuery.error,
    () => ({
      status: preview.status,
      data: overviewMockData[preview.clientKind],
    })
  );
}
