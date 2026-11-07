import { ORGANISATION_TYPES } from "@/data/setup/organisation-types";

import type { SetupDraft } from "./types";

// Where setup starts for someone who hasn't saved anything yet.
export const EMPTY_SETUP_DRAFT: SetupDraft = {
  organisation: {
    type: ORGANISATION_TYPES[0].id,
    name: "",
    website: "",
    description: "",
  },
  tracking: {
    addresses: "",
    autoDiscover: true,
    competitors: [],
    regions: [],
    shareInternalData: false,
  },
  goals: { selected: [] },
  team: { invites: [] },
};
