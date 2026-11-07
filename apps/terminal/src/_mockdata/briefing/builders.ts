import { toId } from "@/lib/slug";
import type { BriefingItem } from "@/lib/briefing/types";

export function briefingItem(init: Omit<BriefingItem, "id">): BriefingItem {
  return { ...init, id: toId(init.title) };
}
