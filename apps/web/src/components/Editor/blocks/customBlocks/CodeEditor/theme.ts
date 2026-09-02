import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

import type { EditorPalette, EditorThemeId } from "./palettes";
import { THEME_PALETTES } from "./palettes";

export {
  THEME_IDS,
  THEME_META,
  THEME_PALETTES,
  DEFAULT_EDITOR_THEME_ID,
  isEditorThemeId,
} from "./palettes";
export type { EditorThemeId, EditorPalette } from "./palettes";

// =====================================
// ⬢ Editor Chrome (CodeMirror `&`/gutters/selection)
// =====================================

function buildEditorChrome(palette: EditorPalette, disabled: boolean) {
  const c = palette;
  return EditorView.theme(
    {
      "&": {
        color: c.text,
        backgroundColor: disabled ? c.bgDisabled : c.bg,
        fontSize: c.fontSize,
        fontFamily: "'Moderat Mono', monospace",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": {
        caretColor: c.cursor,
        paddingLeft: "8px",
        paddingTop: "20px",
        paddingBottom: "20px",
      },
      ".cm-scroller": {
        fontFamily: "'Moderat Mono', monospace !important",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: c.cursor,
      },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: c.selection },
      ".cm-selectionMatch": { backgroundColor: c.selectionMatch },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-gutters": {
        backgroundColor: disabled ? c.bgDisabled : c.bgGutter,
        color: c.textMuted,
        border: "none",
        borderRight: `1px solid ${c.border}`,
        paddingLeft: "8px",
        paddingTop: "20px",
        paddingBottom: "20px",
      },
      ".cm-activeLineGutter": {
        color: c.textActive,
        backgroundColor: disabled ? c.bgDisabled : c.bgGutter,
      },
    },
    { dark: palette.dark }
  );
}

// =====================================
// ⬢ Code Highlight Style (SQL / Python)
// =====================================

function buildCodeHighlightStyle(palette: EditorPalette) {
  const c = palette;
  return HighlightStyle.define([
    { tag: t.keyword, color: c.keyword },
    { tag: t.moduleKeyword, color: c.keyword },
    { tag: t.definitionKeyword, color: c.keyword },
    { tag: t.controlKeyword, color: c.keyword },
    { tag: t.bool, color: c.keyword },
    { tag: t.null, color: c.keyword },

    { tag: t.modifier, color: c.keywordModifier },

    { tag: t.variableName, color: c.variable },
    { tag: t.name, color: c.variable },
    { tag: t.namespace, color: c.variable },
    { tag: t.propertyName, color: c.variable },
    { tag: t.function(t.variableName), color: c.variable },
    { tag: t.definition(t.variableName), color: c.variable },
    { tag: t.className, color: c.variable },

    { tag: t.standard(t.variableName), color: c.builtin },
    { tag: t.function(t.name), color: c.builtin },

    { tag: t.string, color: c.string },
    { tag: t.special(t.string), color: c.string },
    { tag: t.escape, color: c.escape },
    { tag: t.regexp, color: c.regexp },

    { tag: t.number, color: c.number },
    { tag: t.integer, color: c.number },
    { tag: t.float, color: c.number },

    { tag: t.typeName, color: c.type },
    { tag: t.typeOperator, color: c.type },

    { tag: t.annotation, color: c.decorator },

    { tag: t.comment, color: c.comment, fontStyle: "italic" },
    { tag: t.blockComment, color: c.comment, fontStyle: "italic" },
    { tag: t.docComment, color: c.comment, fontStyle: "italic" },

    { tag: t.operator, color: c.operator },
    { tag: t.punctuation, color: c.operator },
    { tag: t.bracket, color: c.bracket },
    { tag: t.separator, color: c.operator },
  ]);
}

// =====================================
// ⬢ Export — SQL / Python editor theme
// =====================================

export function getEditorTheme(
  themeId: EditorThemeId,
  disabled: boolean
): Extension {
  const palette = THEME_PALETTES[themeId];
  return [
    buildEditorChrome(palette, disabled),
    syntaxHighlighting(buildCodeHighlightStyle(palette)),
  ];
}

// =====================================
// ⬢ Markdown Theme
// =====================================
// Markdown's CodeMirror instance renders over a transparent surface (it
// sits inside the document flow, not a boxed code block) and highlights a
// different tag set (headings, links, quotes) — so it gets its own chrome
// + highlight-style builders, sharing the same palette as the code themes.

function buildMarkdownChrome(palette: EditorPalette) {
  const c = palette;
  return EditorView.theme(
    {
      "&": {
        color: c.text,
        backgroundColor: "transparent",
        fontSize: "13px",
        fontFamily: "'Moderat Mono', monospace",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": {
        caretColor: c.text,
        paddingLeft: "8px",
        fontFamily: "'Moderat Mono', monospace",
      },
      ".cm-scroller": {
        fontFamily: "'Moderat Mono', monospace !important",
      },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: c.text },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: c.selection },
      ".cm-selectionMatch": { backgroundColor: c.selectionMatch },
      ".cm-activeLine": { backgroundColor: "transparent" },
    },
    { dark: palette.dark }
  );
}

function buildMarkdownHighlightStyle(palette: EditorPalette) {
  const c = palette;
  return HighlightStyle.define([
    { tag: t.heading1, color: c.heading, fontWeight: "500" },
    { tag: t.heading2, color: c.heading, fontWeight: "500" },
    { tag: t.heading3, color: c.heading, fontWeight: "500" },
    { tag: t.heading, color: c.heading, fontWeight: "500" },
    { tag: t.strong, fontWeight: "600" },
    { tag: t.emphasis, fontStyle: "italic", color: c.emphasis },
    {
      tag: t.monospace,
      color: c.monospace,
      fontFamily: "'Moderat Mono', monospace",
    },
    { tag: t.special(t.string), color: c.monospace },
    { tag: t.tagName, color: c.tagName },
    { tag: t.angleBracket, color: c.angleBracket },
    { tag: t.attributeName, color: c.heading },
    { tag: t.attributeValue, color: c.monospace },
    { tag: t.url, color: c.link },
    { tag: t.link, color: c.link },
    { tag: t.quote, color: c.quote, fontStyle: "italic" },
    { tag: t.processingInstruction, color: c.heading },
    { tag: t.punctuation, color: c.punctuation },
    { tag: t.comment, color: c.comment, fontStyle: "italic" },
  ]);
}

export function getMarkdownTheme(themeId: EditorThemeId): Extension {
  const palette = THEME_PALETTES[themeId];
  return [
    buildMarkdownChrome(palette),
    syntaxHighlighting(buildMarkdownHighlightStyle(palette), {
      fallback: true,
    }),
  ];
}

// =====================================
// ⬢ Unified Diff Theme
// =====================================
// Styles for the AI-suggestion diff view (@codemirror/merge's
// unifiedMergeView). Deleted lines get a struck-through red treatment,
// changed/inserted lines get the brand purple used by the AI accept/reject
// controls, and untouched lines are left exactly as the base theme renders
// them. Diff colors are shared across all themes of the same mode (light
// vs dark) rather than defined per-palette.

const DIFF_LIGHT = {
  deletedBg: "#FFE3E3",
  deletedText: "#C4362D",
  changedBg: "#EBE3FF",
};

const DIFF_DARK = {
  deletedBg: "#3A2323",
  deletedText: "#E5827A",
  changedBg: "#2A2440",
};

export function diffTheme(dark: boolean): Extension {
  const c = dark ? DIFF_DARK : DIFF_LIGHT;
  return EditorView.theme({
    ".cm-deletedChunk": {
      backgroundColor: c.deletedBg,
    },
    ".cm-deletedLine, .cm-deletedLine del": {
      textDecoration: "none",
    },
    ".cm-deletedLine del": {
      color: c.deletedText,
      textDecoration: "line-through",
    },

    "&.cm-merge-b .cm-changedLine, .cm-inlineChangedLine": {
      backgroundColor: c.changedBg,
    },
    "&.cm-merge-b .cm-changedText": {
      background: "none",
    },

    ".cm-gutterElement.cm-diff-deleted-gutter": {
      backgroundColor: c.deletedBg,
    },
    ".cm-gutterElement.cm-diff-changed-gutter": {
      backgroundColor: c.changedBg,
    },
    // The base editor theme puts left inset on the gutters *container*,
    // which leaves a gap before our per-line tint starts. Move that inset
    // onto each gutter element instead so the tint runs flush to the
    // block's border. !important because this is two same-priority
    // EditorView.theme() extensions colliding on the same property, and the
    // base editor theme (configured first) otherwise wins the tie.
    ".cm-gutters": {
      paddingLeft: "0px !important",
    },
    ".cm-lineNumbers .cm-gutterElement": {
      paddingLeft: "8px !important",
    },
  });
}
