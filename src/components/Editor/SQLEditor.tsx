"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Monaco } from "@monaco-editor/react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";
import { format } from "sql-formatter";
import type { editor } from "monaco-editor";

interface SQLEditorProps {
  initialValue?: string;
  tabId: string;
  executeQueryFn: (query: string, tabId: string) => Promise<void>;
  updateTabQuery: (tabId: string, query: string) => void;
  onRunQuery?: () => Promise<void>; // Add this prop
  height?: string;
}

export default function SQLEditor({
  initialValue,
  tabId,
  executeQueryFn,
  updateTabQuery,
  onRunQuery,
  height = "450px",
}: SQLEditorProps) {
  const [value, setValue] = useState(initialValue);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

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

  // Execute the full query
  const executeQuery = async () => {
    if (!editorRef.current) return;

    const query = editorRef.current.getValue().trim();
    if (!query) {
      toast.error("Please enter a query to execute");
      return;
    }

    try {
      if (onRunQuery) {
        // If parent wants to handle the execution
        await onRunQuery();
      } else {
        // Otherwise use the default behavior
        await executeQueryFn(query, tabId);
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

  // Set up editor on mount
  const handleEditorDidMount = (
    codeEditor: editor.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = codeEditor;

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
    codeEditor.addCommand(
      monaco.KeyMod.CtrlCmd || monaco.KeyCode.Enter,
      async () => {
        executeQuery();
      }
    );

    codeEditor.addCommand(monaco.KeyMod.Alt || monaco.KeyCode.KeyF, () => {
      formatQuery();
    });

    // Add context menu action
    codeEditor.addAction({
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
    if (newValue !== undefined) {
      console.log("yo");
      setValue(newValue);
      updateTabQuery(tabId, newValue);
    }
  };

  useEffect(() => {
    return () => {
      console.log(value);
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
    </div>
  );
}
