import { OverviewPage } from "@/features/overview/OverviewPage";
import { getOverview } from "@/features/overview/source";
import { getSectionCounts } from "@/features/sections/source";
import { getSession } from "@/features/session/source";

export default async function OverviewRoute() {
  const [overview, counts, session] = await Promise.all([
    getOverview(),
    getSectionCounts(),
    getSession(),
  ]);
  const [firstName = session.user.name] = session.user.name.split(" ");

  return (
    <OverviewPage
      overview={overview}
      counts={counts}
      viewer={{ clientName: session.client.name, firstName }}
    />
  );
}
