import { Checkbox } from "@sandworm/ui/kit/form/checkbox";
import { NativeSelect } from "@sandworm/ui/kit/form/native-select";
import { labelClassName } from "@sandworm/ui/kit/form/styles";
import { Tag } from "@sandworm/ui/kit/tag";

import { TrackingFields } from "@/components/Setup/TrackingFields";
import { pluralise } from "@/lib/format";
import { useTeamClient } from "@/providers/TeamProvider";
import { describeInvite } from "@/lib/team/draft";
import { INVITE_TIMINGS } from "@/data/team/invite-timings";
import { getPlan } from "@/data/team/plans";
import { TeamStepId } from "@/lib/team/routes";

import type { TeamStepDefinition } from "./types";

function StarterList() {
  const {
    draft: { details, starterIds },
    starters,
    toggleStarter,
  } = useTeamClient();

  return (
    <section aria-labelledby="starter-title" className="flex flex-col gap-2">
      <div>
        <h2 id="starter-title" className="text-[13px] font-medium text-ink-100">
          Ready on day one
        </h2>
        <p className="text-xs text-ink-400">
          Existing research that fits {details.name || "this client"}. Ticked
          items are in their Analysis when they first log in.
        </p>
      </div>
      <ul className="flex flex-col">
        {starters.map((starter, index) => {
          const inputId = `starter-${starter.id}`;
          return (
            <li
              key={starter.id}
              className={
                index > 0 ? "border-t border-border-secondary" : undefined
              }
            >
              <label
                htmlFor={inputId}
                className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3"
              >
                <Checkbox
                  id={inputId}
                  checked={starterIds.includes(starter.id)}
                  onCheckedChange={() => toggleStarter(starter.id)}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium text-ink-100">
                    {starter.title}
                  </span>
                  <span className="text-xs text-ink-400">{starter.fits}</span>
                </span>
                <Tag>
                  {starter.data === "public"
                    ? "Public onchain"
                    : "Client-shared"}
                </Tag>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function InviteSection() {
  const { draft, setInviteTiming } = useTeamClient();

  return (
    <section
      aria-labelledby="invite-title"
      className="flex flex-wrap items-end justify-between gap-3 rounded-[14px] border border-border-secondary bg-inputBg px-4 py-3.5"
    >
      <div className="flex min-w-[240px] flex-1 flex-col gap-1">
        <h2 id="invite-title" className={labelClassName}>
          Invite
        </h2>
        <span className="text-ink-500">{describeInvite(draft)}</span>
      </div>
      <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
        <span className={labelClassName}>Send the invite</span>
        <NativeSelect
          label="Send the invite"
          value={draft.inviteTiming}
          options={INVITE_TIMINGS}
          onChange={setInviteTiming}
          className="w-full"
        />
      </div>
    </section>
  );
}

function TrackingStep() {
  const {
    draft: { tracking },
    patchTracking,
  } = useTeamClient();

  return (
    <>
      <TrackingFields
        variant="team"
        tracking={tracking}
        onChange={patchTracking}
      />
      <StarterList />
      <InviteSection />
    </>
  );
}

function countListedAddresses(addresses: string): number {
  return addresses.split("\n").filter(line => line.trim()).length;
}

export const trackingStep: TeamStepDefinition = {
  id: TeamStepId.TRACKING,
  label: "What to track and invite",
  title: "What should we track?",
  description:
    "Add what you know. Everything is checked before the client's numbers go live.",
  Component: TrackingStep,
  canContinue: () => true,
  previewNote: ({ details, tracking, starterIds }) =>
    `${getPlan(details.plan).label} plan. Tracking ${pluralise(countListedAddresses(tracking.addresses), "contract")}, ${pluralise(tracking.competitors.length, "competitor")} and ${pluralise(tracking.regions.length, "region")}; ${pluralise(starterIds.length, "report")} ready on day one.`,
};
