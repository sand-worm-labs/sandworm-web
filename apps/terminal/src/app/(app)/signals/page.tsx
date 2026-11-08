import { SignalsScreen } from "@/components/Signals/SignalsScreen";
import { getSignals } from "@/lib/signals/source";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Signals");

export default async function SignalsRoute() {
  const [feed, counts, session] = await Promise.all([
    getSignals(),
    getSectionCounts(),
    getSession(),
  ]);

  return (
    <SignalsScreen
      feed={feed}
      counts={counts}
      viewer={{
        clientName: session.client.name,
      }}
    />
  );
}
