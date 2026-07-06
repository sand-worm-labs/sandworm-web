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
  bg: "#272726",
  bgDisabled: "#2E2E2C",
  bgGutter: "#222221",
  border: "#3a3a38",
  text: "#d4d4d4",
  textMuted: "#4e4e4c",
  textActive: "#9cdcfe",
  cursor: "#d4d4d4",
  selection: "#264f78",
  selectionMatch: "#1e3a5f",

  keyword: "#0000FF",
  keywordModifier: "#A308F1",
  variable: "#1f1f1f",
  string: "#A31515",
  number: "#098658",
  comment: "#008000",
  operator: "#000000",
  type: "#267F99",
  builtin: "#795E26",
  decorator: "#795E26",
  escape: "#EE0000",
  regexp: "#811F3F",
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
  { tag: t.modifier, color: DARK.keyword },

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
