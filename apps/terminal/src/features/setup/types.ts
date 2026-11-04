import type { AccessLevelId } from "./options/access-levels";
import type { GoalId } from "./options/goals";
import type { OrganisationTypeId } from "./options/organisation-types";

export type TeamInvite = { id: string; email: string; access: AccessLevelId };

export type SetupDraft = {
  organisation: { type: OrganisationTypeId; name: string; website: string };
  tracking: {
    addresses: string;
    autoDiscover: boolean;
    competitors: string[];
    regions: string[];
    shareInternalData: boolean;
  };
  goals: { selected: GoalId[] };
  team: { invites: TeamInvite[] };
};
