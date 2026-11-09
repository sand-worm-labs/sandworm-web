import type { BriefingItemData } from "@sandworm/types/terminal";

import { sampleCell } from "@/_mockdata/sample-cell";
import { toId } from "@/lib/slug";

export function briefingItem(
  init: Omit<BriefingItemData, "id" | "sourcePath" | "isArchived">
): BriefingItemData {
  return {
    ...init,
    id: toId(init.title),
    detail: { outputs: sampleCell, ...init.detail },
    isArchived: false,
    sourcePath: null,
  };
}
