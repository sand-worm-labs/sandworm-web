import { OptionDropdown } from "@sandworm/ui/kit/form/option-dropdown";
import { TextField } from "@sandworm/ui/kit/form/text-field";
import { ToggleChip } from "@sandworm/ui/kit/form/toggle-chip";

import { pluralise } from "@/lib/format";
import { site } from "@/config/site";
import { useSetup } from "@/providers/SetupProvider";
import { ACCESS_LEVELS } from "@/data/setup/access-levels";
import { GOALS, MAX_GOALS, type GoalId } from "@/data/setup/goals";
import type { TeamInvite } from "@/lib/setup/types";

import type { SetupStepDefinition } from "./types";

function GoalsStep() {
  const {
    draft: { goals, team },
    patch,
  } = useSetup();

  const toggleGoal = (id: GoalId) =>
    patch("goals", {
      selected: goals.selected.includes(id)
        ? goals.selected.filter(goal => goal !== id)
        : [...goals.selected, id],
    });

  const updateInvite = (id: string, values: Partial<TeamInvite>) =>
    patch("team", {
      invites: team.invites.map(invite =>
        invite.id === id ? { ...invite, ...values } : invite
      ),
    });

  const isGoalLimitReached = goals.selected.length >= MAX_GOALS;

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="mb-2 text-[13px] font-medium text-ink-100">
          Pick up to three
        </legend>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(goal => {
            const pressed = goals.selected.includes(goal.id);
            return (
              <ToggleChip
                key={goal.id}
                pressed={pressed}
                disabled={!pressed && isGoalLimitReached}
                onToggle={() => toggleGoal(goal.id)}
              >
                {goal.label}
              </ToggleChip>
            );
          })}
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink-100">
          Invite your team
        </span>
        <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-2">
          {team.invites.map(invite => (
            <InviteRow
              key={invite.id}
              invite={invite}
              onChange={values => updateInvite(invite.id, values)}
            />
          ))}
        </div>
        <span className="text-xs text-ink-400">
          People who can request may submit research requests. It uses your
          plan's allowance.
        </span>
      </div>
    </div>
  );
}

type InviteRowProps = {
  invite: TeamInvite;
  onChange: (values: Partial<TeamInvite>) => void;
};

function InviteRow({ invite, onChange }: InviteRowProps) {
  return (
    <>
      <TextField
        id={`team-${invite.id}`}
        label="Teammate email"
        hideLabel
        type="email"
        placeholder="name@company.com"
        value={invite.email}
        onChange={event => onChange({ email: event.target.value })}
      />
      <OptionDropdown
        label={`Access for ${invite.email || "new teammate"}`}
        value={invite.access}
        options={ACCESS_LEVELS}
        onChange={access => onChange({ access })}
        className="h-[38px] self-end"
      />
    </>
  );
}

export const goalsStep: SetupStepDefinition = {
  id: "goals",
  label: "Goals and team",
  title: () => "What do you want from Terminal?",
  description: () =>
    `${site.name} uses this to decide what to research for you first.`,
  Component: GoalsStep,
  canContinue: () => true,
  previewNote: ({ session: { client } }) =>
    `Your first briefing is expected ${pluralise(client.firstBriefingDays, "day")} after ${site.name} checks your setup.`,
};
