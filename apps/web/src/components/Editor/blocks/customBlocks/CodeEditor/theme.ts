import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// =====================================
// ⬢ Token Palette
// =====================================

const LIGHT = {
  bg: "#FFFFFF",
  bgDisabled: "#EBF7F7",
  bgGutter: "#ffffff",
  border: "#e4e4e7",
  text: "#1f1f1f",
  textMuted: "#aaaaaa",
  textActive: "#888888",
  cursor: "#1f1f1f",
  selection: "#add6ff",
  selectionMatch: "#c9e2ff",

  keyword: "#A308F1",
  variable: "#001080",
  string: "#785E26",
  number: "#098658",
  comment: "#297F99",
  operator: "#000000",
  type: "#267F99",
  builtin: "#785E26",
  decorator: "#785E26",
  escape: "#EE0000",
  regexp: "#811F3F",
};

const DARK = {
  bg: "#1A1A1A",
  bgDisabled: "#232323",
  bgGutter: "#1A1A1A",
  border: "#303030",
  text: "#d4d4d4",
  textMuted: "#5a5a58",
  textActive: "#8fc5d6",
  cursor: "#d4d4d4",
  selection: "#33344a",
  selectionMatch: "#24263a",

  keyword: "#E100FF",
  keywordModifier: "#B65FD1",
  variable: "#6EA6B7",
  string: "#C4AD7A",
  number: "#8FD693",
  comment: "#6A9955",
  operator: "#C9C9C9",
  type: "#4EC9B0",
  builtin: "#D988F9",
  decorator: "#D988F9",
  escape: "#D16969",
  regexp: "#DB6C79",
  bracket: "#C9C9C9",
};

// =====================================
// ⬢ Light Theme
// =====================================

function materialLightTheme(disabled: boolean) {
  const c = LIGHT;
  return EditorView.theme(
    {
      "&": {
        color: c.text,
        backgroundColor: disabled ? c.bgDisabled : c.bg,
        fontSize: "13px",
        fontFamily: "'Moderat Mono', monospace",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": {
        caretColor: c.cursor,
        paddingLeft: "8px",
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
      },
      ".cm-activeLineGutter": {
        color: c.textActive,
        backgroundColor: disabled ? c.bgDisabled : c.bgGutter,
      },
    },
    { dark: false }
  );
}

const lightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: LIGHT.keyword },
  { tag: t.moduleKeyword, color: LIGHT.keyword },
  { tag: t.definitionKeyword, color: LIGHT.keyword },
  { tag: t.controlKeyword, color: LIGHT.keyword },
  { tag: t.bool, color: LIGHT.keyword },
  { tag: t.null, color: LIGHT.keyword },

  { tag: t.modifier, color: LIGHT.keywordModifier },

  { tag: t.variableName, color: LIGHT.variable },
  { tag: t.name, color: LIGHT.variable },
  { tag: t.namespace, color: LIGHT.variable },
  { tag: t.propertyName, color: LIGHT.variable },
  { tag: t.function(t.variableName), color: LIGHT.variable },
  { tag: t.definition(t.variableName), color: LIGHT.variable },
  { tag: t.className, color: LIGHT.variable },

  { tag: t.standard(t.variableName), color: LIGHT.builtin },
  { tag: t.function(t.name), color: LIGHT.builtin },

  { tag: t.string, color: LIGHT.string },
  { tag: t.special(t.string), color: LIGHT.string },
  { tag: t.escape, color: LIGHT.escape },
  { tag: t.regexp, color: LIGHT.regexp },

  { tag: t.number, color: LIGHT.number },
  { tag: t.integer, color: LIGHT.number },
  { tag: t.float, color: LIGHT.number },

  { tag: t.typeName, color: LIGHT.type },
  { tag: t.typeOperator, color: LIGHT.type },

  { tag: t.annotation, color: LIGHT.decorator },

  { tag: t.comment, color: LIGHT.comment, fontStyle: "italic" },
  { tag: t.blockComment, color: LIGHT.comment, fontStyle: "italic" },
  { tag: t.docComment, color: LIGHT.comment, fontStyle: "italic" },

  { tag: t.operator, color: LIGHT.operator },
  { tag: t.punctuation, color: LIGHT.operator },
  { tag: t.bracket, color: LIGHT.operator },
  { tag: t.separator, color: LIGHT.operator },
]);

export function materialLight(disabled: boolean): Extension {
  return [
    materialLightTheme(disabled),
    syntaxHighlighting(lightHighlightStyle),
  ];
}

// =====================================
// ⬢ Dark Theme
// =====================================

function materialDarkTheme(disabled: boolean) {
  const c = DARK;
  return EditorView.theme(
    {
      "&": {
        color: c.text,
        backgroundColor: disabled ? c.bgDisabled : c.bg,
        fontSize: "12px",
        fontFamily: "'Moderat Mono', monospace",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": {
        caretColor: c.cursor,
        paddingLeft: "8px",
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
      },
      ".cm-activeLineGutter": {
        color: c.textActive,
        backgroundColor: disabled ? c.bgDisabled : c.bgGutter,
      },
    },
    { dark: true }
  );
}

const darkHighlightStyle = HighlightStyle.define([
  // — keywords
  { tag: t.keyword, color: DARK.keyword },
  { tag: t.moduleKeyword, color: DARK.keyword },
  { tag: t.definitionKeyword, color: DARK.keyword },
  { tag: t.controlKeyword, color: DARK.keyword },
  { tag: t.bool, color: DARK.keyword },
  { tag: t.null, color: DARK.keyword },

  // — names / variables
  { tag: t.variableName, color: DARK.variable },
  { tag: t.name, color: DARK.variable },
  { tag: t.namespace, color: DARK.variable },
  { tag: t.propertyName, color: DARK.variable },
  { tag: t.function(t.variableName), color: DARK.variable },
  { tag: t.definition(t.variableName), color: DARK.variable },
  { tag: t.className, color: DARK.variable },

  // — builtins
  { tag: t.standard(t.variableName), color: DARK.builtin },
  { tag: t.function(t.name), color: DARK.builtin },

  // — strings
  { tag: t.string, color: DARK.string },
  { tag: t.special(t.string), color: DARK.string },
  { tag: t.escape, color: DARK.escape },
  { tag: t.regexp, color: DARK.regexp },

  // — numbers
  { tag: t.number, color: DARK.number },
  { tag: t.integer, color: DARK.number },
  { tag: t.float, color: DARK.number },

  // — types
  { tag: t.typeName, color: DARK.type },
  { tag: t.typeOperator, color: DARK.type },

  // — decorators / annotations
  { tag: t.annotation, color: DARK.decorator },
  { tag: t.modifier, color: DARK.keywordModifier },

  // — comments
  { tag: t.comment, color: DARK.comment, fontStyle: "italic" },
  { tag: t.blockComment, color: DARK.comment, fontStyle: "italic" },
  { tag: t.docComment, color: DARK.comment, fontStyle: "italic" },

  // — punctuation / operators
  { tag: t.operator, color: DARK.operator },
  { tag: t.punctuation, color: DARK.operator },
  { tag: t.bracket, color: DARK.bracket },
  { tag: t.separator, color: DARK.operator },
]);

export function materialDark(disabled: boolean): Extension {
  return [materialDarkTheme(disabled), syntaxHighlighting(darkHighlightStyle)];
}

// =====================================
// ⬢ Export
// =====================================

export function editorTheme(disabled: boolean, dark: boolean): Extension {
  return dark ? materialDark(disabled) : materialLight(disabled);
}

// =====================================
// ⬢ Unified Diff Theme
// =====================================
// Styles for the AI-suggestion diff view (@codemirror/merge's
// unifiedMergeView). Deleted lines get a struck-through red treatment,
// changed/inserted lines get the brand purple used by the AI accept/reject
// controls, and untouched lines are left exactly as the base theme renders
// them.

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
