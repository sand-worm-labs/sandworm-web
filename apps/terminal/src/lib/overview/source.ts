import { getPreviewClientKind, getPreviewStatus } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import { liveOr } from "@/lib/live";
import { overviewMockData } from "@/_mockdata/overview/index";
import type { Overview } from "@/types";

import { overviewFromApi, type LiveOverviewKpis } from "./from-api";

const TERMINAL_OVERVIEW_KPIS = `
  query TerminalOverviewKpis {
    terminalOverviewKpis {
      clientType clientStatus
      kpis { id label value delta { text tone } comparison }
    }
  }
`;

// The Overview: key numbers from the database for a signed-in member, the
// preview content for everyone else.
export async function getOverview(): Promise<Overview> {
  return liveOr(
    async () => {
      const data = await gql<{
        terminalOverviewKpis: LiveOverviewKpis | null;
      }>(TERMINAL_OVERVIEW_KPIS);
      return data.terminalOverviewKpis
        ? overviewFromApi(data.terminalOverviewKpis)
        : null;
    },
    async () => {
      const [clientKind, status] = await Promise.all([
        getPreviewClientKind(),
        getPreviewStatus(),
      ]);
      return { status, data: overviewMockData[clientKind] };
    }
  );
}
