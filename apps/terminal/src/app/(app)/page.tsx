import { OverviewPage } from "@/features/overview/OverviewPage";
import { getOverview } from "@/features/overview/source";
import { getSectionCounts } from "@/features/sections/source";
import { getSession } from "@/features/session/source";
import { getWelcome } from "@/features/welcome/source";

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
