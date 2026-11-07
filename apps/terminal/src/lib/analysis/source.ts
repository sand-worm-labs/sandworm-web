import type { TerminalAnalysis } from "@sandworm/types/terminal";

import { getPreviewClientKind } from "@/lib/preview/cookies";
import { gql } from "@/lib/api";
import { liveOr } from "@/lib/live";
import { analysisMockData } from "@/_mockdata/analysis";
import type { AnalysisCatalog } from "@/types";

import { analysisFromApi } from "./from-api";

const TERMINAL_ANALYSIS = `
  query TerminalAnalysis {
    terminalAnalysis {
      subjects {
        id view slug name kind impact impactSize
        reports { id title line publishedAt isNew path }
      }
    }
  }
`;

export async function getAnalysis(): Promise<AnalysisCatalog> {
  return liveOr(
    async () => {
      const data = await gql<{ terminalAnalysis: TerminalAnalysis }>(
        TERMINAL_ANALYSIS
      );
      return analysisFromApi(data.terminalAnalysis);
    },
    async () => analysisMockData[await getPreviewClientKind()]
  );
}
