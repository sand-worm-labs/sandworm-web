import { toId } from "@/lib/slug";
import type { Opportunity } from "@/features/opportunities/types";

export function opportunity(init: Omit<Opportunity, "id">): Opportunity {
  return { ...init, id: toId(init.title) };
}
