import * as Y from "yjs";
import {
  BlockType,
  BaseBlock,
  YBlock,
  getAttributeOr,
  getBaseAttributes,
  duplicateBaseAttributes,
} from "./index.js";
import { ExecutionStatus } from "../execution/item.js";


export type MarkdownBlock = BaseBlock<BlockType.Markdown> & {
  source: Y.Text;
  editWithAIPrompt: Y.Text;
  isEditWithAIPromptOpen: boolean;
};


export const isMarkdownBlock = (
  block: YBlock
): block is Y.XmlElement<MarkdownBlock> => {
  return block.getAttribute("type") === BlockType.Markdown;
};


export const makeMarkdownBlock = (
  id: string
): Y.XmlElement<MarkdownBlock> => {
  const yBlock = new Y.XmlElement<MarkdownBlock>("block");

  const attrs: MarkdownBlock = {
    id,
    index: null,
    title: "",
    type: BlockType.Markdown,
    isAiInput: false,
    source: new Y.Text(""),
    editWithAIPrompt: new Y.Text(""),
    isEditWithAIPromptOpen: false,
  };

  for (const [key, value] of Object.entries(attrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
};


export function getMarkdownAttributes(
  block: Y.XmlElement<MarkdownBlock>
): MarkdownBlock {
  return {
    ...getBaseAttributes(block),
    source: getAttributeOr(block, "source", new Y.Text("")),
    editWithAIPrompt: getMarkdownBlockEditWithAIPrompt(block),
    isEditWithAIPromptOpen: isMarkdownBlockEditWithAIPromptOpen(block),
  };
}


export function duplicateMarkdownBlock(
  newId: string,
  block: Y.XmlElement<MarkdownBlock>
): Y.XmlElement<MarkdownBlock> {
  const prevAttrs = getMarkdownAttributes(block);

  const newAttrs: MarkdownBlock = {
    ...duplicateBaseAttributes(newId, prevAttrs),
    source: new Y.Text(prevAttrs.source.toString()),
    editWithAIPrompt: new Y.Text(prevAttrs.editWithAIPrompt.toString()),
    isEditWithAIPromptOpen: false, 
  };

  const yBlock = new Y.XmlElement<MarkdownBlock>("block");
  for (const [key, value] of Object.entries(newAttrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
}


export function getMarkdownBlockExecStatus(
  _block: Y.XmlElement<MarkdownBlock>
): ExecutionStatus {
  return "completed";
}



export function getMarkdownBlockEditWithAIPrompt(
  block: Y.XmlElement<MarkdownBlock>
): Y.Text {
  return getAttributeOr(block, "editWithAIPrompt", new Y.Text(""));
}

export function isMarkdownBlockEditWithAIPromptOpen(
  block: Y.XmlElement<MarkdownBlock>
): boolean {
  return getAttributeOr(block, "isEditWithAIPromptOpen", false);
}

export function toggleMarkdownEditWithAIPromptOpen(
  block: Y.XmlElement<MarkdownBlock>
) {
  const operation = () => {
    const isOpen = getAttributeOr(block, "isEditWithAIPromptOpen", false);
    block.setAttribute("isEditWithAIPromptOpen", !isOpen);
  };

  if (block.doc) {
    block.doc.transact(operation);
  } else {
    operation();
  }
}

export function closeMarkdownEditWithAIPrompt(
  block: Y.XmlElement<MarkdownBlock>,
  cleanPrompt: boolean
) {
  const operation = () => {
    if (cleanPrompt) {
      const prompt = getMarkdownBlockEditWithAIPrompt(block);
      prompt.delete(0, prompt.length);
    }
    block.setAttribute("isEditWithAIPromptOpen", false);
  };

  if (block.doc) {
    block.doc.transact(operation);
  } else {
    operation();
  }
}