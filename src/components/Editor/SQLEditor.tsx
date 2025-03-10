"use client";

import React, { useState, useRef } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import { toast } from "sonner";
import { format } from "sql-formatter";
import { editor } from "monaco-editor";

interface SQLEditorProps {
  initialValue?: string;
  tabId: string;
  executeQueryFn: (query: string, tabId: string) => Promise<void>;
  theme?: "light" | "dark";
  height?: string;
}

export default function SQLEditor({
  initialValue = "SELECT * FROM users;",
  tabId,
  executeQueryFn,
  theme = "light",
  height = "400px",
}: SQLEditorProps) {
  const [value, setValue] = useState(initialValue);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Set up editor on mount
  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor;

    // Register SQL format provider
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
    editor.addCommand(
      monaco.KeyMod.CtrlCmd || monaco.KeyCode.Enter,
      async () => {
        executeQuery();
      }
    );

    editor.addCommand(monaco.KeyMod.Alt || monaco.KeyCode.KeyF, () => {
      formatQuery();
    });

    // Add context menu action
    editor.addAction({
      id: "execute-selection",
      label: "Execute Selected Query",
      keybindings: [
        monaco.KeyMod.CtrlCmd || monaco.KeyMod.Shift || monaco.KeyCode.Enter,
      ],
      contextMenuGroupId: "navigation",
      run: ed => {
        const selection = ed.getSelection();
        if (selection && !selection.isEmpty()) {
          const selectedText = ed.getModel()?.getValueInRange(selection);
          if (selectedText?.trim()) {
            executeSelectedQuery(selectedText);
          }
        }
      },
    });

    editor.addAction({
      id: "format-sql",
      label: "Format SQL",
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      contextMenuGroupId: "modification",
      run: () => {
        formatQuery();
      },
    });
  };

  // Execute the full query
  const executeQuery = async () => {
    if (!editorRef.current) return;

    const query = editorRef.current.getValue().trim();
    if (!query) {
      toast.error("Please enter a query to execute");
      return;
    }

    try {
      await executeQueryFn(query, tabId);
      toast.success("Query executed successfully");
    } catch (err) {
      toast.error(
        `Query execution failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  // Execute only the selected text
  const executeSelectedQuery = async (selectedText: string) => {
    if (!selectedText.trim()) return;

    try {
      await executeQueryFn(selectedText.trim(), tabId);
      toast.success("Selected query executed successfully");
    } catch (err) {
      toast.error(
        `Query execution failed: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  };

  // Format the SQL query
  const formatQuery = () => {
    if (!editorRef.current) return;

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

  // Handle value changes
  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      setValue(value);
    }
  };

  return (
    <div className=" rounded-md overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="sql"
        defaultValue={initialValue}
        theme="vs-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
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

      <div className="flex gap-2 p-2 border-t ">
        <button
          onClick={executeQuery}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Execute (Ctrl+Enter)
        </button>
        <button
          onClick={formatQuery}
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
        >
          Format (Alt+F)
        </button>
      </div>
    </div>
  );
}
