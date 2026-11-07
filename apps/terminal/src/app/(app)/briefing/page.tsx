import { BriefingScreen } from "@/components/Briefing/BriefingScreen";
import { getBriefing } from "@/features/briefing/source";
import { getSectionCounts } from "@/features/sections/source";
import { getSession } from "@/features/session/source";

type BriefingRouteProps = { searchParams: Promise<{ item?: string }> };

export default async function BriefingRoute({
  searchParams,
}: BriefingRouteProps) {
  const [feed, counts, session, { item }] = await Promise.all([
    getBriefing(),
    getSectionCounts(),
    getSession(),
    searchParams,
  ]);

  return (
    <BriefingScreen
      feed={feed}
      counts={counts}
      viewer={{ clientName: session.client.name }}
      initialItemId={item}
    />
  );
}
