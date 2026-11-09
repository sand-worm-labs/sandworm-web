import { pageMetadata } from "@/lib/metadata";
import { OverviewPage } from "@/components/Overview/OverviewPage";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { getWelcome } from "@/lib/welcome/source";

export const metadata = pageMetadata("Overview");

export default async function OverviewRoute() {
  const [counts, session, welcome] = await Promise.all([
    getSectionCounts(),
    getSession(),
    getWelcome(),
  ]);
  const [firstName = session.user.name] = session.user.name.split(" ");

  return (
    <OverviewPage
      counts={counts}
      welcome={welcome}
      viewer={{
        clientName: session.client.name,
        clientIcon: session.client.icon,
        firstName,
      }}
    />
  );
}
