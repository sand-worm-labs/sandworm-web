import type * as Y from "yjs";
import { useEffect, useRef, useState, useCallback } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown as markdownLang } from "@codemirror/lang-markdown";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { yCollab } from "y-codemirror.next";
import { marked, type Renderer } from "marked";
import hljs from "highlight.js";
import clsx from "clsx";
import type { ConnectDragPreview } from "react-dnd";
import type { MarkdownBlock } from "@sandworm/editor";

import useEditorAwareness from "../../../hooks/useEditorAwareness";
import type { DashboardMode } from "../../Dashboard";

// =====================================
// ⬢ Marked Config
//   Custom renderer wires highlight.js into code blocks and injects
//   a data-code attribute so the preview copy buttons can read the raw text.
// =====================================
const renderer: Partial<Renderer> = {
  code({ text, lang }) {
    const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
    const highlighted = hljs.highlight(text, { language }).value;
    // data-code carries the raw text for the copy button (base64 to survive HTML escaping)
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return `
      <div class="sw-code-block" data-code="${encoded}">
        <div class="sw-code-block__header">
          <span class="sw-code-block__lang">${language}</span>
          <button class="sw-code-block__copy" type="button" data-copy="${encoded}" aria-label="Copy code">
            Copy
          </button>
        </div>
        <pre><code class="hljs language-${language}">${highlighted}</code></pre>
      </div>`;
  },
};
marked.use({ renderer, gfm: true, breaks: false });

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
//   Geist Mono font, no line numbers (removed from extensions),
//   transparent background to inherit block surface.
// =====================================
const sandwormTheme = EditorView.theme({
  "&": {
    fontSize: "0.875rem",
    fontFamily: "'Geist Mono', 'GeistMono', ui-monospace, monospace",
    backgroundColor: "transparent",
    height: "100%",
  },
  ".cm-content": {
    padding: "0.75rem 0",
    caretColor: "var(--color-primary)",
    fontFamily: "'Geist Mono', 'GeistMono', ui-monospace, monospace",
  },
  ".cm-line": { padding: "0 0.75rem" },
  ".cm-focused": { outline: "none" },
  ".cm-activeLine": { backgroundColor: "rgba(99,60,180,0.05)" },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(99,60,180,0.15) !important",
  },
  // hide the cursor line highlight on blur
  "&:not(.cm-focused) .cm-activeLine": { backgroundColor: "transparent" },
});

// =====================================
// ⬢ useCodeMirror
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
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: source.toString(),
      extensions: [
        yCollab(source, null, { undoManager: false }),
        markdownLang(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorState.readOnly.of(!isEditable),
        // ── No lineNumbers() — removed intentionally ──────────────────────
        sandwormTheme,
        EditorView.lineWrapping,
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
    return () => {
      view.destroy();
    };
  }, [source, isEditable]); // eslint-disable-line react-hooks/exhaustive-deps
}

// =====================================
// ⬢ MarkdownPreview
//   Renders marked HTML with hljs-highlighted code blocks.
//   Copy buttons are wired via event delegation on the container —
//   no per-block React state needed.
// =====================================
const MarkdownPreview = ({ source }: { source: Y.Text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(
    () => marked.parse(source.toString()) as string
  );

  // ── Sync HTML when Y.Text changes ────────────────────────────────────────
  useEffect(() => {
    const update = () => setHtml(marked.parse(source.toString()) as string);
    source.observe(update);
    return () => source.unobserve(update);
  }, [source]);

  // ── Copy button delegation ────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(
        "[data-copy]"
      );
      if (!btn) return;

      const encoded = btn.getAttribute("data-copy") ?? "";
      try {
        const text = decodeURIComponent(escape(atob(encoded)));
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => {
            btn.textContent = original;
          }, 1500);
        });
      } catch {}
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [html]);

  if (!html.trim()) {
    return (
      <p className="text-ink-200 italic text-sm py-2 px-1">
        Nothing to preview yet.
      </p>
    );
  }

  return (
    <>
      {/* hljs theme — github-dark works well with both light/dark surfaces */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
        media="(prefers-color-scheme: light)"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
        media="(prefers-color-scheme: dark)"
      />
      <div
        ref={containerRef}
        className="sw-markdown-preview prose prose-sm sm:prose-base max-w-full font-body sandworm-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
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
  <div className="flex items-center gap-x-1 text-xs select-none">
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

  const onFocus = useCallback(() => {
    setFocused(true);
    editorAPI.insert(id, { scrollIntoView: false });
  }, [id, editorAPI]);

  const onBlur = useCallback(() => {
    setFocused(false);
    editorAPI.blur();
  }, [editorAPI]);

  useCodeMirror({
    containerRef,
    source,
    isEditable: props.isEditable,
    onFocus,
    onBlur,
  });

  useEffect(() => {
    if (
      props.isCursorInserting &&
      props.isCursorWithin &&
      containerRef.current
    ) {
      containerRef.current.querySelector<HTMLElement>(".cm-content")?.focus();
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
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-secondary dark:border-border-tertiary">
          <span className="text-xs text-ink-300 font-medium font-mono">
            Markdown
          </span>
          {props.isEditable && <ModeToggle mode={mode} onChange={setMode} />}
        </div>

        {/* Body */}
        <div
          className={clsx(
            props.dashboardMode ? "px-4 py-4 h-full overflow-y-auto" : "p-3"
          )}
        >
          <div
            ref={containerRef}
            className={clsx(mode === "preview" && "hidden")}
          />
          {mode === "preview" && <MarkdownPreview source={source} />}
        </div>
      </div>
    </div>
  );
};

export default MarkdownBlock;
