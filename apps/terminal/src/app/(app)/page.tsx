import { OverviewPage } from "@/components/Overview/OverviewPage";
import { getOverview } from "@/lib/overview/source";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { getWelcome } from "@/lib/welcome/source";

export default async function OverviewRoute() {
  const [overview, counts, session, welcome] = await Promise.all([
    getOverview(),
    getSectionCounts(),
    getSession(),
    getWelcome(),
  ]);
  const [firstName = session.user.name] = session.user.name.split(" ");

  return (
    <OverviewPage
      overview={overview}
      counts={counts}
      welcome={welcome}
      viewer={{ clientName: session.client.name, firstName }}
    />
  );
}
