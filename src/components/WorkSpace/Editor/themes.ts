export const sandwormTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "f8f8f2", background: "141414" },
    { token: "keyword", foreground: "cda869", fontStyle: "bold" },
    { token: "string", foreground: "8f9d6a" },
    { token: "comment", foreground: "5f5a60", fontStyle: "italic" },
    { token: "number", foreground: "cf6a4c" },
    { token: "operator", foreground: "f9ee98" },
    { token: "delimiter", foreground: "f8f8f2" },
    { token: "variable", foreground: "9b859d" },
  ],
  colors: {
    "editor.background": "#101010",
    "editor.foreground": "#F8F8F2",
    "editorCursor.foreground": "#A7A7A7",
    "editor.selectionBackground": "#49483E",
    "editor.lineHighlightBackground": "#202020",
    "editorIndentGuide.activeBackground": "#888888",
    "editorWhitespace.foreground": "#3B3A32",
  },
};

export const monokaiTheme = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "", foreground: "F8F8F2", background: "272822" },
    { token: "keyword", foreground: "F92672" },
    { token: "number", foreground: "AE81FF" },
    { token: "string", foreground: "E6DB74" },
    { token: "comment", foreground: "75715E", fontStyle: "italic" },
    { token: "variable", foreground: "FD971F" },
  ],
  colors: {
    "editor.background": "#272822",
    "editor.foreground": "#F8F8F2",
    "editorCursor.foreground": "#F8F8F0",
    "editor.lineHighlightBackground": "#3E3D32",
    "editor.selectionBackground": "#49483E",
    "editorWhitespace.foreground": "#3B3A32",
  },
};
