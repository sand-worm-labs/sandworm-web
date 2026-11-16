import { SignalsScreen } from "@/components/Signals/SignalsScreen";
import { getSectionCounts } from "@/lib/sections/source";
import { getSession } from "@/lib/session/source";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("Signals");

export default async function SignalsRoute() {
  const [counts, session] = await Promise.all([
    getSectionCounts(),
    getSession(),
  ]);

  return (
    <SignalsScreen
      counts={counts}
      viewer={{ clientName: session.client.name }}
    />
  );
}
