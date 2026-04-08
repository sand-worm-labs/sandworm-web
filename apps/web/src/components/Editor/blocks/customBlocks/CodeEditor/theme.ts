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
        color: "#000000",
        backgroundColor: disabled ? "#f3f3f3" : "#ffffff",
        fontSize: "12px",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": {
        caretColor: "#000000",
      },
      ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#000000",
      },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: "rgb(230, 235, 240)" },
      ".cm-selectionMatch": { backgroundColor: "rgb(233, 242, 254)" },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-gutters": {
        backgroundColor: disabled ? "#f3f3f3" : "#ffffff",
        color: "#237893",
        border: "none",
        paddingLeft: "8px",
      },
      ".cm-activeLineGutter": {
        color: "#0b216f",
        backgroundColor: disabled ? "#f3f3f3" : "#ffffff",
      },
    },
    { dark: false }
  );
}

const materialLightHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: "#3C00FF" },
  { tag: t.keyword, color: "#0000ff" },
  { tag: t.number, color: "#098658" },
  { tag: t.string, color: "#a31515" },
  { tag: t.bracket, color: "#0000ff" },
]);

export function materialLight(disabled: boolean): Extension {
  return [
    materialLightTheme(disabled),
    syntaxHighlighting(materialLightHighlightStyle),
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
