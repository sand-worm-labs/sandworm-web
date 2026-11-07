import type { EntityKind } from "@/types";

export const ENTITY_KINDS = ["project", "region", "sector"] as const;

export function isEntityKind(value: string): value is EntityKind {
  return ENTITY_KINDS.some(kind => kind === value);
}
