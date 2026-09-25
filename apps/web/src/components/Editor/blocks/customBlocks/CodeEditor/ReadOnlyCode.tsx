"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { python } from "@codemirror/lang-python";

import { getEditorTheme } from "./theme";
import { useEditorThemeId } from "./useEditorThemeId";

interface ReadOnlyCodeProps {
  source: string;
  className?: string;
}

// Static counterpart to the notebook's CodeEditor. Same palette and syntax
// highlighting, but no Yjs binding, awareness or kernel completions.
export function ReadOnlyCode({ source, className }: ReadOnlyCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeId = useEditorThemeId();

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return undefined;

    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: source,
        extensions: [
          lineNumbers(),
          python(),
          getEditorTheme(themeId, false),
          EditorView.theme({
            "&": { maxHeight: "50vh" },
            ".cm-scroller": { overflow: "auto" },
          }),
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
        ],
      }),
    });

    return () => view.destroy();
  }, [source, themeId]);

  return <div ref={containerRef} className={className} />;
}
