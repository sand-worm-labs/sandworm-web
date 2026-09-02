// =====================================
// ⬢ Editor Theme Palettes
// =====================================
// Single source of truth for every code-editor theme: the token colors
// that theme.ts turns into CodeMirror extensions (for SQL/Python) and
// markdown/index.tsx turns into its markdown-flavored highlight style.
// Add a new theme by adding a palette here and its id to THEME_IDS —
// everything else (Preferences UI, CodeEditor, markdown editor) reads
// from this registry.

export interface EditorPalette {
  dark: boolean;
  fontSize: string;

  bg: string;
  bgDisabled: string;
  bgGutter: string;
  border: string;
  text: string;
  textMuted: string;
  textActive: string;
  cursor: string;
  selection: string;
  selectionMatch: string;

  // — code tokens (SQL / Python)
  keyword: string;
  keywordModifier: string;
  variable: string;
  string: string;
  number: string;
  comment: string;
  operator: string;
  type: string;
  builtin: string;
  decorator: string;
  escape: string;
  regexp: string;
  bracket: string;

  // — markdown tokens
  heading: string;
  emphasis: string;
  monospace: string;
  tagName: string;
  angleBracket: string;
  link: string;
  quote: string;
  punctuation: string;
}

const SANDWORM_LIGHT: EditorPalette = {
  dark: false,
  fontSize: "13px",

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
  keywordModifier: "#A308F1",
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
  bracket: "#000000",

  heading: "#7B2FBE",
  emphasis: "#555555",
  monospace: "#2E9E5B",
  tagName: "#C96A10",
  angleBracket: "#555555",
  link: "#0b6e99",
  quote: "#8B8FA8",
  punctuation: "#555555",
};

const SANDWORM_DARK: EditorPalette = {
  dark: true,
  fontSize: "12px",

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

  heading: "#D988F9",
  emphasis: "#B0B0B0",
  monospace: "#8FD693",
  tagName: "#E0995B",
  angleBracket: "#B0B0B0",
  link: "#5AC8E0",
  quote: "#9C9A92",
  punctuation: "#B0B0B0",
};

const DRACULA: EditorPalette = {
  dark: true,
  fontSize: "13px",

  bg: "#282A36",
  bgDisabled: "#31323F",
  bgGutter: "#282A36",
  border: "#44475A",
  text: "#F8F8F2",
  textMuted: "#6272A4",
  textActive: "#BD93F9",
  cursor: "#F8F8F2",
  selection: "#44475A",
  selectionMatch: "#3D4152",

  keyword: "#FF79C6",
  keywordModifier: "#FF79C6",
  variable: "#F8F8F2",
  string: "#F1FA8C",
  number: "#BD93F9",
  comment: "#6272A4",
  operator: "#F8F8F2",
  type: "#8BE9FD",
  builtin: "#50FA7B",
  decorator: "#50FA7B",
  escape: "#FF5555",
  regexp: "#FF5555",
  bracket: "#F8F8F2",

  heading: "#FF79C6",
  emphasis: "#6272A4",
  monospace: "#50FA7B",
  tagName: "#FFB86C",
  angleBracket: "#6272A4",
  link: "#8BE9FD",
  quote: "#6272A4",
  punctuation: "#F8F8F2",
};

const NORD: EditorPalette = {
  dark: true,
  fontSize: "13px",

  bg: "#2E3440",
  bgDisabled: "#333947",
  bgGutter: "#2E3440",
  border: "#3B4252",
  text: "#D8DEE9",
  textMuted: "#4C566A",
  textActive: "#88C0D0",
  cursor: "#D8DEE9",
  selection: "#434C5E",
  selectionMatch: "#3B4252",

  keyword: "#81A1C1",
  keywordModifier: "#81A1C1",
  variable: "#D8DEE9",
  string: "#A3BE8C",
  number: "#B48EAD",
  comment: "#4C566A",
  operator: "#81A1C1",
  type: "#8FBCBB",
  builtin: "#88C0D0",
  decorator: "#D08770",
  escape: "#BF616A",
  regexp: "#EBCB8B",
  bracket: "#D8DEE9",

  heading: "#88C0D0",
  emphasis: "#4C566A",
  monospace: "#A3BE8C",
  tagName: "#D08770",
  angleBracket: "#4C566A",
  link: "#81A1C1",
  quote: "#4C566A",
  punctuation: "#D8DEE9",
};

const GITHUB_LIGHT: EditorPalette = {
  dark: false,
  fontSize: "13px",

  bg: "#FFFFFF",
  bgDisabled: "#F6F8FA",
  bgGutter: "#FFFFFF",
  border: "#D0D7DE",
  text: "#24292E",
  textMuted: "#8C959F",
  textActive: "#57606A",
  cursor: "#24292E",
  selection: "#C8E1FF",
  selectionMatch: "#DDE9FA",

  keyword: "#D73A49",
  keywordModifier: "#D73A49",
  variable: "#24292E",
  string: "#032F62",
  number: "#005CC5",
  comment: "#6A737D",
  operator: "#24292E",
  type: "#22863A",
  builtin: "#6F42C1",
  decorator: "#E36209",
  escape: "#032F62",
  regexp: "#032F62",
  bracket: "#24292E",

  heading: "#6F42C1",
  emphasis: "#6A737D",
  monospace: "#22863A",
  tagName: "#22863A",
  angleBracket: "#6A737D",
  link: "#0366D6",
  quote: "#6A737D",
  punctuation: "#24292E",
};

const SOLARIZED_LIGHT: EditorPalette = {
  dark: false,
  fontSize: "13px",

  bg: "#FDF6E3",
  bgDisabled: "#F5EDD6",
  bgGutter: "#FDF6E3",
  border: "#EEE8D5",
  text: "#657B83",
  textMuted: "#93A1A1",
  textActive: "#586E75",
  cursor: "#657B83",
  selection: "#EEE8D5",
  selectionMatch: "#E4DEC7",

  keyword: "#859900",
  keywordModifier: "#859900",
  variable: "#657B83",
  string: "#2AA198",
  number: "#D33682",
  comment: "#93A1A1",
  operator: "#657B83",
  type: "#B58900",
  builtin: "#268BD2",
  decorator: "#CB4B16",
  escape: "#DC322F",
  regexp: "#DC322F",
  bracket: "#657B83",

  heading: "#CB4B16",
  emphasis: "#93A1A1",
  monospace: "#2AA198",
  tagName: "#B58900",
  angleBracket: "#93A1A1",
  link: "#268BD2",
  quote: "#93A1A1",
  punctuation: "#657B83",
};

// =====================================
// ⬢ Registry
// =====================================

export const THEME_IDS = [
  "sandworm-light",
  "sandworm-dark",
  "dracula",
  "nord",
  "github-light",
  "solarized-light",
] as const;

export type EditorThemeId = (typeof THEME_IDS)[number];

export const THEME_PALETTES: Record<EditorThemeId, EditorPalette> = {
  "sandworm-light": SANDWORM_LIGHT,
  "sandworm-dark": SANDWORM_DARK,
  dracula: DRACULA,
  nord: NORD,
  "github-light": GITHUB_LIGHT,
  "solarized-light": SOLARIZED_LIGHT,
};

export const THEME_META: Record<
  EditorThemeId,
  { label: string; dark: boolean }
> = {
  "sandworm-light": { label: "Sandworm Light", dark: false },
  "sandworm-dark": { label: "Sandworm Dark", dark: true },
  dracula: { label: "Dracula", dark: true },
  nord: { label: "Nord", dark: true },
  "github-light": { label: "GitHub Light", dark: false },
  "solarized-light": { label: "Solarized Light", dark: false },
};

export function isEditorThemeId(value: string): value is EditorThemeId {
  return (THEME_IDS as readonly string[]).includes(value);
}

export const DEFAULT_EDITOR_THEME_ID: EditorThemeId = "sandworm-light";
export const DEFAULT_EDITOR_THEME_ID_DARK: EditorThemeId = "sandworm-dark";
