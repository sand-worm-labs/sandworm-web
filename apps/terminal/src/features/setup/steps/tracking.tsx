import { pluralise } from "@/lib/format";
import { site } from "@/config/site";
import { TrackingFields } from "@/components/Setup/TrackingFields";

import { useSetup } from "../context";

import type { SetupStepDefinition } from "./types";

function countListedAddresses(addresses: string): number {
  return addresses.split("\n").filter(line => line.trim()).length;
}

function TrackingStep() {
  const {
    draft: { tracking },
    patch,
  } = useSetup();

  return (
    <TrackingFields
      tracking={tracking}
      onChange={values => patch("tracking", values)}
    />
  );
}

export const trackingStep: SetupStepDefinition = {
  id: "tracking",
  label: "What to track",
  title: () => "What should we track?",
  description: () =>
    `Add what you know. ${site.name} finds the rest and checks everything before your numbers go live.`,
  Component: TrackingStep,
  canContinue: () => true,
  previewNote: ({ draft: { tracking } }) =>
    `Tracking ${pluralise(countListedAddresses(tracking.addresses), "contract")}, ${pluralise(tracking.competitors.length, "competitor")} and ${pluralise(tracking.regions.length, "region")} so far.`,
};
