import type * as Y from "yjs";
import React, { useCallback } from "react";
import { PiStop, PiCircleNotch, PiPlayFill } from "react-icons/pi";
import type { ExecutionQueue } from "@sandworm/editor";
import { isExecutionStatusLoading } from "@sandworm/editor";
import clsx from "clsx";

import useEditorAwareness from "../hooks/useEditorAwareness";
import useRunAll from "../hooks/useRunAll";
import usePreviousEffect from "../hooks/usePreviousEffect";

// =====================================
// ⬢ Types
// =====================================

interface Props {
  disabled: boolean;
  yDoc: Y.Doc;
  executionQueue: ExecutionQueue;
  userId: string;
}

// =====================================
// ⬢ RunAllV2
// =====================================
export default function RunAllV2(props: Props) {
  const [{ total, remaining, status, failedBlockId }, { run, abort }] =
    useRunAll(props.yDoc, props.executionQueue, props.userId);

  const onClick = useCallback(() => {
    if (status !== "idle") {
      abort();
    } else {
      run();
    }
  }, [status, run, abort]);

  const current = total - remaining;
  const loading = isExecutionStatusLoading(status);
  const isAborting = status === "aborting";

  const [, editorAPI] = useEditorAwareness();
  usePreviousEffect(
    prevStatus => {
      if (status !== "idle") return;
      if (prevStatus === "running" && failedBlockId) {
        editorAPI.focus(failedBlockId, { scrollIntoView: true });
      }
    },
    status,
    [status, failedBlockId, editorAPI]
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={props.disabled || isAborting}
      className={clsx(
        "absolute top-3 right-8 z-10",
        "flex items-center gap-1.5 px-4 py-1.5",
        "rounded-lg text-sm font-medium font-body",
        "transition-all duration-150 shadow-[0px_7.5px_8px_0px_rgba(132,151,195,0.04)]",
        {
          "bg-[#F1F3F4] dark:bg-[#2A2A28] text-ink-300 dark:text-ink-600 cursor-not-allowed":
            props.disabled || isAborting,

          "bg-[#FEFEFF] dark:bg-[#1C1C1A] text-ink-100 dark:text-ink-200 border border-[#DEE2E6] dark:border-[#3A3A38] hover:bg-[#F1F3F4] dark:hover:bg-[#2A2A28]":
            !props.disabled && !loading && !isAborting,

          "bg-[#FEE2E2] dark:bg-[#2A0A0A] text-[#DC2626] dark:text-[#F87171] hover:bg-[#FECACA] dark:hover:bg-[#3A0F0F] border border-[#FECACA] dark:border-[#7F1D1D]":
            !props.disabled && loading && !isAborting,
        }
      )}
    >
      {isAborting ? (
        <>
          <PiCircleNotch size={14} className="animate-spin" />
          Stopping
        </>
      ) : loading ? (
        <>
          <PiStop size={14} />
          {`Stop (${current}/${total})`}
        </>
      ) : (
        <>
          <PiPlayFill size={14} />
          Run All
        </>
      )}
    </button>
  );
}
