import { CheckboxField } from "@sandworm/ui/kit/form/checkbox-field";
import { ChipInput } from "@sandworm/ui/kit/form/chip-input";
import { TextAreaField } from "@sandworm/ui/kit/form/text-area-field";

import { site } from "@/config/site";
import type { SetupTracking } from "@/lib/setup/types";

// The client talks about "your" contracts; the team sets them up for someone else.
const COPY = {
  client: {
    addresses: "Your contracts and wallets",
    discover: `Let ${site.name} find the rest of our contracts`,
    competitorsHint: "Suggested from where your users go when they leave.",
    regions: "Regions you care about",
  },
  team: {
    addresses: "Contracts and wallets",
    discover: `Let ${site.name} find the rest of their contracts`,
    competitorsHint: "Suggested from where their users go when they leave.",
    regions: "Regions that matter to them",
  },
} as const;

type TrackingFieldsProps = {
  tracking: SetupTracking;
  onChange: (values: Partial<SetupTracking>) => void;
  // The client decides whether to share internal data; the team does not.
  variant?: keyof typeof COPY;
};

export function TrackingFields({
  tracking,
  onChange,
  variant = "client",
}: TrackingFieldsProps) {
  const copy = COPY[variant];

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex flex-col gap-2">
        <TextAreaField
          id="tracking-addresses"
          label={copy.addresses}
          rows={3}
          value={tracking.addresses}
          onChange={event => onChange({ addresses: event.target.value })}
        />
        <CheckboxField
          id="tracking-auto-discover"
          checked={tracking.autoDiscover}
          onCheckedChange={autoDiscover => onChange({ autoDiscover })}
          label={copy.discover}
        />
      </div>
      <ChipInput
        label="Competitors to compare against"
        hint={copy.competitorsHint}
        values={tracking.competitors}
        onChange={competitors => onChange({ competitors })}
      />
      <ChipInput
        label={copy.regions}
        values={tracking.regions}
        onChange={regions => onChange({ regions })}
      />
      {variant === "client" && (
        <div className="rounded-[14px] border border-border-secondary bg-inputBg px-4 py-3.5">
          <CheckboxField
            id="tracking-share-internal-data"
            checked={tracking.shareInternalData}
            onCheckedChange={shareInternalData =>
              onChange({ shareInternalData })
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
      )}
    </div>
  );
}
