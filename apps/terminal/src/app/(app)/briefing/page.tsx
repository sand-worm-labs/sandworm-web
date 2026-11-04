import { BriefingScreen } from "@/features/briefing/BriefingScreen";
import { getBriefing } from "@/features/briefing/source";
import { getSectionCounts } from "@/features/sections/source";
import { getSession } from "@/features/session/source";

export default async function BriefingRoute() {
  const [feed, counts, session] = await Promise.all([
    getBriefing(),
    getSectionCounts(),
    getSession(),
  ]);

  return (
    <BriefingScreen
      feed={feed}
      counts={counts}
      viewer={{
        clientName: session.client.name,
        analystName: session.client.analyst.name,
      }}
    />
  );
}
