import { useCallback, useMemo, useState } from "react";

import type { OverviewBlock } from "@/types";
import { toggleId } from "@/lib/overview/visibility";

export function useBlockVisibility(blocks: readonly OverviewBlock[]) {
  const [hiddenIds, setHiddenIds] = useState<readonly string[]>([]);

  const toggle = useCallback(
    (id: string) => setHiddenIds(current => toggleId(current, id)),
    []
  );
  const reset = useCallback(() => setHiddenIds([]), []);
  const visibleBlocks = useMemo(
    () => blocks.filter(block => !hiddenIds.includes(block.id)),
    [blocks, hiddenIds]
  );

  return { visibleBlocks, hiddenIds, toggle, reset };
}
