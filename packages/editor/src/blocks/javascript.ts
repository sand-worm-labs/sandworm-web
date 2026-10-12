import * as Y from "yjs";
import {
  BlockType,
  BaseBlock,
  YBlock,
  getAttributeOr,
  getBaseAttributes,
  duplicateBaseAttributes,
  duplicateYText,
} from "./index.js";

// A cell of JavaScript, for notebooks that run in the browser. The page runs
// its source in a sandboxed frame; nothing executes it on the server, so it
// has no execution status or stored result. Shaped like a markdown block
// (source plus the edit-with-AI fields), which lets code that doesn't know
// about it treat it as one.
export type JavaScriptBlock = BaseBlock<BlockType.JavaScript> & {
  source: Y.Text;
  editWithAIPrompt: Y.Text;
  isEditWithAIPromptOpen: boolean;
  aiSuggestions: Y.Text | null;
};

export const isJavaScriptBlock = (
  block: YBlock
): block is Y.XmlElement<JavaScriptBlock> => {
  return block.getAttribute("type") === BlockType.JavaScript;
};

export const makeJavaScriptBlock = (
  id: string,
  opts?: { source?: string },
  isAiInput?: boolean
): Y.XmlElement<JavaScriptBlock> => {
  const yBlock = new Y.XmlElement<JavaScriptBlock>("block");

  const attrs: JavaScriptBlock = {
    id,
    index: null,
    title: "",
    type: BlockType.JavaScript,
    isAiInput: isAiInput ?? false,
    source: new Y.Text(opts?.source ?? ""),
    editWithAIPrompt: new Y.Text(""),
    isEditWithAIPromptOpen: false,
    aiSuggestions: null,
  };

  for (const [key, value] of Object.entries(attrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
};

export function getJavaScriptSource(
  block: Y.XmlElement<JavaScriptBlock>
): Y.Text {
  return getAttributeOr(block, "source", new Y.Text(""));
}

export function getJavaScriptAttributes(
  block: Y.XmlElement<JavaScriptBlock>
): JavaScriptBlock {
  return {
    ...getBaseAttributes(block),
    source: getJavaScriptSource(block),
    editWithAIPrompt: getAttributeOr(block, "editWithAIPrompt", new Y.Text("")),
    isEditWithAIPromptOpen: getAttributeOr(
      block,
      "isEditWithAIPromptOpen",
      false
    ),
    aiSuggestions: getAttributeOr(block, "aiSuggestions", null),
  };
}

export function duplicateJavaScriptBlock(
  newId: string,
  block: Y.XmlElement<JavaScriptBlock>
): Y.XmlElement<JavaScriptBlock> {
  const prevAttrs = getJavaScriptAttributes(block);

  const newAttrs: JavaScriptBlock = {
    ...duplicateBaseAttributes(newId, prevAttrs),
    source: duplicateYText(prevAttrs.source),
    editWithAIPrompt: new Y.Text(""),
    isEditWithAIPromptOpen: false,
    aiSuggestions: null,
  };

  const yBlock = new Y.XmlElement<JavaScriptBlock>("block");
  for (const [key, value] of Object.entries(newAttrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
}
