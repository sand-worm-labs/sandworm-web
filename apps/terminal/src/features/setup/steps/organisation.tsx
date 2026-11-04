import { OptionCard } from "@sandworm/ui/kit/form/option-card";
import { TextAreaField } from "@sandworm/ui/kit/form/text-area-field";
import { TextField } from "@sandworm/ui/kit/form/text-field";

import { useSetup } from "../context";
import {
  getOrganisationType,
  ORGANISATION_TYPES,
} from "../options/organisation-types";

import type { SetupStepDefinition } from "./types";

function OrganisationStep() {
  const {
    draft: { organisation },
    patch,
  } = useSetup();

  return (
    <>
      <fieldset className="min-w-0 border-0 p-0">
        <legend className="sr-only">Organisation type</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {ORGANISATION_TYPES.map(type => (
            <OptionCard
              key={type.id}
              name="organisation-type"
              value={type.id}
              checked={organisation.type === type.id}
              title={type.label}
              description={type.description}
              onSelect={() => patch("organisation", { type: type.id })}
            />
          ))}
        </div>
      </fieldset>
      {organisation.type === "other" && (
        <TextAreaField
          id="organisation-description"
          label="What does your organisation do?"
          rows={3}
          maxLength={500}
          placeholder="For example: a payments app for freelancers, built on Base."
          value={organisation.description}
          onChange={event =>
            patch("organisation", { description: event.target.value })
          }
        />
      )}
      <div className="flex flex-wrap gap-3">
        <TextField
          id="organisation-name"
          label="Organisation name"
          className="min-w-[240px] flex-1"
          value={organisation.name}
          onChange={event =>
            patch("organisation", { name: event.target.value })
          }
        />
        <TextField
          id="organisation-website"
          label="Website"
          className="min-w-[240px] flex-1"
          value={organisation.website}
          onChange={event =>
            patch("organisation", { website: event.target.value })
          }
        />
      </div>
    </>
  );
}

export const organisationStep: SetupStepDefinition = {
  id: "organisation",
  label: "Your organisation",
  title: ({ client }) => `What kind of organisation is ${client.name}?`,
  description: () =>
    "This picks the starting layout for your Terminal. You can change any of it later.",
  Component: OrganisationStep,
  canContinue: ({ organisation }) => organisation.name.trim().length > 0,
  previewNote: ({ draft }) =>
    `Same layout every ${getOrganisationType(draft.organisation.type).template.name.toLowerCase()} client starts with. Your own numbers fill it in.`,
};
