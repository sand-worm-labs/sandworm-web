import type * as Y from "yjs";
import { useEffect, useRef, useState, useCallback } from "react";
import { Transition } from "@headlessui/react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown as markdownLang } from "@codemirror/lang-markdown";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { yCollab } from "y-codemirror.next";
import MarkdownIt from "markdown-it";
import { full as markdownItEmoji } from "markdown-it-emoji";
import markdownItFootnote from "markdown-it-footnote";
import markdownItDeflist from "markdown-it-deflist";
import markdownItAbbr from "markdown-it-abbr";
import markdownItSup from "markdown-it-sup";
import markdownItSub from "markdown-it-sub";
import markdownItMark from "markdown-it-mark";
import markdownItIns from "markdown-it-ins";
import hljs from "highlight.js";
import clsx from "clsx";
import type { ConnectDragPreview } from "react-dnd";
import type { MarkdownBlock } from "@sandworm/editor";
import { tags as t } from "@lezer/highlight";
import { PiCaretDown, PiMarkdownLogo } from "react-icons/pi";

import useEditorAwareness from "../../../hooks/useEditorAwareness";
import type { DashboardMode } from "../../Dashboard";

// =====================================
// ⬢ markdown-it Config
// =====================================

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang) {
    const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
    const highlighted = hljs.highlight(code, { language }).value;
    const encoded = btoa(unescape(encodeURIComponent(code)));
    return `
      <div class="sw-code-block" data-code="${encoded}">
        <div class="sw-code-block__header">
          <span class="sw-code-block__lang">${language}</span>
          <button class="sw-code-block__copy" type="button" data-copy="${encoded}" aria-label="Copy code">Copy</button>
        </div>
        <pre><code class="hljs language-${language}">${highlighted}</code></pre>
      </div>`;
  },
})
  .use(markdownItEmoji)
  .use(markdownItFootnote)
  .use(markdownItDeflist)
  .use(markdownItAbbr)
  .use(markdownItSup)
  .use(markdownItSub)
  .use(markdownItMark)
  .use(markdownItIns);

// =====================================
// ⬢ Types
// =====================================

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
// =====================================

const sandwormTheme = EditorView.theme(
  {
    "&": {
      color: "#1a1a1a",
      backgroundColor: "transparent",
      fontSize: "13px",
      fontFamily: "'Moderat Mono', monospace",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-content": {
      caretColor: "#1a1a1a",
      paddingLeft: "8px",
      fontFamily: "'Moderat Mono', monospace",
    },
    ".cm-scroller": {
      fontFamily: "'Moderat Mono', monospace !important",
    },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#1a1a1a" },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: "#dce4f5" },
    ".cm-selectionMatch": { backgroundColor: "#e8edf8" },
    ".cm-activeLine": { backgroundColor: "transparent" },
  },
  { dark: false }
);

// =====================================
// ⬢ Markdown Highlight Style
// =====================================

const markdownHighlight = HighlightStyle.define([
  { tag: t.heading1, color: "#7B2FBE", fontWeight: "500" },
  { tag: t.heading2, color: "#7B2FBE", fontWeight: "500" },
  { tag: t.heading3, color: "#7B2FBE", fontWeight: "500" },
  { tag: t.heading, color: "#7B2FBE", fontWeight: "500" },
  { tag: t.strong, fontWeight: "600" },
  { tag: t.emphasis, fontStyle: "italic", color: "#555555" },
  {
    tag: t.monospace,
    color: "#2E9E5B",
    fontFamily: "'Moderat Mono', monospace",
  },
  { tag: t.special(t.string), color: "#2E9E5B" },
  { tag: t.tagName, color: "#C96A10" },
  { tag: t.angleBracket, color: "#555555" },
  { tag: t.attributeName, color: "#7B2FBE" },
  { tag: t.attributeValue, color: "#2E9E5B" },
  { tag: t.url, color: "#0b6e99" },
  { tag: t.link, color: "#0b6e99" },
  { tag: t.quote, color: "#8B8FA8", fontStyle: "italic" },
  { tag: t.processingInstruction, color: "#7B2FBE" },
  { tag: t.punctuation, color: "#555555" },
  { tag: t.comment, color: "#8B8FA8", fontStyle: "italic" },
]);

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
    if (!containerRef.current) return () => {};

    const state = EditorState.create({
      doc: source.toString(),
      extensions: [
        yCollab(source, null, { undoManager: false }),
        markdownLang({ htmlTagLanguage: undefined }),
        syntaxHighlighting(markdownHighlight, { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        EditorState.readOnly.of(!isEditable),
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
    return () => view.destroy();
  }, [source, isEditable]);
}

// =====================================
// ⬢ MarkdownPreview
// =====================================

const MarkdownPreview = ({ source }: { source: Y.Text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(
    () => md.render(source.toString()) as string
  );

  useEffect(() => {
    const update = () => setHtml(md.render(source.toString()) as string);
    source.observe(update);
    return () => source.unobserve(update);
  }, [source]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return () => {};

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
      } catch (err) {
        console.log(err);
      }
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [html]);

  if (!html.trim()) {
    return (
      <p className="text-ink-200 italic text-sm py-2 px-1 font-body">
        Nothing to preview yet.
      </p>
    );
  }

  return (
    <>
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
// ⬢ SectionToggle
// =====================================

const SectionToggle = ({
  label,
  collapsed,
  onToggle,
}: {
  label: string;
  collapsed: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className="flex items-center gap-1 text-ink-300 hover:text-ink-400 transition-colors duration-100 group"
  >
    <PiCaretDown
      size={11}
      className={clsx(
        "transition-transform duration-200 flex-shrink-0",
        collapsed && "-rotate-90"
      )}
    />
    <span className="text-[11px] font-body font-medium">{label}</span>
  </button>
);

// =====================================
// ⬢ MarkdownBlock
// =====================================

const MarkdownBlock = (props: Props) => {
  const id = props.block.getAttribute("id")!;
  const source = props.block.getAttribute("source")!;

  // ─── State ───
  const [isSourceCollapsed, setSourceCollapsed] = useState(false);
  const [isPreviewCollapsed, setPreviewCollapsed] = useState(false);
  const [isFocused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [, editorAPI] = useEditorAwareness();

  // ─── Handlers ───
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

  // ─── Border ───
  // Always show a border. Focus and cursor state only affect the border color.
  const borderClass = (() => {
    // Dashboard published — no border, only content shows
    if (props.dashboardMode?._tag === "viewing") return "";

    if (isFocused && props.isEditable)
      return "border border-border-focus dark:border-border-tertiary";

    if (props.isCursorWithin && !props.isCursorInserting)
      return "border border-border-tertiary dark:border-border-tertiary";

    if (
      props.dashboardMode?._tag === "editing" &&
      props.dashboardMode.position === "expanded"
    )
      return "border border-border-focus";

    // Default — always visible, soft
    return "border border-border-secondary dark:border-border-tertiary";
  })();

  // ─── Source height ───
  const sourceLineCount = source.toString().split("\n").length;
  const sourceHeight = `${Math.max(sourceLineCount, 3) * 20 + 24}px`;

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
          borderClass,
          props.dashboardMode ? "h-full overflow-y-auto" : "",
          props.belongsToMultiTabGroup
            ? "rounded-tl-none rounded-xl"
            : "rounded-lg"
        )}
      >
        {/* ── Block header ── */}
        <div
          className="flex items-center justify-between px-3 py-2
          border-b border-border-secondary dark:border-border-tertiary"
        >
          <div className="flex items-center gap-3">
            <SectionToggle
              label="source"
              collapsed={isSourceCollapsed}
              onToggle={() => setSourceCollapsed(v => !v)}
            />
            <SectionToggle
              label="preview"
              collapsed={isPreviewCollapsed}
              onToggle={() => setPreviewCollapsed(v => !v)}
            />
          </div>

          {/* Badge — softer, pill style matching the rest of the UI */}
          <span
            className="inline-flex items-center gap-1
            text-[10px] font-medium font-body
            text-ink-300 dark:text-ink-600
            bg-[#F1F3F4] dark:bg-[#2A2A28]
            border border-[#DEE2E6] dark:border-[#3A3A38]
            px-1.5 py-0.5 rounded-md select-none"
          >
            <PiMarkdownLogo size={11} />
            Markdown
          </span>
        </div>

        {/* ── Source (CodeMirror) ── */}
        <Transition
          show={!isSourceCollapsed}
          unmount={false}
          enter="transition-all ease-in duration-200 overflow-hidden"
          enterFrom="max-h-0 opacity-0"
          enterTo="max-h-[var(--source-height)] opacity-100"
          leave="transition-all ease-out duration-200 overflow-hidden"
          leaveFrom="max-h-[var(--source-height)] opacity-100"
          leaveTo="max-h-0 opacity-0"
        >
          <div
            ref={containerRef}
            style={{ "--source-height": sourceHeight } as React.CSSProperties}
            className={clsx(
              "p-3",
              !isPreviewCollapsed
                ? "border-b border-border-secondary dark:border-border-tertiary"
                : ""
            )}
          />
        </Transition>

        {/* ── Preview ── */}
        <Transition
          show={!isPreviewCollapsed}
          enter="transition-all ease-in duration-200 overflow-hidden"
          enterFrom="max-h-0 opacity-0"
          enterTo="max-h-[2000px] opacity-100"
          leave="transition-all ease-out duration-200 overflow-hidden"
          leaveFrom="max-h-[2000px] opacity-100"
          leaveTo="max-h-0 opacity-0"
        >
          <div
            className={clsx(
              props.dashboardMode
                ? "px-4 py-4 h-full overflow-y-auto"
                : "px-4 py-3"
            )}
          >
            <MarkdownPreview source={source} />
          </div>
        </Transition>
      </div>
    </div>
  );
};

export default MarkdownBlock;
