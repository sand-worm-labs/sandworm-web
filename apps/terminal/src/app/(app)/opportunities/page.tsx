import { OpportunitiesScreen } from "@/features/opportunities/OpportunitiesScreen";
import { getOpportunities } from "@/features/opportunities/source";
import { getSectionCounts } from "@/features/sections/source";
import { getSession } from "@/features/session/source";

export default async function OpportunitiesRoute() {
  const [feed, counts, session] = await Promise.all([
    getOpportunities(),
    getSectionCounts(),
    getSession(),
  ]);

  return (
    <OpportunitiesScreen
      feed={feed}
      counts={counts}
      viewer={{
        clientName: session.client.name,
        analystName: session.client.analyst.name,
      }}
    />
  );
}
