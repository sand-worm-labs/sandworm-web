import { OptionCard } from "@sandworm/ui/kit/form/option-card";
import { TextAreaField } from "@sandworm/ui/kit/form/text-area-field";
import { TextField } from "@sandworm/ui/kit/form/text-field";

import { ORGANISATION_TYPES } from "@/data/setup/organisation-types";
import type { SetupDraft } from "@/lib/setup/types";

type Organisation = SetupDraft["organisation"];

type OrganisationFieldsProps = {
  organisation: Organisation;
  onChange: (values: Partial<Organisation>) => void;
};

export function OrganisationFields({
  organisation,
  onChange,
}: OrganisationFieldsProps) {
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
              onSelect={() => onChange({ type: type.id })}
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
          onChange={event => onChange({ description: event.target.value })}
        />
      )}
      <div className="flex flex-wrap gap-3">
        <TextField
          id="organisation-name"
          label="Organisation name"
          className="min-w-[240px] flex-1"
          value={organisation.name}
          onChange={event => onChange({ name: event.target.value })}
        />
        <TextField
          id="organisation-website"
          label="Website"
          className="min-w-[240px] flex-1"
          value={organisation.website}
          onChange={event => onChange({ website: event.target.value })}
        />
      </div>
    </>
  );
}
