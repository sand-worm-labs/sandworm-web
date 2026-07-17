import { PiExclamationMarkFill, PiQuestionFill } from "react-icons/pi";
import type * as Y from "yjs";
import type { ExecutionQueue, SQLBlock } from "@sandworm/editor";
import { useCallback } from "react";
import clsx from "clsx";
import { head } from "ramda";

import { useBlockExecutions } from "../../../hooks/useBlockExecution";
import { TooltipV2 } from "../../ToolTips";

// =====================================
// ⬢ Query Name Error Message
// =====================================
function queryNameErrorMessage(
  err: SQLBlock["dataframeName"]["error"]
): React.ReactNode {
  switch (err) {
    case "invalid-name":
      return (
        <>
          The dataframe name must be a valid Python variable name:
          <br />
          It should start with a letter or underscore, followed by letters,
          digits, or underscores. Spaces are not allowed.
        </>
      );
    case "unexpected":
      return (
        <>
          Unexpected error occurred while renaming the dataframe. Click this
          icon to retry.
        </>
      );
    default:
      return null;
  }
}

// =====================================
// ⬢ Types
// =====================================
interface Props {
  block: Y.XmlElement<SQLBlock>;
  disabled?: boolean;
  userId: string | null;
  environmentStartedAt: string | null;
  executionQueue: ExecutionQueue;
}

// =====================================
// ⬢ DataframeName Input Component
// =====================================
function DataframeNameInput(props: Props) {
  const executions = useBlockExecutions(
    props.executionQueue,
    props.block,
    "sql-rename-dataframe"
  );
  const execution = head(executions);
  const dataframeName = props.block.getAttribute("dataframeName");

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!dataframeName) {
        return;
      }

      props.block.setAttribute("dataframeName", {
        ...dataframeName,
        newValue: e.target.value,
      });
    },
    [props.block, dataframeName]
  );

  const onBlur = useCallback(() => {
    if (!dataframeName) {
      return;
    }

    executions.forEach(({ item }) => item.setAborting());

    props.executionQueue.enqueueBlock(
      props.block,
      props.userId,
      props.environmentStartedAt,
      {
        _tag: "sql-rename-dataframe",
      }
    );
  }, [
    props.block,
    dataframeName,
    props.executionQueue,
    props.userId,
    props.environmentStartedAt,
  ]);

  const onRetry = useCallback(() => {
    if (!dataframeName) {
      return;
    }

    props.block.setAttribute("dataframeName", {
      ...dataframeName,
      error: undefined,
    });
    executions.forEach(({ item }) => item.setAborting());

    props.executionQueue.enqueueBlock(
      props.block,
      props.userId,
      props.environmentStartedAt,
      {
        _tag: "sql-rename-dataframe",
      }
    );
  }, [
    dataframeName,
    props.block,
    props.executionQueue,
    props.environmentStartedAt,
    props.userId,
  ]);

  const status = execution?.item.getStatus() ?? { _tag: "idle" };

  if (!dataframeName) {
    return <div>Missing dataframe name in block</div>;
  }

  return (
    <div className="relative w-[6.8rem] shrink-0 h-auto group ml-[1rem] mr-[0.25rem]">
      <input
        type="text"
        className={clsx(
          dataframeName.error
            ? "bg-red-50 group-hover:bg-red-100"
            : "bg-hover-bg group-hover:bg-gray-100/50",
          "pl-2.5 pr-8 py-1.5 block w-full border border-transparent focus:border-primary text-ink-400 ring-0 focus:ring-0 placeholder:text-ink-400 text-[0.8rem] disabled:cursor-not-allowed h-full focus:!bg-white dark:focus:bg-base-100 font-body-mono font-normal rounded-lg"
        )}
        placeholder="DataFrame name"
        value={dataframeName.newValue}
        onChange={onChange}
        disabled={props.disabled || status._tag !== "idle"}
        onBlur={onBlur}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 group">
        {dataframeName.error ? (
          <>
            <button
              type="button"
              disabled={dataframeName.error !== "unexpected"}
              onClick={onRetry}
            >
              <PiExclamationMarkFill
                className="h-4 w-4 text-error"
                aria-hidden="true"
              />
            </button>

            <div className="scale-0 font-body  pointer-events-none absolute -top-2 left-1/2 -translate-y-full -translate-x-1/2 opacity-0 transition-opacity group-hover:scale-100 group-hover:opacity-100 bg-hunter-950 text-white text-xs p-2 rounded-md flex flex-col gap-y-1 w-72">
              <span className="inline-flex gap-x-1 items-center text-ink-400">
                <span>{queryNameErrorMessage(dataframeName.error)}</span>
              </span>
            </div>
          </>
        ) : (
          <TooltipV2<HTMLSpanElement>
            message="Use this variable name to reference the results as a Pandas DataFrame in further Python blocks."
            active
            className="w-44"
          >
            {ref => (
              <span ref={ref} className="inline-flex">
                <PiQuestionFill
                  className="h-4 w-4 text-ink-300"
                  aria-hidden="true"
                />
              </span>
            )}
          </TooltipV2>
        )}
      </div>
    </div>
  );
}

export default DataframeNameInput;
