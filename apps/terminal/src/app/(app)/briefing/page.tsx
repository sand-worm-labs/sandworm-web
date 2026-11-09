import { BriefingScreen } from "@/components/Briefing/BriefingScreen";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Briefing");

type BriefingRouteProps = { searchParams: Promise<{ item?: string }> };

export default async function BriefingRoute({
  searchParams,
}: BriefingRouteProps) {
  const [counts, session, { item }] = await Promise.all([
    getSectionCounts(),
    getSession(),
    searchParams,
  ]);

  return (
    <BriefingScreen
      counts={counts}
      viewer={{ clientName: session.client.name }}
      initialItemId={item}
    />
  );
}
