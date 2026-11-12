import { TrackingSettings } from "@/components/Settings/TrackingSettings";
import { getSession } from "@/lib/session/source";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata("What you track");

export default async function SettingsRoute() {
  const session = await getSession();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-medium md:text-[26px] leading-tight text-ink-100">
          What {session.client.name} tracks
        </h1>
        <p className="mt-1.5 text-sm text-ink-400">
          Change who you compare against and where you look. Your Overview
          updates after you save.
        </p>
      </div>
      <TrackingSettings />
    </div>
  );
}
