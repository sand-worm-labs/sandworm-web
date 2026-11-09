import type { BriefingItemData } from "@sandworm/types/terminal";

import { toId } from "@/lib/slug";

export function briefingItem(
  init: Omit<BriefingItemData, "id" | "sourcePath">
): BriefingItemData {
  return { ...init, id: toId(init.title), sourcePath: null };
}
