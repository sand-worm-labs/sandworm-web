import { OrganisationFields } from "@/components/Setup/OrganisationFields";

import { useSetup } from "../context";
import { getOrganisationType } from "../options/organisation-types";

import type { SetupStepDefinition } from "./types";

function OrganisationStep() {
  const {
    draft: { organisation },
    patch,
  } = useSetup();

  return (
    <OrganisationFields
      organisation={organisation}
      onChange={values => patch("organisation", values)}
    />
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
