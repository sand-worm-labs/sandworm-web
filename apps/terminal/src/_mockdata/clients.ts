import type { OrganisationTypeId } from "@/features/setup/options/organisation-types";

// The demo clients the preview can show: one of each client type, and named
// clients whose data comes from real research.
export type MockClientId = OrganisationTypeId | "paycrest";
