import { AnalysisScreen } from "@/components/Analysis/AnalysisScreen";
import { getAnalysis } from "@/lib/analysis/source";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Analysis");

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
