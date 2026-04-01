import { useCallback } from "react";
import * as Y from "yjs";
import { addBlockGroup, BlockType } from "@sandworm/editor";
import type { YBlock, YBlockGroup } from "@sandworm/editor";

import type { NotebookAIRequest, BlockSpec } from "@/app/api/chat/route";

function writeTitleToFragment(fragment: Y.XmlFragment, text: string) {
  if (fragment.length > 0) {
    fragment.delete(0, fragment.length);
  }
  const titleEl = new Y.XmlElement("title");
  const titleText = new Y.XmlText(text);
  titleEl.insert(0, [titleText]);
  fragment.insert(0, [titleEl]);
}

function applyBlockSpec(
  spec: BlockSpec,
  yLayout: Y.Array<YBlockGroup>,
  yBlocks: Y.Map<YBlock>,
  index: number
): void {
  // eslint-disable-next-line default-case
  switch (spec.type) {
    case "title": {
      const blockId = addBlockGroup(
        yLayout,
        yBlocks,
        { type: BlockType.RichText },
        index
      );
      const block = yBlocks.get(blockId);
      if (block) {
        const fragment = block.getAttribute("title") as
          | Y.XmlFragment
          | undefined;
        if (fragment) {
          writeTitleToFragment(fragment, spec.text);
        }
        block.setAttribute("title", spec.text);
      }
      break;
    }

    case "richtext": {
      const blockId = addBlockGroup(
        yLayout,
        yBlocks,
        { type: BlockType.RichText },
        index
      );
      const block = yBlocks.get(blockId);
      if (block && spec.text) {
        const fragment = block.getAttribute("title") as
          | Y.XmlFragment
          | undefined;
        if (fragment) {
          writeTitleToFragment(fragment, spec.text);
        }
      }
      break;
    }

    case "sql": {
      addBlockGroup(
        yLayout,
        yBlocks,
        {
          type: BlockType.SQL,
          dataSourceId: spec.dataSourceId,
          isFileDataSource: spec.isFileDataSource,
          source: spec.source,
        },
        index
      );
      break;
    }

    case "python": {
      addBlockGroup(
        yLayout,
        yBlocks,
        {
          type: BlockType.Python,
          source: spec.source,
        },
        index
      );
      break;
    }

    case "visualization": {
      addBlockGroup(
        yLayout,
        yBlocks,
        {
          type: BlockType.VisualizationV2,
          dataframeName: spec.dataframeName,
        },
        index
      );
      break;
    }
  }
}

interface UseNotebookAIOptions {
  yDoc: Y.Doc;
  insertAtIndex?: number;
  dataSources?: NotebookAIRequest["dataSources"];
  dataframes?: string[];
}

// =====================================
// ⬢ Use Notebook Ai
// =====================================
export function useNotebookAI({
  yDoc,
  insertAtIndex,
  dataSources,
  dataframes,
}: UseNotebookAIOptions) {
  const generate = useCallback(
    async (prompt: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          dataSources,
          dataframes,
        } satisfies NotebookAIRequest),
      });

      if (!res.ok) throw new Error("AI generation failed");

      const data: {
        blocks: BlockSpec[];
        reply: string;
        documentTitle: string | null;
      } = await res.json();
      const { blocks } = data;

      const yLayout = yDoc.getArray<YBlockGroup>("layout");
      const yBlocks = yDoc.getMap<YBlock>("blocks");
      const startIndex = insertAtIndex ?? yLayout.length;

      yDoc.transact(() => {
        if (data.documentTitle) {
          const titleFragment = yDoc.getXmlFragment("title");
          writeTitleToFragment(titleFragment, data.documentTitle);
        }

        blocks.forEach((spec, i) => {
          applyBlockSpec(spec, yLayout, yBlocks, startIndex + i);
        });
      });

      return { blocks, reply: data.reply };
    },
    [yDoc, insertAtIndex, dataSources, dataframes]
  );

  return { generate };
}
