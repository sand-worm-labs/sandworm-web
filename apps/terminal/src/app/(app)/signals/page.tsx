import { SignalsScreen } from "@/components/Signals/SignalsScreen";
import { getSignals } from "@/features/signals/source";
import { getSectionCounts } from "@/features/sections/source";
import { getSession } from "@/features/session/source";

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
