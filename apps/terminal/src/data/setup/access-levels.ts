import { AccessLevelId } from "@sandworm/types/terminal";

export type { AccessLevelId } from "@sandworm/types/terminal";

export const ACCESS_LEVELS = [
  { id: AccessLevelId.VIEW, label: "Can view" },
  { id: AccessLevelId.REQUEST, label: "Can request" },
  { id: AccessLevelId.ADMIN, label: "Admin" },
] as const satisfies readonly { id: AccessLevelId; label: string }[];
