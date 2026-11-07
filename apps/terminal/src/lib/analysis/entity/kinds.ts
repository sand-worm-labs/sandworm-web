export const ENTITY_KINDS = ["project", "region", "sector"] as const;

export type EntityKind = (typeof ENTITY_KINDS)[number];

export function isEntityKind(value: string): value is EntityKind {
  return ENTITY_KINDS.some(kind => kind === value);
}
