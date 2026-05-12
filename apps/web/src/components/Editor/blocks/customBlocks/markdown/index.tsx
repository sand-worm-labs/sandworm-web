import type * as Y from "yjs";
import { useEffect, useRef, useState, useCallback } from "react";
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
// =====================================
const sandwormTheme = EditorView.theme(
  {
    "&": {
      color: "#1a1a1a",
      backgroundColor: "transparent",
      fontSize: "13px",
      fontFamily: "'Geist Mono', monospace",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-content": {
      caretColor: "#1a1a1a",
      paddingLeft: "8px",
      fontFamily: "'Geist Mono', monospace",
    },
    ".cm-scroller": {
      fontFamily: "'Geist Mono', monospace !important",
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
  { tag: t.heading1, color: "#7B2FBE", fontWeight: "500", fontSize: "1em" },
  { tag: t.heading2, color: "#7B2FBE", fontWeight: "500" },
  { tag: t.heading3, color: "#7B2FBE", fontWeight: "500" },
  { tag: t.heading, color: "#7B2FBE", fontWeight: "500" },

  { tag: t.strong, fontWeight: "bold" },
  { tag: t.emphasis, fontStyle: "italic", color: "#555555" },

  { tag: t.monospace, color: "#2E9E5B", fontFamily: "'Geist Mono', monospace" },

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
    return () => {
      view.destroy();
    };
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
      <p className="text-ink-200 italic text-sm py-2 px-1">
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
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border-secondary dark:border-border-tertiary">
          <span className="text-xs text-ink-300 font-medium font-mono">
            Markdown
          </span>
          {props.isEditable && <ModeToggle mode={mode} onChange={setMode} />}
        </div>

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
