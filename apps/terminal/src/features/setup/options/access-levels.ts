export const ACCESS_LEVELS = [
  { id: "view", label: "Can view" },
  { id: "request", label: "Can request" },
  { id: "admin", label: "Admin" },
] as const;

export type AccessLevelId = (typeof ACCESS_LEVELS)[number]["id"];
