import { OptionCard } from "@sandworm/ui/kit/form/option-card";
import { TextField } from "@sandworm/ui/kit/form/text-field";

import { OrganisationFields } from "@/components/Setup/OrganisationFields";
import { useTeamClient } from "@/providers/TeamProvider";
import { canLeaveDetails } from "@/lib/team/draft";
import { getPlan, PLANS } from "@/data/team/plans";

import type { TeamStepDefinition } from "./types";

function DetailsStep() {
  const {
    draft: { details },
    patchDetails,
  } = useTeamClient();

  return (
    <>
      <OrganisationFields organisation={details} onChange={patchDetails} />
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="mb-2 text-[13px] font-medium text-ink-100">
          Plan
        </legend>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {PLANS.map(plan => (
            <OptionCard
              key={plan.id}
              name="plan"
              value={plan.id}
              checked={details.plan === plan.id}
              title={plan.label}
              description={plan.description}
              onSelect={() => patchDetails({ plan: plan.id })}
            />
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-ink-100">
          Client admin
        </span>
        <div className="flex flex-wrap gap-3">
          <TextField
            id="team-admin-name"
            label="Admin name"
            hideLabel
            placeholder="Name"
            className="min-w-[200px] flex-1"
            value={details.adminName}
            onChange={event => patchDetails({ adminName: event.target.value })}
          />
          <TextField
            id="team-admin-email"
            label="Admin email"
            hideLabel
            type="email"
            placeholder="name@company.com"
            className="min-w-[240px] flex-[1.4]"
            value={details.adminEmail}
            onChange={event => patchDetails({ adminEmail: event.target.value })}
          />
        </div>
        <span className="text-xs text-ink-400">
          They join by signing in to Sandworm with this email.
        </span>
      </div>
    </>
  );
}

export const detailsStep: TeamStepDefinition = {
  id: "details",
  label: "Client details",
  title: "New client",
  description:
    "Set everything up here. The client logs in to a ready Terminal.",
  Component: DetailsStep,
  canContinue: canLeaveDetails,
  previewNote: ({ details }) => {
    const plan = getPlan(details.plan);
    return `${plan.label} plan: ${plan.description.toLowerCase()}.`;
  },
};
