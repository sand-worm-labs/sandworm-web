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

// =====================================
// ⬢ Types
// =====================================
export type MarkdownBlock = BaseBlock<BlockType.Markdown> & {
  // Y.Text — plain markdown source, not a ProseMirror fragment.
  // Simpler than XmlFragment: no schema, no node types, just text + Yjs CRDT.
  source: Y.Text;
};

// =====================================
// ⬢ Guards
// =====================================
export const isMarkdownBlock = (
  block: YBlock
): block is Y.XmlElement<MarkdownBlock> => {
  return block.getAttribute("type") === BlockType.Markdown;
};

// =====================================
// ⬢ Factory
// =====================================
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
  };

  for (const [key, value] of Object.entries(attrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
};

// =====================================
// ⬢ Accessors
// =====================================
export function getMarkdownAttributes(
  block: Y.XmlElement<MarkdownBlock>
): MarkdownBlock {
  return {
    ...getBaseAttributes(block),
    source: getAttributeOr(block, "source", new Y.Text("")),
  };
}

// =====================================
// ⬢ Duplicate
// =====================================
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
  };

  const yBlock = new Y.XmlElement<MarkdownBlock>("block");
  for (const [key, value] of Object.entries(newAttrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
}

// =====================================
// ⬢ Exec Status
// =====================================
export function getMarkdownBlockExecStatus(
  _block: Y.XmlElement<MarkdownBlock>
): ExecutionStatus {
  return "completed";
}