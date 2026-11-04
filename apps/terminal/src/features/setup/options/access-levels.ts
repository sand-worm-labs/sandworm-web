import type { AccessLevelId } from "@sandworm/types/terminal";

export type { AccessLevelId } from "@sandworm/types/terminal";

export const ACCESS_LEVELS = [
  { id: "view", label: "Can view" },
  { id: "request", label: "Can request" },
  { id: "admin", label: "Admin" },
] as const satisfies readonly { id: AccessLevelId; label: string }[];
