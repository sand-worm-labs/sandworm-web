import type * as Y from "yjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Transition } from "@headlessui/react";
import { useTheme } from "next-themes";
import { PiCheck, PiCopy, PiDownloadSimple, PiX } from "react-icons/pi";
import type {
  AITasks,
  ExecutionQueue,
  PythonBlock,
  YBlock,
} from "@sandworm/editor";
import {
  BlockType,
  getBlocks,
  getDataframes,
  getLayout,
} from "@sandworm/editor";

import type { ApiDocument } from "@/types";

import { useYDocState } from "../../hooks/useYDocs";
import type { APIDataSources } from "../../hooks/useDataSources";

// eslint-disable-next-line import/no-cycle
import { GridBlockRenderer } from "./GridElement";
import { TileChromeContext } from "./TileChromeContext";
import { fileNameFor, parseChartText, renderChartPng } from "./chartImage";

interface Props {
  // The block whose result is shown; null keeps the modal closed.
  block: YBlock | null;
  onClose: () => void;
  yDoc: Y.Doc;
  document: ApiDocument;
  dataSources: APIDataSources;
  userId: string | null;
  executionQueue: ExecutionQueue;
  aiTasks: AITasks;
  isPublicMode: boolean;
}

// A chart sizes itself to its box, so it needs a box with a fixed height; a card or a
// table does not, and would sit in empty space. This is read from the block's stored
// output, not from what is on screen: a result mounts piece by piece, and sizing the
// box from a half-drawn result makes the chart measure a box that is about to grow.
function hasChart(block: YBlock): boolean {
  const type = block.getAttribute("type");
  if (type === BlockType.VisualizationV2) {
    return true;
  }
  if (type === BlockType.Python) {
    const results =
      (block as Y.XmlElement<PythonBlock>).getAttribute("result") ?? [];
    return results.some(result => result.type === "plotly");
  }
  return false;
}

// =====================================
// ⬢ Result modal
// =====================================
// What a dashboard tile's camera button opens: the tile's result, large, with
// its title, and nothing else. The block's code stays out of it: this is for
// reading and sharing a result, not for editing the block (edit mode has its own
// expanded view for that). It draws the result with the same renderer as the
// tile, so a chart or table looks the same, only bigger.
export default function DashboardResultModal(props: Props) {
  const { state: blocks } = useYDocState(props.yDoc, getBlocks);
  const { state: dataframes } = useYDocState(props.yDoc, getDataframes);
  const { state: yLayout } = useYDocState(props.yDoc, getLayout);
  const { block, onClose } = props;
  const { resolvedTheme } = useTheme();

  // Download / Copy: the chart as an image, with its title, legend and source line.
  const content = useRef<HTMLDivElement>(null);
  const [exportState, setExportState] = useState<
    "idle" | "working" | "copied" | "failed"
  >("idle");
  const makeImage = useCallback(async () => {
    const graphDiv =
      content.current?.querySelector<HTMLElement>(".js-plotly-plot");
    if (!graphDiv || !block) {
      throw new Error("The chart is not drawn yet");
    }
    const results =
      block.getAttribute("type") === BlockType.Python
        ? ((block as Y.XmlElement<PythonBlock>).getAttribute("result") ?? [])
        : [];
    const text = parseChartText(
      results as { type?: string; html?: string; layout?: any }[],
      block.getAttribute("title") ?? ""
    );
    const blob = await renderChartPng(graphDiv, text, resolvedTheme === "dark");
    return { blob, name: fileNameFor(text.title) };
  }, [block, resolvedTheme]);

  const flash = (state: "copied" | "failed") => {
    setExportState(state);
    window.setTimeout(() => setExportState("idle"), 1800);
  };
  const onDownload = async () => {
    setExportState("working");
    try {
      const { blob, name } = await makeImage();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.click();
      URL.revokeObjectURL(url);
      setExportState("idle");
    } catch {
      flash("failed");
    }
  };
  const onCopy = async () => {
    setExportState("working");
    try {
      const { blob } = await makeImage();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      flash("copied");
    } catch {
      flash("failed");
    }
  };

  useEffect(() => {
    if (!block) {
      return () => {};
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [block, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  const blockId = block?.getAttribute("id") ?? "";
  const title = (block?.getAttribute("title") ?? "").trim();

  return createPortal(
    <Transition
      as="div"
      className="fixed inset-0 z-[99] flex items-center justify-center p-4 sm:p-8"
      enter="transition ease-out duration-100"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
      show={block !== null}
    >
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="fixed inset-0 bg-black bg-opacity-50 cursor-default"
        onClick={onClose}
      />
      {block ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title || "Result"}
          className="relative flex flex-col font-body w-full max-w-[1100px] max-h-full rounded-2xl border border-border dark:border-border-tertiary bg-base-100 dark:bg-dropdown-bg shadow-xl overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4 px-6 pt-5 pb-3">
            <h2 className="text-lg font-medium text-ink-100 truncate font-body">
              {title || "Result"}
            </h2>
            <button
              type="button"
              aria-label="Close"
              className="shrink-0 rounded-md p-1 text-ink-400 hover:text-ink-100 hover:bg-hover-bg dark:hover:bg-base-600"
              onClick={onClose}
            >
              <PiX className="h-5 w-5" />
            </button>
          </div>
          {/* A definite height: a chart sizes itself to its box. */}
          <div
            ref={content}
            className={clsx(
              "overflow-auto px-2 pb-4",
              hasChart(block) ? "h-[68vh] min-h-[320px]" : "max-h-[78vh]"
            )}
          >
            <TileChromeContext.Provider value="card">
              <GridBlockRenderer
                block={block}
                item={{ i: blockId, x: 0, y: 0, w: 24, h: 12 }}
                document={props.document}
                dataSources={props.dataSources}
                dataframes={dataframes.value}
                blocks={blocks.value}
                yLayout={yLayout.value}
                isEditingDashboard={false}
                isEditingHeader={false}
                onFinishEditingHeader={() => {}}
                onStartEditingHeader={() => {}}
                userId={props.userId}
                executionQueue={props.executionQueue}
                aiTasks={props.aiTasks}
                isPublicMode={props.isPublicMode}
              />
            </TileChromeContext.Provider>
          </div>
          {hasChart(block) && (
            <div className="flex items-center justify-end gap-2 border-t border-border dark:border-border-tertiary px-6 py-4">
              {exportState === "failed" && (
                <span className="mr-auto text-sm text-red-500" role="status">
                  Could not make the image
                </span>
              )}
              <button
                type="button"
                disabled={exportState === "working"}
                onClick={onCopy}
                className="flex items-center gap-2 font-body rounded-xl border border-border-secondary dark:border-border-tertiary px-4 py-2 text-sm font-medium text-ink-200 transition-colors hover:bg-hover-bg dark:hover:bg-base-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportState === "copied" ? (
                  <PiCheck className="h-4 w-4" />
                ) : (
                  <PiCopy className="h-4 w-4" />
                )}
                {exportState === "copied" ? "Copied" : "Copy to Clipboard"}
              </button>
              <button
                type="button"
                disabled={exportState === "working"}
                onClick={onDownload}
                className="flex items-center gap-2 font-body rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PiDownloadSimple className="h-4 w-4" />
                Download
              </button>
            </div>
          )}
        </div>
      ) : null}
    </Transition>,
    document.body
  );
}
