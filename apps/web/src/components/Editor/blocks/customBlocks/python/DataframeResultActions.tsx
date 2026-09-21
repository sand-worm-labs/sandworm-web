import clsx from "clsx";
import { useCallback } from "react";
import { PiFileCsvLight, PiCode } from "react-icons/pi";

import { downloadFile } from "@/utils/file";

import { TooltipV2 } from "../../ToolTips";
import Spin from "../../Spin";
import { useCSV } from "../../../hooks/useQueryCSV";

interface Props {
  workspaceId: string;
  documentId: string;
  blockId: string;
  title: string;
  // Omitted when the viewer can't edit the notebook.
  onUseInNewBlock?: () => void;
}

const pillClassName =
  "flex items-center h-6 border rounded-full border-hover-border px-2 gap-x-1 text-ink-300 dark:text-ink-400 group relative font-body";
const enabledClassName =
  "cursor-pointer hover:bg-hover-bg hover:text-gray-700 hover:border-primary bg-base-200 dark:bg-header-surface";
const iconClassName =
  "w-[11.5px] h-[11.5px] shrink-0 text-ink-300 dark:text-ink-400";

function toFileName(title: string) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug || "python_result";
}

// The CSV is served by the same endpoint as SQL results — the API writes the
// displayed dataframe to `.sandworm/query-<blockId>.csv` after every run.
export function DataframeResultActions(props: Props) {
  const [csvRes, getCSV] = useCSV(props.workspaceId, props.documentId);

  const onDownloadCSV = useCallback(async () => {
    const name = toFileName(props.title);
    try {
      const blob = await getCSV(props.blockId, name);
      const url = URL.createObjectURL(blob);
      downloadFile(url, `${name}.csv`);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      alert("Something went wrong");
    }
  }, [getCSV, props.blockId, props.title]);

  return (
    <div className="flex items-center gap-x-1.5 print:hidden">
      {props.onUseInNewBlock && (
        <TooltipV2<HTMLButtonElement>
          title="Use in new block"
          message="Add a Python block below that loads this result as a dataframe."
          active
        >
          {ref => (
            <button
              type="button"
              ref={ref}
              className={clsx(pillClassName, enabledClassName)}
              onClick={props.onUseInNewBlock}
            >
              <PiCode className={iconClassName} />
              <span>Use</span>
            </button>
          )}
        </TooltipV2>
      )}

      <TooltipV2<HTMLButtonElement> title="Download as CSV" active>
        {ref => (
          <button
            type="button"
            ref={ref}
            disabled={csvRes.loading}
            className={clsx(
              pillClassName,
              csvRes.loading
                ? "cursor-not-allowed bg-gray-200 dark:bg-base-100"
                : enabledClassName
            )}
            onClick={onDownloadCSV}
          >
            {csvRes.loading ? (
              <Spin />
            ) : (
              <>
                <PiFileCsvLight className={iconClassName} />
                <span>CSV</span>
              </>
            )}
          </button>
        )}
      </TooltipV2>
    </div>
  );
}
