import type * as Y from "yjs";
import React, { useCallback } from "react";
import { PlayIcon, StopIcon } from "@heroicons/react/20/solid";
import type { ExecutionQueue } from "@sandworm/editor";
import { isExecutionStatusLoading } from "@sandworm/editor";
import clsx from "clsx";

import useEditorAwareness from "../hooks/useEditorAwareness";
import useRunAll from "../hooks/useRunAll";
import usePreviousEffect from "../hooks/usePreviousEffect";

interface Props {
  disabled: boolean;
  yDoc: Y.Doc;
  executionQueue: ExecutionQueue;
  primary: boolean;
  userId: string;
}
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

  const [, editorAPI] = useEditorAwareness();
  usePreviousEffect(
    prevStatus => {
      if (status !== "idle") {
        return;
      }

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
      className={clsx(
        {
          "bg-gray-200 cursor-not-allowed":
            props.disabled || status === "aborting",
          "bg-[#0F0F0F] hover:bg-primary-300":
            !props.disabled && !loading && props.primary,
          "bg-[#0F0F0F] ring-gray-200 text-white":
            !props.disabled && !loading && !props.primary,
          "bg-red-200 hover:bg-red-300":
            !props.disabled && loading && status !== "aborting",
        },
        "flex items-center rounded-2xl px-5 py-1.5 text-sm gap-x-1.5 absolute top-3 right-8 z-10 font-body  text-white"
      )}
      onClick={onClick}
      disabled={props.disabled}
    >
      {loading ? (
        <>
          <StopIcon className="h-4 w-4" />
          {status === "aborting" ? "Stopping" : `Running (${current}/${total})`}
        </>
      ) : (
        <>
          <PlayIcon className="h-4 w-4" /> Run all
        </>
      )}
    </button>
  );
}
