import { toId } from "@/lib/slug";

import type { BriefingBar, BriefingItem } from "../types";

export function briefingItem(init: Omit<BriefingItem, "id">): BriefingItem {
  return { ...init, id: toId(init.title) };
}

export function bar(
  label: string,
  share: number,
  value: string,
  isHighlighted = false
): BriefingBar {
  return { id: toId(label), label, share, value, isHighlighted };
}
