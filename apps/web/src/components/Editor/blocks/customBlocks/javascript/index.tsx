import type * as Y from "yjs";
import {
  type JavaScriptBlock as JavaScriptBlockType,
  getBaseAttributes,
  getJavaScriptSource,
  setTitle,
} from "@sandworm/editor";
import clsx from "clsx";
import { useCallback, useState } from "react";
import type { ConnectDragPreview } from "react-dnd";
import { PiFileJs, PiPlayFill, PiTrash } from "react-icons/pi";
import { useTheme } from "next-themes";

import type { ApiDocument } from "@/types";
import {
  trustNotebook,
  useNotebookTrusted,
} from "@/lib/browser-executor/trust";

import { BlockTypePill } from "../../BlockTypePill";
import type { DashboardMode } from "../../Dashboard";
import { dashboardModeHasControls } from "../../Dashboard/dashboard-types";
import {
  useIsBrowserRuntime,
  useIsForeignNotebook,
} from "../../../hooks/useEnvironmentStatus";
import { NotebookContentLabel } from "../../NotebookContentLabel";
import useEditorAwareness from "../../../hooks/useEditorAwareness";
import CodeEditor from "../CodeEditor";
import { useEditorThemeId } from "../CodeEditor/useEditorThemeId";

import JavaScriptFrame from "./JavaScriptFrame";

interface Props {
  block: Y.XmlElement<JavaScriptBlockType>;
  document: ApiDocument;
  isEditable: boolean;
  dragPreview: ConnectDragPreview | null;
  dashboardMode: DashboardMode | null;
  onDeleteBlock?: () => void;
  hideTypePill?: boolean;
}

const noop = () => {};

// A cell of JavaScript. There is no kernel behind it: running it means
// loading its code into a sandboxed frame on this page (see ./frame.ts), which
// happens when the notebook opens and each time Run is pressed.
function JavaScriptBlock(props: Props) {
  const { resolvedTheme } = useTheme();
  const editorThemeId = useEditorThemeId();
  const isBrowserRuntime = useIsBrowserRuntime();
  const isForeign = useIsForeignNotebook();
  // Someone else's notebook doesn't run until the reader says so.
  const trusted = useNotebookTrusted(props.document.id);
  const [editorState, editorAPI] = useEditorAwareness();

  const { id: blockId, title } = getBaseAttributes(props.block);
  const source = getJavaScriptSource(props.block);
  const current = source.toString();

  // What is in the frame. An editor's keystrokes don't run until they ask;
  // a reader always sees the notebook's current code.
  const [run, setRun] = useState(() => ({ id: 0, code: current }));
  const onRun = useCallback(() => {
    setRun(prev => ({ id: prev.id + 1, code: source.toString() }));
  }, [source]);
  const code = props.isEditable ? run.code : current;
  const edited = props.isEditable && current !== run.code;

  const onChangeTitle = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(props.block, e.target.value);
    },
    [props.block]
  );
  const onClickWithin = useCallback(() => {
    editorAPI.focus(blockId, { scrollIntoView: false });
  }, [blockId, editorAPI]);

  const isDashboardTile =
    !!props.dashboardMode && !dashboardModeHasControls(props.dashboardMode);

  let output: React.ReactNode;
  if (!isBrowserRuntime) {
    // The server can't run JavaScript, so a cloud notebook has none; one that
    // got here some other way says so instead of half-working.
    output = (
      <div className="px-4 py-3 text-xs text-ink-400">
        JavaScript cells only run in Live dashboard and Local analysis
        notebooks.
      </div>
    );
  } else if (!trusted) {
    output = (
      <div className="flex items-center justify-between gap-x-3 px-4 py-3 text-xs text-ink-400">
        <span>
          Not run yet: someone else wrote this notebook, and its code runs in
          your browser.
        </span>
        <button
          type="button"
          onClick={() => trustNotebook(props.document.id)}
          className="shrink-0 rounded-md border border-hover-border px-2 py-1 text-ink-100 hover:border-primary"
        >
          Run notebook
        </button>
      </div>
    );
  } else {
    // In a tile the frame takes the height the label leaves.
    output = (
      <div className={isDashboardTile ? "flex h-full flex-col" : undefined}>
        {isForeign && <NotebookContentLabel />}
        <div className={isDashboardTile ? "min-h-0 flex-1" : undefined}>
          <JavaScriptFrame
            notebookId={props.document.id}
            code={code}
            runId={run.id}
            isDark={resolvedTheme === "dark"}
            hasPython={isBrowserRuntime}
            fillHeight={isDashboardTile}
          />
        </div>
      </div>
    );
  }

  if (isDashboardTile) {
    return <div className="h-full w-full ph-no-capture">{output}</div>;
  }

  const isFocused = editorState.cursorBlockId === blockId;

  return (
    <div
      className="relative group/block mt-6"
      role="presentation"
      onClick={onClickWithin}
      onKeyDown={e => {
        if (e.key === "Enter") onClickWithin();
      }}
      data-block-id={blockId}
    >
      <div
        className={clsx(
          "relative rounded-2xl border-[1.5px] overflow-hidden bg-white dark:bg-block-surface",
          isFocused && editorState.mode === "insert"
            ? "border-primary block-focus-ring"
            : "border-hover-border dark:border-border-dark block-shadow-soft"
        )}
      >
        <div
          className="flex items-center gap-x-1.5 px-4 h-10 border-b border-hover-border dark:border-border-dark"
          ref={d => {
            props.dragPreview?.(d);
          }}
        >
          <PiFileJs className="h-4 w-4 text-ink-400 shrink-0" />
          <input
            type="text"
            className="text-sm font-body font-normal pl-1 block w-full border-0 focus:outline-none text-ink-100 placeholder:text-ink-300 py-0 bg-transparent"
            placeholder={props.isEditable ? "Add a title..." : "JavaScript"}
            value={title}
            disabled={!props.isEditable}
            onChange={onChangeTitle}
          />
        </div>

        {props.isEditable && (
          <div className="print:hidden border-b border-hover-border dark:border-border-dark">
            <CodeEditor
              workspaceId={props.document.workspaceId}
              documentId={props.document.id}
              blockId={blockId}
              source={source}
              language="javascript"
              readOnly={false}
              onEditWithAI={noop}
              onRun={onRun}
              onInsertBlock={noop}
              disabled={false}
              themeId={editorThemeId}
            />
            <div className="flex items-center justify-between px-3 py-2 text-xs text-ink-400 bg-inputBg dark:bg-block-surface border-t border-hover-border dark:border-border-dark">
              <span>
                {edited
                  ? "Edited. Run to see the change."
                  : "Runs in this browser, when the notebook opens."}
              </span>
              <span className="inline-flex gap-x-1 items-center text-ink-300">
                ⌘ + Enter
              </span>
            </div>
          </div>
        )}

        <div className="p-3 ph-no-capture">{output}</div>
      </div>

      {!props.hideTypePill && (
        <div className="absolute left-0 top-0 -translate-y-full pb-2">
          <BlockTypePill
            label="JavaScript"
            icon={<PiFileJs className="w-3 h-3" />}
          />
        </div>
      )}
      {props.isEditable && (
        <div
          className={clsx(
            "absolute transition-opacity group-hover/block:opacity-100 right-0 top-0 -translate-y-full pb-2 flex flex-row gap-x-1",
            isFocused ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            type="button"
            onClick={onRun}
            aria-label="Run"
            title="Run (⌘ + Enter)"
            className="rounded-[5px] border-hover-border border h-[24px] min-w-[24px] flex items-center justify-center bg-base-200 dark:bg-block-surface hover:bg-hover-bg hover:border-primary"
          >
            <PiPlayFill className="w-[13px] h-[13px] text-ink-navy" />
          </button>
          {props.onDeleteBlock && (
            <button
              type="button"
              onClick={props.onDeleteBlock}
              aria-label="Delete block"
              className="bg-[#FFDBDB] dark:bg-block-surface dark:border dark:border-hover-border rounded-[5px] h-[24px] min-w-[24px] flex items-center justify-center group hover:bg-error"
            >
              <PiTrash className="w-[13px] h-[13px] text-ink-navy group-hover:text-white" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default JavaScriptBlock;
