import type { OrganisationTypeId } from "@/data/setup/organisation-types";

// The demo clients the preview can show: one of each client type, and named
// clients whose data comes from real research.
export type MockClientId = OrganisationTypeId | "paycrest";
