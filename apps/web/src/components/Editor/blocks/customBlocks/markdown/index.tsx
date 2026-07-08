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
  getBaseAttributes,
  setTitle,
} from "@sandworm/editor";
import { tags as t } from "@lezer/highlight";
import { PiMarkdownLogo, PiCpu } from "react-icons/pi";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import { useWorkspaces } from "@/components/Editor/hooks/useWorkspaces";
import type { ApiWorkspace, ApiDocument } from "@/types";
import { useAITaskActions } from "@/components/Editor/hooks/useAITasks";
import useSideBar from "@/components/Editor/hooks/useSideBar";

import ApproveDiffButtons from "../../ApproveDiffButtons";
import { TooltipV2 } from "../../ToolTips";
import EditWithAIForm from "../../EditWithAIForm";
import useEditorAwareness from "../../../hooks/useEditorAwareness";
import type { DashboardMode } from "../../Dashboard";
import { BlockTypePill } from "../../BlockTypePill";

// =====================================
// ⬢ HatchBackground
// =====================================

function HatchBackground() {
  return (
    <div
      className="border border-[#E7E1F0] h-2"
      style={{
        backgroundColor: "white",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'%3E%3Crect width='8' height='8' fill='white'/%3E%3Cline x1='0' y1='8' x2='8' y2='0' stroke='%23E7E1F0' stroke-width='1'/%3E%3C/svg%3E")`,
      }}
    />
  );
}

function countMarkdownLines(source: Y.Text): number {
  const text = source.toString().trim();
  if (!text) return 0;
  return text.split("\n").length;
}

function CollapsedCodeSummary({ lineCount }: { lineCount: number }) {
  return (
    <div className="flex items-center gap-x-2 px-4 py-1.5 text-xs bg-[#F8F9FA] dark:bg-base-200 border-t border-[#E6E0F1] dark:border-border-tertiary">
      <span className="italic text-ink-400">{lineCount} lines hidden</span>
    </div>
  );
}

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
// ⬢ MarkdownBlock
// =====================================

const MarkdownBlock = (props: Props) => {
  const id = props.block.getAttribute("id")!;
  const source = props.block.getAttribute("source")!;
  const [workspaces] = useWorkspaces();

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

  const containerRef = useRef<HTMLDivElement>(null);
  const [, editorAPI] = useEditorAwareness();

  const { title } = getBaseAttributes(props.block);

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(props.block, e.target.value);
    },
    [props.block]
  );

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
  }, [
    editTextWithAi,
    props.workspaceId,
    props.document.id,
    id,
    props.block,
    sidebarApi,
  ]);

  const aiEditTooltipContent = useCallback(
    (ref: React.RefObject<HTMLDivElement>) => (
      <div
        ref={ref}
        className={clsx(
          "font-body pointer-events-none absolute opacity-0 transition-opacity group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col items-center justify-center gap-y-1 z-30",
          hasOaiKey ? "w-32" : "w-40"
        )}
      >
        <span className="text-center">
          {hasOaiKey ? "Open AI edit form" : "Missing OpenAI API key"}
        </span>
        {!hasOaiKey && (
          <span className="text-ink-400 text-center">
            Admins can add an AI key in settings.
          </span>
        )}
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
    editorAPI.insert(id, { scrollIntoView: false });
  }, [id, editorAPI]);

  const onBlur = useCallback(() => {
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

  const sourceLineCount = Math.max(
    source.toString().split("\n").length,
    aiSuggestions?.toString().split("\n").length ?? 0
  );
  const dynamicHeight = `${sourceLineCount * 20 + 130}px`;

  const diffButtonsVisible = aiSuggestions !== null;

  return (
    <div
      className="relative group/block mt-6"
      data-testid={`MarkdownBlock-${id}`}
      data-block-id={id}
    >
      <div
        className={clsx(
          "rounded-2xl border-[1.5px]",
          props.belongsToMultiTabGroup ? "rounded-tl-none" : "",
          {
            "border-[#A308F0] block-focus-ring":
              props.isCursorWithin && props.isCursorInserting,
            "border-[#E6E0F1] block-shadow-soft dark:border-border-tertiary":
              !props.isCursorWithin || !props.isCursorInserting,
          }
        )}
      >
        <div
          className={clsx(
            "rounded-t-2xl dark:bg-base-100",
            props.belongsToMultiTabGroup ? "rounded-tl-none" : "",
            isSourceCollapsed
              ? "rounded-b-2xl"
              : "border-b border-[#E6E0F1] dark:border-border-tertiary"
          )}
          ref={d => {
            props.dragPreview?.(d);
          }}
        >
          <div
            className={clsx(
              "flex items-center px-3 gap-x-4 font-body h-10 rounded-t-2xl",
              props.belongsToMultiTabGroup ? "rounded-tl-none" : "",
              isSourceCollapsed ? "rounded-b-2xl" : ""
            )}
          >
            <div className="select-none text-gray-300 text-xs flex items-center w-full h-full gap-x-1.5 px-4">
              <div className="relative group w-4 h-4">
                <button
                  type="button"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setSourceCollapsed(v => !v)}
                >
                  {isSourceCollapsed ? (
                    <ChevronRightIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              <input
                type="text"
                className="text-sm font-body font-normal pl-1 ring-gray-200 focus:ring-border-focus block w-full rounded-lg border-0 text-ink-100 hover:ring-1 focus:ring-1 ring-inset focus:ring-inset placeholder:text-[#868E96] py-0 disabled:ring-0 h-2/3 bg-transparent focus:bg-base-100"
                placeholder={props.isEditable ? "Add a title..." : "Markdown"}
                value={title}
                disabled={!props.isEditable}
                onChange={onChangeTitle}
              />
            </div>
          </div>
        </div>

        <Transition
          as="div"
          show={!isSourceCollapsed}
          enter="transition-all ease-in duration-300 overflow-hidden"
          enterFrom="max-h-0"
          enterTo="max-h-[var(--dynamic-height)]"
          leave="transition-[max-height] ease-out duration-300 overflow-hidden"
          leaveFrom="max-h-[var(--dynamic-height)]"
          leaveTo="max-h-0"
          style={{ "--dynamic-height": dynamicHeight } as React.CSSProperties}
        >
          <div className="print:hidden py-5">
            <div ref={containerRef} />
          </div>

          <ApproveDiffButtons
            visible={diffButtonsVisible}
            status="pending"
            canTry={false}
            onTry={() => {}}
            onAccept={onAcceptAISuggestion}
            onReject={onRejectAISuggestion}
            onUndo={onRejectAISuggestion}
          />

          {isEditWithAIPromptOpen ? (
            <EditWithAIForm
              loading={loading.text}
              disabled={loading.text}
              onSubmit={onSubmitEditWithAI}
              onClose={onCloseEditWithAIPrompt}
              value={editWithAIPrompt}
              hasOutput
            />
          ) : (
            <div className="print:hidden px-3 pb-3">
              <div className="flex justify-end text-xs pt-2 pb-3 px-3 -mx-3 -mb-3 bg-[#F8F9FA] dark:bg-base-200 border-t border-[#E6E0F1]">
                {props.isEditable && !props.dashboardMode && (
                  <TooltipV2<HTMLButtonElement>
                    content={aiEditTooltipContent}
                    active
                  >
                    {ref => (
                      <button
                        type="button"
                        ref={ref}
                        onClick={onToggleEditWithAIPromptOpen}
                        disabled={!hasOaiKey}
                        className={clsx(
                          !hasOaiKey
                            ? "cursor-not-allowed bg-gray-200 dark:bg-base-100"
                            : "cursor-pointer hover:bg-[#F1F2F4] hover:text-gray-700 hover:border-primary",
                          "flex items-center border rounded-md border-[#E6E0F1] px-2 py-1 gap-x-1 text-ink-300 group relative font-body"
                        )}
                      >
                        <PiCpu className="w-[11.5px] h-[11.5px] text-ink-300" />
                        <span>Edit with AI</span>
                      </button>
                    )}
                  </TooltipV2>
                )}
              </div>
            </div>
          )}
        </Transition>

        {isSourceCollapsed && (
          <CollapsedCodeSummary lineCount={countMarkdownLines(source)} />
        )}
        {!isSourceCollapsed && <HatchBackground />}

        <div
          className={clsx(
            props.dashboardMode
              ? "px-4 py-4 h-full overflow-y-auto"
              : "px-4 py-3"
          )}
        >
          <MarkdownPreview source={source} />
        </div>
      </div>

      {/* ── Block type pill ── */}
      <div className="absolute left-0 top-0 -translate-y-full pb-2">
        <BlockTypePill
          label="Markdown"
          icon={<PiMarkdownLogo className="w-3 h-3" />}
        />
      </div>
    </div>
  );
};

export default MarkdownBlock;
