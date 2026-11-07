import {
  getOrganisationType,
  type OrganisationTypeId,
  type TemplateBlock,
  type TemplateBlueprint,
} from "@/data/setup/organisation-types";

const BRIEFING_BLOCK: TemplateBlock = {
  title: "Briefing",
  summary: "What changed since your last visit",
};

export function getTemplatePreview(
  typeId: OrganisationTypeId
): TemplateBlueprint {
  const { template } = getOrganisationType(typeId);
  return { ...template, blocks: [BRIEFING_BLOCK, ...template.blocks] };
}
