import { AnalysisScreen } from "@/components/Analysis/AnalysisScreen";
import { getAnalysis } from "@/features/analysis/source";
import { getSectionCounts } from "@/features/sections/source";
import { getSession } from "@/features/session/source";

export default async function AnalysisRoute() {
  const [catalog, counts, session] = await Promise.all([
    getAnalysis(),
    getSectionCounts(),
    getSession(),
  ]);

  return (
    <AnalysisScreen
      catalog={catalog}
      counts={counts}
      viewer={{
        clientName: session.client.name,
      }}
    />
  );
}
