"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { format } from "sql-formatter";
import type { editor } from "monaco-editor";

type ExecutionType = "rpc" | "indexer";

interface QueryCodeEditorProps {
  initialValue?: string;
  tabId: string;
  updateTabQueryAction: (tabId: string, query: string) => void;
  onRunQuery?: (type: ExecutionType) => Promise<void>;
  height?: string;
  readonly?: boolean;
  theme: "sandworm" | "vs-dark" | "vs-light" | "monokai";
}

export const QueryCodeEditor = ({
  initialValue,
  tabId,
  updateTabQueryAction,
  onRunQuery,
  height = "450px",
  readonly = false,
  theme,
}: QueryCodeEditorProps) => {
  const [, setValue] = useState(initialValue);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const executeQuery = async () => {
    if (!editorRef.current) return;

    const query = editorRef.current.getValue().trim();
    if (!query) {
      toast.error("Please enter a query to execute");
      return;
    }

    try {
      if (onRunQuery) {
        await onRunQuery("rpc");
      } else {
        toast.success("Query executed successfully");
      }
    } catch (err) {
      toast.error(
        `Query execution failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  // Format the SQL query
  const formatQuery = () => {
    if (!editorRef.current || readonly) return;

    try {
      const currentValue = editorRef.current.getValue();
      const formatted = format(currentValue, {
        language: "sql",
        keywordCase: "upper",
        indentStyle: "standard",
        linesBetweenQueries: 2,
      });

      editorRef.current.setValue(formatted);
      toast.success("SQL formatted successfully");
    } catch (err) {
      toast.error("Failed to format SQL");
      console.error(err);
    }
  };

  const handleEditorDidMount = (
    codeEditor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = codeEditor;

    monaco.editor.defineTheme("sandworm", {
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
    });

    monaco.editor.defineTheme("monokai", {
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
    });

    monaco.editor.setTheme(theme || "sandworm");

    monaco.languages.registerDocumentFormattingEditProvider("sql", {
      provideDocumentFormattingEdits: model => {
        try {
          const formatted = format(model.getValue(), {
            language: "sql",
            keywordCase: "upper",
            indentStyle: "standard",
            linesBetweenQueries: 2,
          });

          return [
            {
              range: model.getFullModelRange(),
              text: formatted,
            },
          ];
        } catch (err) {
          console.error("SQL formatting failed:", err);
          return [];
        }
      },
    });

    // Add keyboard shortcuts
    codeEditor.addCommand(
      monaco.KeyMod.CtrlCmd || monaco.KeyCode.Enter,
      async () => {
        executeQuery();
      }
    );

    codeEditor.addCommand(monaco.KeyMod.Alt || monaco.KeyCode.KeyF, () => {
      formatQuery();
    });

    codeEditor.addAction({
      id: "format-sql",
      label: "Format SQL",
      keybindings: [monaco.KeyMod.Alt || monaco.KeyCode.KeyF],
      contextMenuGroupId: "modification",
      run: () => {
        formatQuery();
      },
    });
  };

  const handleChange = (newValue: string | undefined) => {
    if (readonly) return;
    if (newValue !== undefined) {
      setValue(newValue);
      updateTabQueryAction(tabId, newValue);
    }
  };

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className=" rounded-md overflow-hidden relative">
      <Editor
        height={height}
        defaultLanguage="sql"
        defaultValue={initialValue}
        theme={theme || "sandworm"}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          readOnly: readonly,
          automaticLayout: true,
          tabSize: 2,
          fontSize: 14,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          renderWhitespace: "selection",
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
        }}
      />
    </div>
  );
};
