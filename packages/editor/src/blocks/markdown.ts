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

export type MarkdownEditIntent = 'fix' | 'shorten' | 'expand' | 'rewrite' | 'custom'

export type MarkdownBlock = BaseBlock<BlockType.Markdown> & {
  // Y.Text — plain markdown source, not a ProseMirror fragment.
  // Simpler than XmlFragment: no schema, no node types, just text + Yjs CRDT.
  source: Y.Text;
  intent: MarkdownEditIntent;
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
    editWithAIPrompt: new Y.Text(),
    isEditWithAIPromptOpen: false,
    intent: 'fix',
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
    intent: getAttributeOr(block, "intent", 'fix'),
  };
}


export function duplicateMarkdownBlock(
  newId: string,
  block: Y.XmlElement<MarkdownBlock>
): Y.XmlElement<MarkdownBlock> {
  const prevAttrs = getMarkdownAttributes(block);

  // Y.Text must be copied manually — clone the string content into a new instance
  const newSource = new Y.Text(prevAttrs.source.toString());

  const newAttrs: MarkdownBlock = {
    ...duplicateBaseAttributes(newId, prevAttrs),
    source: newSource,
    intent: prevAttrs.intent,
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