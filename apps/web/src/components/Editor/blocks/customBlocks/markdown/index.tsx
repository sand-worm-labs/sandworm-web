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
import { useTheme } from "next-themes";
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
import { PiMarkdownLogo, PiCpu, PiTrash } from "react-icons/pi";
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
    <div className="hatch-bg border border-[#E7E1F0] dark:border-legacy-lightText h-2" />
  );
}

function countMarkdownLines(source: Y.Text): number {
  const text = source.toString().trim();
  if (!text) return 0;
  return text.split("\n").length;
}

function CollapsedCodeSummary({ lineCount }: { lineCount: number }) {
  return (
    <div className="flex items-center gap-x-2 px-4 py-1.5 text-xs bg-inputBg dark:bg-header-surface border-t border-hover-border dark:border-border-dark">
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
  onDeleteBlock: () => void;
}

// =====================================
// ⬢ CodeMirror Theme
// =====================================

function getSandwormTheme(isDark: boolean) {
  const c = isDark
    ? { text: "#d4d4d4", selection: "#33344a", selectionMatch: "#24263a" }
    : { text: "#1a1a1a", selection: "#dce4f5", selectionMatch: "#e8edf8" };

  return EditorView.theme(
    {
      "&": {
        color: c.text,
        backgroundColor: "transparent",
        fontSize: "13px",
        fontFamily: "'Moderat Mono', monospace",
      },
      "&.cm-focused": { outline: "none" },
      ".cm-content": {
        caretColor: c.text,
        paddingLeft: "8px",
        fontFamily: "'Moderat Mono', monospace",
      },
      ".cm-scroller": {
        fontFamily: "'Moderat Mono', monospace !important",
      },
      ".cm-cursor, .cm-dropCursor": { borderLeftColor: c.text },
      "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
        { backgroundColor: c.selection },
      ".cm-selectionMatch": { backgroundColor: c.selectionMatch },
      ".cm-activeLine": { backgroundColor: "transparent" },
    },
    { dark: isDark }
  );
}

// =====================================
// ⬢ Markdown Highlight Style
// =====================================

function getMarkdownHighlight(isDark: boolean) {
  const c = isDark
    ? {
        heading: "#D988F9",
        emphasis: "#B0B0B0",
        monospace: "#8FD693",
        tagName: "#E0995B",
        angleBracket: "#B0B0B0",
        link: "#5AC8E0",
        quote: "#9C9A92",
        punctuation: "#B0B0B0",
        comment: "#9C9A92",
      }
    : {
        heading: "#7B2FBE",
        emphasis: "#555555",
        monospace: "#2E9E5B",
        tagName: "#C96A10",
        angleBracket: "#555555",
        link: "#0b6e99",
        quote: "#8B8FA8",
        punctuation: "#555555",
        comment: "#8B8FA8",
      };

  return HighlightStyle.define([
    { tag: t.heading1, color: c.heading, fontWeight: "500" },
    { tag: t.heading2, color: c.heading, fontWeight: "500" },
    { tag: t.heading3, color: c.heading, fontWeight: "500" },
    { tag: t.heading, color: c.heading, fontWeight: "500" },
    { tag: t.strong, fontWeight: "600" },
    { tag: t.emphasis, fontStyle: "italic", color: c.emphasis },
    {
      tag: t.monospace,
      color: c.monospace,
      fontFamily: "'Moderat Mono', monospace",
    },
    { tag: t.special(t.string), color: c.monospace },
    { tag: t.tagName, color: c.tagName },
    { tag: t.angleBracket, color: c.angleBracket },
    { tag: t.attributeName, color: c.heading },
    { tag: t.attributeValue, color: c.monospace },
    { tag: t.url, color: c.link },
    { tag: t.link, color: c.link },
    { tag: t.quote, color: c.quote, fontStyle: "italic" },
    { tag: t.processingInstruction, color: c.heading },
    { tag: t.punctuation, color: c.punctuation },
    { tag: t.comment, color: c.comment, fontStyle: "italic" },
  ]);
}

// =====================================
// ⬢ useCodeMirror
// =====================================

function getBaseExtensions(
  source: Y.Text,
  isEditable: boolean,
  isDark: boolean,
  onFocus: () => void,
  onBlur: () => void
) {
  return [
    yCollab(source, null, { undoManager: false }),
    markdownLang({ htmlTagLanguage: undefined }),
    syntaxHighlighting(getMarkdownHighlight(isDark), { fallback: true }),
    keymap.of([...defaultKeymap, ...historyKeymap]),
    EditorState.readOnly.of(!isEditable),
    getSandwormTheme(isDark),
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
  isDark,
  onFocus,
  onBlur,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  source: Y.Text;
  diff?: Y.Text | null;
  isEditable: boolean;
  isDark: boolean;
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
          extensions: [
            ...getBaseExtensions(source, false, isDark, onFocus, onBlur),
          ],
        },
        b: {
          doc: diff.toString(),
          extensions: [
            ...getBaseExtensions(diff, false, isDark, onFocus, onBlur),
          ],
        },
        parent: containerRef.current,
      });
    } else {
      const state = EditorState.create({
        doc: source.toString(),
        extensions: getBaseExtensions(
          source,
          isEditable,
          isDark,
          onFocus,
          onBlur
        ),
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
  }, [source, diff, isEditable, isDark]);
}

// =====================================
// ⬢ MarkdownPreview
// =====================================

const MarkdownPreview = ({ source }: { source: Y.Text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
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
        href={
          resolvedTheme === "dark"
            ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"
            : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
        }
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
  const { resolvedTheme } = useTheme();

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
    isDark: resolvedTheme === "dark",
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
            "border-primary block-focus-ring":
              props.isCursorWithin && props.isCursorInserting,
            "border-hover-border block-shadow-soft dark:border-border-dark":
              !props.isCursorWithin || !props.isCursorInserting,
          }
        )}
      >
        <div
          className={clsx(
            "rounded-t-2xl dark:bg-header-surface",
            props.belongsToMultiTabGroup ? "rounded-tl-none" : "",
            isSourceCollapsed
              ? "rounded-b-2xl"
              : "border-b border-hover-border dark:border-border-dark"
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
                className="text-sm font-body font-normal pl-1 block w-full border-0 border-b border-transparent focus:border-primary focus:outline-none text-ink-100 placeholder:text-ink-300 py-0 h-2/3 bg-transparent focus:bg-base-100"
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
              <div className="flex justify-end text-xs pt-2 pb-3 px-3 -mx-3 -mb-3 bg-inputBg dark:bg-header-surface border-t border-hover-border dark:border-border-dark">
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
                            : "cursor-pointer dark:bg-header-surface hover:bg-hover-bg hover:text-gray-700 hover:border-primary",
                          "flex items-center border rounded-md border-hover-border px-2 py-1 gap-x-1 text-ink-300 dark:text-ink-400 group relative font-body"
                        )}
                      >
                        <PiCpu className="w-[11.5px] h-[11.5px] text-ink-300 dark:text-ink-400" />
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

      <div
        className={clsx(
          "absolute transition-opacity opacity-0 group-hover/block:opacity-100 right-0 top-0 -translate-y-full pb-2 flex flex-row gap-x-1",
          !props.isEditable ? "hidden" : "flex"
        )}
      >
        <button
          type="button"
          onClick={props.onDeleteBlock}
          aria-label="Delete block"
          className="bg-[#FFDBDB] dark:bg-header-surface dark:border dark:border-hover-border rounded-[5px] h-[24px] min-w-[24px] flex items-center justify-center group hover:bg-error"
        >
          <PiTrash className="w-[13px] h-[13px] text-ink-navy group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default MarkdownBlock;
