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
import { ExecutionStatus } from "../execution/item.js";
import { updateYText } from "../index.js";

export type MarkdownEditIntent = 'fix' | 'shorten' | 'expand' | 'rewrite' | 'custom'

export type MarkdownBlock = BaseBlock<BlockType.Markdown> & {
  source: Y.Text;
  editWithAIPrompt: Y.Text;
  isEditWithAIPromptOpen: boolean;
  aiSuggestions: Y.Text | null;
  intent: MarkdownEditIntent;
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
    editWithAIPrompt: new Y.Text(""),
    isEditWithAIPromptOpen: false,
    aiSuggestions: null,
    intent: 'fix',
  };

  for (const [key, value] of Object.entries(attrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
};

// =====================================
// ⬢ Attributes
// =====================================

export function getMarkdownAttributes(
  block: Y.XmlElement<MarkdownBlock>
): MarkdownBlock {
  return {
    ...getBaseAttributes(block),
    source: getAttributeOr(block, "source", new Y.Text("")),
    editWithAIPrompt: getMarkdownBlockEditWithAIPrompt(block),
    isEditWithAIPromptOpen: isMarkdownBlockEditWithAIPromptOpen(block),
    aiSuggestions: getMarkdownAISuggestions(block),
    intent: getAttributeOr(block, "intent", 'fix'),
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

  const newAttrs: MarkdownBlock = {
    ...duplicateBaseAttributes(newId, prevAttrs),
    source: new Y.Text(prevAttrs.source.toString()),
    editWithAIPrompt: new Y.Text(prevAttrs.editWithAIPrompt.toString()),
    isEditWithAIPromptOpen: false,
    aiSuggestions:
      prevAttrs.aiSuggestions
        ? duplicateYText(prevAttrs.aiSuggestions)
        : null,
    intent: prevAttrs.intent,
  };

  const yBlock = new Y.XmlElement<MarkdownBlock>("block");
  for (const [key, value] of Object.entries(newAttrs)) {
    // @ts-ignore
    yBlock.setAttribute(key, value);
  }

  return yBlock;
}

// =====================================
// ⬢ Execution status
// =====================================

export function getMarkdownBlockExecStatus(
  _block: Y.XmlElement<MarkdownBlock>
): ExecutionStatus {
  return "completed";
}

// =====================================
// ⬢ Source
// =====================================

export function getMarkdownSource(
  block: Y.XmlElement<MarkdownBlock>
): Y.Text {
  return getAttributeOr(block, "source", new Y.Text(""));
}

// =====================================
// ⬢ AI Suggestions
// =====================================

export function getMarkdownAISuggestions(
  block: Y.XmlElement<MarkdownBlock>
): Y.Text | null {
  return getAttributeOr(block, "aiSuggestions", null);
}

export function updateMarkdownAISuggestions(
  block: Y.XmlElement<MarkdownBlock>,
  suggestions: string
) {
  const aiSuggestions = getMarkdownAISuggestions(block);
  if (!aiSuggestions) {
    block.setAttribute("aiSuggestions", new Y.Text(suggestions));
    return;
  }

  updateYText(aiSuggestions, suggestions);
}

// =====================================
// ⬢ Edit with AI prompt
// =====================================

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