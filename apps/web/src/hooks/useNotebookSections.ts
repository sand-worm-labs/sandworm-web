"use client";

import {
  getBlocks,
  getLayout,
  getTabsFromBlockGroup,
  isMarkdownBlock,
} from "@sandworm/editor";
import { useMemo } from "react";
import type * as Y from "yjs";

import { markdownHeadings, type NotebookSection } from "@/lib/showcaseTemplate";

// =====================================
// ⬢  useNotebookSections
// =====================================
// A published notebook's sections: every H2 in its markdown cells, in page
// order, each tied to the block it sits in so a contents list can scroll to
// it. Cells hidden from the published view are skipped.
export function useNotebookSections(yDoc: Y.Doc | null): NotebookSection[] {
  return useMemo(() => {
    if (!yDoc) return [];
    const blocks = getBlocks(yDoc);

    return getLayout(yDoc)
      .toArray()
      .flatMap(group => {
        const groupId = group.getAttribute("id");
        if (!groupId) return [];

        return getTabsFromBlockGroup(group, blocks)
          .filter(tab => !tab.isHiddenInPublished)
          .flatMap(tab => {
            const block = blocks.get(tab.blockId);
            if (!block || !isMarkdownBlock(block)) return [];
            const source = block.getAttribute("source")?.toString() ?? "";
            return markdownHeadings(source).map(title => ({
              id: groupId,
              title,
            }));
          });
      });
  }, [yDoc]);
}
