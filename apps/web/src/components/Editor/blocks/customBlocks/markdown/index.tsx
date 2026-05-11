import type * as Y from "yjs";
import { useEffect, useRef, useState, useCallback } from "react";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown as markdownLang } from "@codemirror/lang-markdown";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { yCollab } from "y-codemirror.next";
import { marked } from "marked";
import clsx from "clsx";
import type { ConnectDragPreview } from "react-dnd";
import type { MarkdownBlock } from "@sandworm/editor";

import useEditorAwareness from "../../../hooks/useEditorAwareness";
import type { DashboardMode } from "../../Dashboard";

// =====================================
// ⬢ Marked Config
//   Set once at module level — not per-render.
//   gfm: GitHub Flavored Markdown (tables, task lists, strikethrough)
//   breaks: false — double newline for paragraph, single for <br>
// =====================================
marked.setOptions({ gfm: true, breaks: false });

// =====================================
// ⬢ Types
// =====================================
type Mode = "edit" | "preview";

interface Props {
  block: Y.XmlElement<MarkdownBlock>;
  belongsToMultiTabGroup: boolean;
  isEditable: boolean;
  dragPreview: ConnectDragPreview | null;
  dashboardMode: DashboardMode | null;
  isCursorWithin: boolean;
  isCursorInserting: boolean;
}

// =====================================
// ⬢ CodeMirror Theme
//   Minimal — inherits font from parent.
//   Matches the sandworm dark/light surface tokens.
// =====================================
const sandwormTheme = EditorView.theme({
  "&": {
    fontSize: "0.875rem",
    fontFamily: "inherit",
    backgroundColor: "transparent",
    height: "100%",
  },
  ".cm-content": {
    padding: "0.5rem 0",
    caretColor: "var(--color-primary)",
  },
  ".cm-line": { padding: "0 0.25rem" },
  ".cm-focused": { outline: "none" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--color-ink-200)",
    fontSize: "0.75rem",
  },
  ".cm-activeLineGutter": { backgroundColor: "transparent" },
  ".cm-activeLine": { backgroundColor: "rgba(99,60,180,0.06)" },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(99,60,180,0.15) !important",
  },
});

// =====================================
// ⬢ useCodeMirror
//   Mounts a CodeMirror 6 instance bound to a Y.Text via yCollab.
//   Destroyed and recreated if source identity changes (new block).
// =====================================
function useCodeMirror({
  containerRef,
  source,
  isEditable,
  onFocus,
  onBlur,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  source: Y.Text;
  isEditable: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: source.toString(),
      extensions: [
        // ── Yjs binding ──────────────────────────────────────────────────
        // yCollab keeps CodeMirror and Y.Text in sync bidirectionally.
        // undoManager: false — let Yjs handle undo natively via y-undo.
        yCollab(source, null, { undoManager: false }),

        // ── Language ─────────────────────────────────────────────────────
        markdownLang(),

        // ── Keymaps ──────────────────────────────────────────────────────
        keymap.of([...defaultKeymap, ...historyKeymap]),

        // ── Read-only ────────────────────────────────────────────────────
        EditorState.readOnly.of(!isEditable),

        // ── Visual ───────────────────────────────────────────────────────
        lineNumbers(),
        sandwormTheme,
        EditorView.lineWrapping,

        // ── Focus/blur events → editor awareness ─────────────────────────
        EditorView.domEventHandlers({
          focus: () => {
            onFocus();
            return false;
          },
          blur: () => {
            onBlur();
            return false;
          },
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // source identity change = new block = remount
  }, [source, isEditable]); // eslint-disable-line react-hooks/exhaustive-deps

  return viewRef;
}

// =====================================
// ⬢ Preview
//   Renders marked HTML. dangerouslySetInnerHTML is unavoidable for
//   markdown preview — sanitize if you ever accept untrusted input.
// =====================================
const MarkdownPreview = ({ source }: { source: Y.Text }) => {
  const [html, setHtml] = useState(
    () => marked.parse(source.toString()) as string
  );

  useEffect(() => {
    const update = () => {
      setHtml(marked.parse(source.toString()) as string);
    };

    source.observe(update);
    return () => source.unobserve(update);
  }, [source]);

  if (!html.trim()) {
    return (
      <p className="text-ink-200 italic text-sm py-2 px-1">
        Nothing to preview yet.
      </p>
    );
  }

  return (
    <div
      className="prose prose-sm sm:prose-base max-w-full font-body sandworm-prose"
      // marked returns sanitized HTML for trusted input (your own users)
      // Add DOMPurify here if this ever renders untrusted third-party content
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// =====================================
// ⬢ ModeToggle
// =====================================
const ModeToggle = ({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) => (
  <div className="flex items-center gap-x-1 text-xs text-ink-300 select-none">
    {(["edit", "preview"] as Mode[]).map(m => (
      <button
        key={m}
        type="button"
        onClick={() => onChange(m)}
        className={clsx(
          "px-2 py-0.5 rounded-md capitalize transition-colors",
          mode === m
            ? "bg-primary/15 text-primary font-medium"
            : "hover:bg-primary/10 text-ink-300"
        )}
      >
        {m}
      </button>
    ))}
  </div>
);

// =====================================
// ⬢ MarkdownBlock
// =====================================
const MarkdownBlock = (props: Props) => {
  const id = props.block.getAttribute("id")!;
  const source = props.block.getAttribute("source")!;

  const [mode, setMode] = useState<Mode>("edit");
  const [isFocused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [, editorAPI] = useEditorAwareness();

  // ── Editor awareness callbacks ────────────────────────────────────────────
  const onFocus = useCallback(() => {
    setFocused(true);
    editorAPI.insert(id, { scrollIntoView: false });
  }, [id, editorAPI]);

  const onBlur = useCallback(() => {
    setFocused(false);
    editorAPI.blur();
  }, [editorAPI]);

  // ── CodeMirror instance ───────────────────────────────────────────────────
  useCodeMirror({
    containerRef,
    source,
    isEditable: props.isEditable,
    onFocus,
    onBlur,
  });

  // ── Cursor insert focus ───────────────────────────────────────────────────
  useEffect(() => {
    if (
      props.isCursorInserting &&
      props.isCursorWithin &&
      containerRef.current
    ) {
      const cmContent =
        containerRef.current.querySelector<HTMLElement>(".cm-content");
      cmContent?.focus();
    }
  }, [props.isCursorInserting, props.isCursorWithin]);

  // ── Border state ──────────────────────────────────────────────────────────
  const ringColor = (() => {
    if (isFocused && !props.belongsToMultiTabGroup && props.isEditable)
      return "border border-border-focus dark:border-border-tertiary";
    if (
      !isFocused &&
      !props.belongsToMultiTabGroup &&
      props.isEditable &&
      props.isCursorWithin &&
      !props.isCursorInserting
    )
      return "border border-border-tertiary";
    if (
      props.dashboardMode?._tag === "editing" &&
      props.dashboardMode.position === "expanded"
    )
      return "border border-border-focus";
    return "";
  })();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      data-testid={`MarkdownBlock-${id}`}
      ref={d => {
        props.dragPreview?.(d);
      }}
      data-block-id={id}
      className="flex flex-col"
    >
      <div
        className={clsx(
          "ring-border-focus ring-offset-4",
          props.dashboardMode ? "h-full overflow-y-auto" : "",
          ringColor,
          {
            "rounded-tl-none rounded-lg border border-border-tertiary":
              props.belongsToMultiTabGroup,
            "rounded-tl-none rounded-lg border border-border-secondary":
              props.belongsToMultiTabGroup &&
              props.isCursorWithin &&
              !props.isCursorInserting,
            "rounded-lg": !props.belongsToMultiTabGroup,
          }
        )}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-secondary dark:border-border-tertiary">
          <span className="text-xs text-ink-300 font-medium">Markdown</span>
          {props.isEditable && <ModeToggle mode={mode} onChange={setMode} />}
        </div>

        {/* Body */}
        <div
          className={clsx(
            props.dashboardMode
              ? "px-4 py-4 h-full overflow-y-auto"
              : "p-2 px-3"
          )}
        >
          {/* CodeMirror mount point — always in DOM so the instance stays alive.
              Hidden in preview mode rather than unmounted to avoid destroy/remount. */}
          <div
            ref={containerRef}
            className={clsx("min-h-[3rem]", mode === "preview" && "hidden")}
          />

          {mode === "preview" && <MarkdownPreview source={source} />}
        </div>
      </div>
    </div>
  );
};

export default MarkdownBlock;
