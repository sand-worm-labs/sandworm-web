import { ORGANISATION_TYPES } from "@/data/setup/organisation-types";
import type { TeamClientDraft } from "@/types";

export const EMPTY_TEAM_CLIENT_DRAFT: TeamClientDraft = {
  details: {
    name: "",
    website: "",
    type: ORGANISATION_TYPES[0].id,
    description: "",
    plan: "pro",
    adminName: "",
    adminEmail: "",
  },
  tracking: {
    addresses: "",
    autoDiscover: true,
    competitors: [],
    regions: [],
    shareInternalData: false,
  },
  starterIds: [],
  inviteTiming: "when_ready",
};
