import { CheckboxField } from "@/components/form/CheckboxField";
import { ChipInput } from "@/components/form/ChipInput";
import { TextAreaField } from "@/components/form/TextAreaField";
import { pluralise } from "@/lib/format";
import { site } from "@/config/site";

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
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <TextAreaField
          id="tracking-addresses"
          label="Your contracts and wallets"
          monospaced
          rows={3}
          value={tracking.addresses}
          onChange={event =>
            patch("tracking", { addresses: event.target.value })
          }
        />
        <CheckboxField
          id="tracking-auto-discover"
          checked={tracking.autoDiscover}
          onCheckedChange={autoDiscover => patch("tracking", { autoDiscover })}
          label={`Let ${site.name} find the rest of our contracts`}
        />
      </div>
      <ChipInput
        label="Competitors to compare against"
        hint="Suggested from where your users go when they leave."
        values={tracking.competitors}
        onChange={competitors => patch("tracking", { competitors })}
      />
      <ChipInput
        label="Regions you care about"
        values={tracking.regions}
        onChange={regions => patch("tracking", { regions })}
      />
      <div className="rounded-[14px] border border-border-secondary bg-inputBg px-4 py-3.5">
        <CheckboxField
          id="tracking-share-internal-data"
          checked={tracking.shareInternalData}
          onCheckedChange={shareInternalData =>
            patch("tracking", { shareInternalData })
          }
          label={
            <>
              Share internal data for deeper analysis{" "}
              <span className="font-normal text-ink-400">(optional)</span>
            </>
          }
          description="We use public onchain data by default. Anything you share is used only for your Terminal, and never for other clients without your written consent."
        />
      </div>
    </div>
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
