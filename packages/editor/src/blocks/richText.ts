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
import { duplicateYXmlFragment } from "../index.js";

export type RichTextBlock = BaseBlock<BlockType.RichText> & {
  content: Y.XmlFragment;
};
export const isRichTextBlock = (
  block: YBlock
): block is Y.XmlElement<RichTextBlock> => {
  return block.getAttribute("type") === BlockType.RichText;
};

export const makeRichTextBlock = (id: string, isAiInput?: boolean): Y.XmlElement<RichTextBlock> => {
  const yBlock = new Y.XmlElement<RichTextBlock>("block");

  const attrs: RichTextBlock = {
    id,
    index: null,
    title: "",
    type: BlockType.RichText,
    content: new Y.XmlFragment(),
    isAiInput: isAiInput ?? false,
    editWithAIPrompt: new Y.Text(),
    isEditWithAIPromptOpen: false,
  };

  for (const [key, value] of Object.entries(attrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
};

export function getRichTextAttributes(
  block: Y.XmlElement<RichTextBlock>
): RichTextBlock {
  return {
    ...getBaseAttributes(block),
    content: getAttributeOr(block, "content", new Y.XmlFragment()),
  };
}

export function duplicateRichTextBlock(
  newId: string,
  block: Y.XmlElement<RichTextBlock>
): Y.XmlElement<RichTextBlock> {
  const prevAttrs = getRichTextAttributes(block);

  const newAttrs: RichTextBlock = {
    ...duplicateBaseAttributes(newId, prevAttrs),
    content: duplicateYXmlFragment(prevAttrs.content),
  };

  const yBlock = new Y.XmlElement<RichTextBlock>("block");
  for (const [key, value] of Object.entries(newAttrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
}

export function getRichTextBlockExecStatus(
  _block: Y.XmlElement<RichTextBlock>
): ExecutionStatus {
  return "completed";
}

// Turns plain text (optionally with "# "/"## "/"### " heading lines and
// "- "/"* " bullet lines, blank-line-separated paragraphs otherwise) into the
// same node shape @tiptap/extension-collaboration expects in this fragment —
// StarterKit's default schema, where a Y.XmlElement's tag name is the
// ProseMirror node name (paragraph/heading/bulletList/listItem) and text is
// plain Y.XmlText (no marks). No inline formatting (bold/italic/links) is
// attempted — only block structure.
export function appendRichTextContent(
  fragment: Y.XmlFragment,
  text: string
): void {
  const lines = text.split("\n");
  const isHeading = (line: string) => /^(#{1,3})\s+(.*)$/.exec(line);
  const isBullet = (line: string) => /^[-*]\s+(.*)$/.exec(line);

  let i = 0;
  while (i < lines.length) {
    const line = (lines[i] ?? "").trim();
    if (!line) {
      i++;
      continue;
    }

    const heading = isHeading(line);
    if (heading) {
      const el = new Y.XmlElement("heading");
      // ProseMirror's heading node expects a numeric `level` attr — Yjs's
      // setAttribute type is string-only, but the runtime stores whatever
      // value is given (see duplicateYXmlFragment's cloneElement above).
      // @ts-ignore
      el.setAttribute("level", heading[1]!.length);
      el.insert(0, [new Y.XmlText(heading[2] ?? "")]);
      fragment.insert(fragment.length, [el]);
      i++;
      continue;
    }

    if (isBullet(line)) {
      const items: Y.XmlElement[] = [];
      while (i < lines.length) {
        const bulletLine = (lines[i] ?? "").trim();
        const bullet = isBullet(bulletLine);
        if (!bullet) break;

        const item = new Y.XmlElement("listItem");
        const para = new Y.XmlElement("paragraph");
        para.insert(0, [new Y.XmlText(bullet[1] ?? "")]);
        item.insert(0, [para]);
        items.push(item);
        i++;
      }
      const list = new Y.XmlElement("bulletList");
      list.insert(0, items);
      fragment.insert(fragment.length, [list]);
      continue;
    }

    // Plain paragraph — join contiguous non-blank, non-heading, non-bullet
    // lines into one block, the same way a markdown paragraph wraps.
    const paraLines: string[] = [line];
    i++;
    while (i < lines.length) {
      const next = (lines[i] ?? "").trim();
      if (!next || isHeading(next) || isBullet(next)) break;
      paraLines.push(next);
      i++;
    }
    const para = new Y.XmlElement("paragraph");
    para.insert(0, [new Y.XmlText(paraLines.join(" "))]);
    fragment.insert(fragment.length, [para]);
  }
}
