import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// =====================================
// ⬢ Light Theme
// =====================================
function materialLightTheme(disabled: boolean) {
  return EditorView.theme(
    {
      "&": {
        color: "#1a1a1a",
        backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
        fontSize: "13px",
        fontFamily: "'Geist Mono', monospace",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": {
        caretColor: "#1a1a1a",
        paddingLeft: "8px",
      },
      ".cm-scroller": {
        fontFamily: "'Geist Mono', monospace !important",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#1a1a1a",
      },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: "#dce4f5" },
      ".cm-selectionMatch": { backgroundColor: "#e8edf8" },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-gutters": {
        backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
        color: "#aaaaaa",
        border: "none",
        borderRight: "1px solid #e4e4e7",
        paddingLeft: "8px",
      },
      ".cm-activeLineGutter": {
        color: "#888888",
        backgroundColor: disabled ? "#f5f5f5" : "#f9f9f9",
      },
    },
    { dark: false }
  );
}

const cursorLightHighlightStyle = HighlightStyle.define([
  { tag: t.keyword, color: "#7B2FBE" },
  { tag: t.moduleKeyword, color: "#7B2FBE" },
  { tag: t.definitionKeyword, color: "#7B2FBE" },
  { tag: t.controlKeyword, color: "#7B2FBE" },

  { tag: t.variableName, color: "#C96A10" },
  { tag: t.name, color: "#C96A10" },
  { tag: t.namespace, color: "#C96A10" },
  { tag: t.propertyName, color: "#C96A10" },

  { tag: t.function(t.variableName), color: "#C96A10" },
  { tag: t.definition(t.variableName), color: "#C96A10" },

  { tag: t.string, color: "#2E9E5B" },
  { tag: t.special(t.string), color: "#2E9E5B" },

  { tag: t.number, color: "#C96A10" },
  { tag: t.bool, color: "#7B2FBE" },
  { tag: t.null, color: "#7B2FBE" },

  { tag: t.comment, color: "#8B8FA8", fontStyle: "italic" },

  { tag: t.operator, color: "#555555" },
  { tag: t.punctuation, color: "#555555" },
  { tag: t.bracket, color: "#555555" },

  { tag: t.typeName, color: "#7B2FBE" },
  { tag: t.className, color: "#C96A10" },
]);

export function materialLight(disabled: boolean): Extension {
  return [
    materialLightTheme(disabled),
    syntaxHighlighting(cursorLightHighlightStyle),
  ];
}

// =====================================
// ⬢ Dark Theme
// =====================================
function materialDarkTheme(disabled: boolean) {
  return EditorView.theme(
    {
      "&": {
        color: "#d4d4d4",
        backgroundColor: disabled ? "#2E2E2C" : "#272726",
        fontSize: "12px",
        fontFamily: "'Geist Mono', monospace",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": {
        caretColor: "#d4d4d4",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#d4d4d4",
      },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: "#264f78" },
      ".cm-selectionMatch": { backgroundColor: "#1e3a5f" },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-gutters": {
        backgroundColor: disabled ? "#2E2E2C" : "#272726",
        color: "#6a9fb5",
        border: "none",
        paddingLeft: "8px",
      },
      ".cm-activeLineGutter": {
        color: "#9cdcfe",
        backgroundColor: disabled ? "#2E2E2C" : "#272726",
      },
    },
    { dark: true }
  );
}

const materialDarkHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "#6A9955" },
  { tag: t.keyword, color: "#569cd6" },
  { tag: t.number, color: "#b5cea8" },
  { tag: t.string, color: "#ce9178" },
  { tag: t.bracket, color: "#ffd700" },
]);

export function materialDark(disabled: boolean): Extension {
  return [
    materialDarkTheme(disabled),
    syntaxHighlighting(materialDarkHighlightStyle),
  ];
}

export function editorTheme(disabled: boolean, dark: boolean): Extension {
  return dark ? materialDark(disabled) : materialLight(disabled);
}
