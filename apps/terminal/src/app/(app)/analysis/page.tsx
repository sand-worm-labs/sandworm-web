import { AnalysisScreen } from "@/components/Analysis/AnalysisScreen";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Analysis");

export default async function AnalysisRoute() {
  const [counts, session] = await Promise.all([
    getSectionCounts(),
    getSession(),
  ]);

  return (
    <AnalysisScreen
      counts={counts}
      viewer={{
        clientName: session.client.name,
      }}
    />
  );
}
