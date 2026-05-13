import { useMemo } from "react";
import type * as Y from "yjs";
import type { YBlock, YBlockGroup, BlockType } from "@sandworm/editor";
import { getPrettyTitle, getTabsFromBlockGroup } from "@sandworm/editor";

import { useYDocState } from "@/components/Editor/hooks/useYDocs";
import type { BlockReferenceItem } from "@/components/Chats/types";

// =====================================
// ⬢ Yjs Getters
// =====================================
const layoutGetter = (yDoc: Y.Doc) => yDoc.getArray<YBlockGroup>("layout");
const blocksGetter = (yDoc: Y.Doc) => yDoc.getMap<YBlock>("blocks");

// =====================================
// ⬢ Label Helper
// =====================================

function deriveLabel(
  title: string | null | undefined,
  blockType: BlockType,
  index: number
): string {
  if (title && title.trim().length > 0) return title.trim();
  return `${getPrettyTitle(blockType)} #${index}`;
}

// =====================================
// ⬢ Hook
// =====================================

export function useNotebookBlocks(yDoc: Y.Doc): BlockReferenceItem[] {
  const { state: layout } = useYDocState<Y.Array<YBlockGroup>>(
    yDoc,
    layoutGetter
  );
  const { state: blocks } = useYDocState<Y.Map<YBlock>>(yDoc, blocksGetter);

  return useMemo(() => {
    const result: BlockReferenceItem[] = [];
    let flatIndex = 1;

    layout.value.toArray().forEach(blockGroup => {
      const tabs = getTabsFromBlockGroup(blockGroup, blocks.value);

      tabs.forEach(tab => {
        const block = blocks.value.get(tab.blockId);
        if (!block) return;

        const rawType = block.getAttribute("type") as BlockType | undefined;
        if (!rawType) return;

        const rawTitle = block.getAttribute("title") as string | undefined;

        result.push({
          sourceKind: "block",
          id: tab.blockId,
          blockKind: rawType,
          label: deriveLabel(rawTitle, rawType, flatIndex),
          index: flatIndex,
        });

        flatIndex++;
      });
    });

    return result;
  }, [layout, blocks]);
}
