import { toId } from "@/lib/slug";

import type { Opportunity } from "../types";

export function opportunity(init: Omit<Opportunity, "id">): Opportunity {
  return { ...init, id: toId(init.title) };
}
