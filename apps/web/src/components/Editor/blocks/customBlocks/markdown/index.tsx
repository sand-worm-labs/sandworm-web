import type * as Y from "yjs";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Transition } from "@headlessui/react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown as markdownLang } from "@codemirror/lang-markdown";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { defaultKeymap, historyKeymap } from "@codemirror/commands";
import { MergeView } from "@codemirror/merge";
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
import {
  isMarkdownBlockEditWithAIPromptOpen,
  getMarkdownBlockEditWithAIPrompt,
  toggleMarkdownEditWithAIPromptOpen,
  closeMarkdownEditWithAIPrompt,
  getMarkdownAISuggestions,
} from "@sandworm/editor";
import { SparklesIcon } from "@heroicons/react/20/solid";
import { tags as t } from "@lezer/highlight";
import { PiCaretDown, PiMarkdownLogo } from "react-icons/pi";

import {
  useWorkspace,
  useWorkspaces,
} from "@/components/Editor/hooks/useWorkspaces";
import type { ApiWorkspace, ApiDocument } from "@/types";
import { useAITaskActions } from "@/components/Editor/hooks/useAITasks";
import useSideBar from "@/components/Editor/hooks/useSideBar";

import ApproveDiffButtons from "../../ApproveDiffButtons";
import { TooltipV2 } from "../../ToolTips";
import EditWithAIForm from "../../EditWithAIForm";
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
  document: ApiDocument;
  block: Y.XmlElement<MarkdownBlock>;
  belongsToMultiTabGroup: boolean;
  isEditable: boolean;
  dragPreview: ConnectDragPreview | null;
  dashboardMode: DashboardMode | null;
  isCursorWithin: boolean;
  isCursorInserting: boolean;
  onSubmitEditWithAI?: () => Promise<void>;
  isAIEditing?: boolean;
  workspaceId: string;
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

function getBaseExtensions(
  source: Y.Text,
  isEditable: boolean,
  onFocus: () => void,
  onBlur: () => void
) {
  return [
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
  ];
}

function useCodeMirror({
  containerRef,
  source,
  diff,
  isEditable,
  onFocus,
  onBlur,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  source: Y.Text;
  diff?: Y.Text | null;
  isEditable: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const viewRef = useRef<EditorView | null>(null);
  const mergeRef = useRef<MergeView | null>(null);

  useEffect(() => {
    if (!containerRef.current) return () => {};

    // ─── Destroy whatever is currently mounted ──────────────
    viewRef.current?.destroy();
    viewRef.current = null;
    mergeRef.current?.destroy();
    mergeRef.current = null;

    if (diff) {
      mergeRef.current = new MergeView({
        a: {
          doc: source.toString(),
          extensions: [...getBaseExtensions(source, false, onFocus, onBlur)],
        },
        b: {
          doc: diff.toString(),
          extensions: [...getBaseExtensions(diff, false, onFocus, onBlur)],
        },
        parent: containerRef.current,
      });
    } else {
      const state = EditorState.create({
        doc: source.toString(),
        extensions: getBaseExtensions(source, isEditable, onFocus, onBlur),
      });

      viewRef.current = new EditorView({
        state,
        parent: containerRef.current,
      });
    }

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
      mergeRef.current?.destroy();
      mergeRef.current = null;
    };
  }, [source, diff, isEditable]);
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
  const [workspaces] = useWorkspaces();
  const { workspace } = useWorkspace(props.workspaceId);

  const { editTextWithAi, loading } = useAITaskActions();
  const { api: sidebarApi } = useSideBar();

  // ─── AI suggestion diff ────────────────────────────────────
  const [aiSuggestions, setAiSuggestions] = useState<Y.Text | null>(() =>
    getMarkdownAISuggestions(props.block)
  );

  useEffect(() => {
    const update = () => {
      setAiSuggestions(getMarkdownAISuggestions(props.block));
    };
    props.block.observe(update);
    return () => props.block.unobserve(update);
  }, [props.block]);

  const currentWorkspace: ApiWorkspace | undefined = useMemo(
    () => workspaces.data.find(w => w.id === props.document.workspaceId),
    [workspaces.data, props.document.workspaceId]
  );

  const hasOaiKey = useMemo(
    () => currentWorkspace?.secrets?.hasAiModelApiKey ?? false,
    [currentWorkspace]
  );

  // ─── State ─────────────────────────────────────────────────
  const [isSourceCollapsed, setSourceCollapsed] = useState(false);
  const [isPreviewCollapsed, setPreviewCollapsed] = useState(false);
  const [isFocused, setFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [, editorAPI] = useEditorAwareness();

  const editWithAIPrompt = getMarkdownBlockEditWithAIPrompt(props.block);
  const isEditWithAIPromptOpen = isMarkdownBlockEditWithAIPromptOpen(
    props.block
  );

  const onToggleEditWithAIPromptOpen = useCallback(() => {
    if (!hasOaiKey) return;
    toggleMarkdownEditWithAIPromptOpen(props.block);
  }, [props.block, hasOaiKey]);

  const onCloseEditWithAIPrompt = useCallback(() => {
    closeMarkdownEditWithAIPrompt(props.block, false);
    editorAPI.insert(id, { scrollIntoView: false });
  }, [props.block, editorAPI, id]);

  const onSubmitEditWithAI = useCallback(async () => {
    const result = await editTextWithAi({
      workspaceId: props.workspaceId,
      documentId: props.document.id,
      blockId: id,
    });
    if (result?.chatId) {
      closeMarkdownEditWithAIPrompt(props.block, false);
      sidebarApi.openRightPanel("chat", { chatId: result.chatId });
    }
  }, [editTextWithAi, props.workspaceId, props.document.id, id, props.block, sidebarApi]);

  const tooltipContent = useCallback(
    (ref: React.RefObject<HTMLDivElement>) => (
      <div
        ref={ref}
        className="font-body pointer-events-none w-max bg-hunter-950 text-white text-xs p-2 rounded-md"
      >
        {hasOaiKey ? "Edit with AI" : "Missing OpenAI API key"}
      </div>
    ),
    [hasOaiKey]
  );

  const onAcceptAISuggestion = useCallback(() => {
    const suggestions = getMarkdownAISuggestions(props.block);
    if (!suggestions) return;

    const suggestionText = suggestions.toString();
    source.delete(0, source.length);
    source.insert(0, suggestionText);

    props.block.setAttribute("aiSuggestions", null);
    closeMarkdownEditWithAIPrompt(props.block, true);
  }, [props.block, source]);

  const onRejectAISuggestion = useCallback(() => {
    props.block.setAttribute("aiSuggestions", null);
    closeMarkdownEditWithAIPrompt(props.block, false);
  }, [props.block]);

  // ─── Editor focus handlers ─────────────────────────────────
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
    diff: aiSuggestions,
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

  // ─── Border ────────────────────────────────────────────────
  const borderClass = (() => {
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

    return "border border-border-secondary dark:border-border-tertiary";
  })();

  // ─── Source height ─────────────────────────────────────────
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

          <div className="inline-flex items-center gap-1.5">
            {props.isEditable && !props.dashboardMode && (
              <TooltipV2<HTMLButtonElement> content={tooltipContent} active>
                {ref => (
                  <button
                    type="button"
                    ref={ref}
                    onClick={onToggleEditWithAIPromptOpen}
                    disabled={!hasOaiKey}
                    className={clsx(
                      hasOaiKey
                        ? "text-ink-300 hover:text-primary cursor-pointer"
                        : "text-ink-200 cursor-not-allowed",
                      "flex items-center transition-colors"
                    )}
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </TooltipV2>
            )}

            <span className="inline-flex items-center gap-1 text-[10px] font-medium font-body text-ink-300 dark:text-ink-600 bg-[#F1F3F4] dark:bg-[#2A2A28] border border-[#DEE2E6] dark:border-[#3A3A38] px-1.5 py-0.5 rounded-md select-none">
              <PiMarkdownLogo size={11} />
              Markdown
            </span>
          </div>
        </div>

        {/* ── Source (CodeMirror / MergeView) ── */}
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
        <div className="mt-1.5">
          <ApproveDiffButtons
            visible={aiSuggestions !== null}
            status="pending"
            canTry={false}
            onTry={() => {}}
            onAccept={onAcceptAISuggestion}
            onReject={onRejectAISuggestion}
            onUndo={onRejectAISuggestion}
          />
        </div>

        {isEditWithAIPromptOpen ? (
          <EditWithAIForm
            loading={loading.text}
            disabled={loading.text}
            onSubmit={onSubmitEditWithAI}
            onClose={onCloseEditWithAIPrompt}
            value={editWithAIPrompt}
            hasOutput={false}
          />
        ) : null}

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
