import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type {
  PythonErrorRunQueryResult,
  RunQueryResult,
  SuccessRunQueryResult,
  SyntaxErrorRunQueryResult,
  TableSort,
} from "@sandworm/types";
import { migrateSuccessSQLResult } from "@sandworm/types";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { SparklesIcon } from "@heroicons/react/20/solid";
import { ChartPieIcon } from "@heroicons/react/24/solid";
import debounce from "lodash.debounce";
import { Transition } from "@headlessui/react";
import { PiFileCsvLight } from "react-icons/pi";

import { Tooltip, TooltipV2 } from "../../ToolTips";
import type { DashboardMode } from "../../Dashboard";
// eslint-disable-next-line import/no-cycle
import { dashboardModeHasControls } from "../../Dashboard/dashboard-types";
import LargeSpinner from "../../LargeSpinner";
import { useCSV } from "../../../hooks/useQueryCSV";
import Spin from "../../Spin";
import PageButtons from "../../PageButtons";

import Table from "./Table";

// =====================================
// ⬢ Utils
// =====================================
function formatMs(ms: number) {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  if (ms < 60000) {
    return `${(ms / 1000).toFixed(2)}s`;
  }

  return `${(ms / 60000).toFixed(2)}m`;
}

// =====================================
// ⬢ Types
// =====================================
interface SQLSuccessProps {
  blockId: string;
  documentId: string;
  workspaceId: string;
  page: number;
  dashboardPage: number;
  loadingPage: boolean;
  result: SuccessRunQueryResult;
  onChangePage: (page: number) => void;
  isPublic: boolean;
  dataframeName: string;
  isResultHidden: boolean;
  toggleResultHidden: () => void;
  dashboardMode: DashboardMode | null;
  sort: TableSort | null;
  isAddVisualizationDisabled: boolean;
  onAddVisualization: () => void;
  onChangeSort: (sort: TableSort | null) => void;
  dashboardPageSize: number;
  onChangeDashboardPageSize: (size: number) => void;
  hasTitle: boolean;
}

// =====================================
// ⬢ SQL Sucess
// =====================================
function SQLSuccess(props: SQLSuccessProps) {
  const result = useMemo(
    () => migrateSuccessSQLResult(props.result),
    [props.result]
  );

  const page =
    props.dashboardMode && !dashboardModeHasControls(props.dashboardMode)
      ? props.dashboardPage
      : props.page;
  const pageCount =
    props.dashboardMode && !dashboardModeHasControls(props.dashboardMode)
      ? result.dashboardPageCount
      : result.pageCount;

  const prevPage = useCallback(() => {
    props.onChangePage(Math.max(0, page - 1));
  }, [props.onChangePage, page]);

  const nextPage = useCallback(() => {
    props.onChangePage(Math.min(page + 1, pageCount - 1));
  }, [props.onChangePage, page, pageCount]);

  const setPage = useCallback(
    (newPage: number) => {
      props.onChangePage(Math.max(0, Math.min(newPage, pageCount - 1)));
    },
    [props.onChangePage, pageCount]
  );

  const [csvRes, getCSV] = useCSV(props.workspaceId, props.documentId);
  const onDownloadCSV = useCallback(() => {
    getCSV(props.blockId, props.dataframeName);
  }, [getCSV, props.blockId, props.dataframeName]);

  useEffect(() => {
    if (csvRes.loading) {
      return;
    }

    if (csvRes.data) {
      const url = URL.createObjectURL(csvRes.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${props.dataframeName}.csv`;
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.remove();
      }, 1000);
    }

    if (csvRes.error) {
      alert("Something went wrong");
    }
  }, [csvRes, props.dataframeName]);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !props.dashboardMode ||
      dashboardModeHasControls(props.dashboardMode) ||
      !containerRef.current
    ) {
      return () => {};
    }

    const tableHeaderSize = 40;
    const footerSize = 40;
    const tableRowSize = 29;

    const container = containerRef.current;
    const cb = debounce(() => {
      const height = container.clientHeight;
      const maxPageSize = Math.floor(
        (height - tableHeaderSize - footerSize) / tableRowSize
      );

      if (
        maxPageSize !== result.dashboardPageSize &&
        maxPageSize !== props.dashboardPageSize
      ) {
        props.onChangeDashboardPageSize(maxPageSize);
      }
    }, 500);

    cb();

    const observer = new ResizeObserver(cb);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [
    props.dashboardMode,
    containerRef,
    result.dashboardPageSize,
    props.dashboardPageSize,
    props.onChangeDashboardPageSize,
  ]);

  let tableTopBorder: "rounded" | "square" | null = null;
  if (props.dashboardMode) {
    if (
      props.dashboardMode._tag === "live" ||
      (props.dashboardMode._tag === "editing" &&
        props.dashboardMode.position === "dashboard")
    ) {
      tableTopBorder = props.hasTitle ? "square" : null;
    } else if (props.dashboardMode.position === "sidebar") {
      tableTopBorder = "rounded";
    }
  }

  const hasHorizontalBorder =
    props.dashboardMode?._tag === "editing" &&
    props.dashboardMode.position === "sidebar";

  return (
    <div
      className={clsx(
        "relative w-full h-full flex flex-col justify-between",
        hasHorizontalBorder && "border-x border-border-secondary rounded-md"
      )}
      ref={containerRef}
    >
      {props.loadingPage && (
        <div className="absolute top-0 left-0 bottom-8 right-0 bg-white opacity-50 z-10 flex items-center justify-center">
          <LargeSpinner color="#deff80" />
        </div>
      )}

      <Transition
        as="div"
        show={!props.isResultHidden || props.dashboardMode !== null}
        enter="transition-all ease-in duration-300"
        enterFrom="max-h-0 overflow-hidden"
        enterTo="max-h-[300px] overflow-hidden"
        leave="transition-all ease-out duration-300"
        leaveFrom="max-h-[300px] overflow-hidden"
        leaveTo="max-h-0 overflow-hidden"
      >
        <div
          className={clsx(
            "max-w-full ph-no-capture bg-white font-body ",
            tableTopBorder === "rounded" && "rounded-md",
            (!props.dashboardMode ||
              dashboardModeHasControls(props.dashboardMode)) &&
              "border-b"
          )}
        >
          <Table
            rows={
              (props.dashboardMode &&
              !dashboardModeHasControls(props.dashboardMode)
                ? result.dashboardRows.slice(
                    0,
                    Math.max(props.dashboardPageSize, 1)
                  )
                : result.rows.slice(0, 50)) ?? []
            }
            columns={props.result.columns}
            isDashboard={
              props.dashboardMode !== null &&
              !dashboardModeHasControls(props.dashboardMode)
            }
            sort={props.sort}
            onChangeSort={props.onChangeSort}
            topBorder={tableTopBorder}
          />
        </div>
      </Transition>

      <div
        className={clsx(
          "flex w-full items-center justify-between border-border-secondary px-3 h-10 bg-gray-50 text-xs rounded-b-md text-ink-400",
          ((props.dashboardMode &&
            (props.dashboardMode._tag === "live" ||
              props.dashboardMode.position !== "expanded")) ||
            props.isResultHidden) &&
            "border-t"
        )}
      >
        <div className="flex-1">
          {result.count} {result.count === 1 ? "row" : "rows"}
          {typeof result.queryDurationMs === "number" &&
            ` · ${formatMs(result.queryDurationMs)}`}
          {props.isResultHidden && (
            <button
              type="button"
              className="text-gray-300 pl-3 hover:text-ink-400 cursor-pointer"
              onClick={props.toggleResultHidden}
            >
              collapsed
            </button>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          {props.isResultHidden && !props.dashboardMode ? null : (
            <PageButtons
              currentPage={page}
              totalPages={pageCount}
              prevPage={prevPage}
              nextPage={nextPage}
              setPage={setPage}
              loading={props.loadingPage}
              isPublic={props.isPublic}
            />
          )}
        </div>
        <div
          className={clsx(
            "flex-1 print:hidden group/csv-btn relative flex justify-end h-full py-2 gap-x-1.5",
            props.isPublic ? "hidden" : "block"
          )}
        >
          {!props.dashboardMode && !props.isAddVisualizationDisabled && (
            <Tooltip
              title="Visualize results"
              message="Create a new tab with a visualization of this data."
              className="flex h-full items-center"
              tooltipClassname="w-40"
              active
            >
              <button
                type="button"
                className={clsx(
                  " bg-white hover:bg-gray-100 border border-border-tertiary py-0.5 px-2 rounded-full text-ink-400  flex items-center gap-x-1 disabled:bg-gray-200 disabled:border-0 disabled:cursor-not-allowed h-full"
                )}
                disabled={props.isAddVisualizationDisabled}
                onClick={props.onAddVisualization}
              >
                <ChartPieIcon className="w-3 h-3 shrink-0" />
                <span>Visualize</span>
              </button>
            </Tooltip>
          )}

          <TooltipV2<HTMLButtonElement>
            title="Download as CSV"
            active={
              !props.dashboardMode ||
              (props.dashboardMode._tag === "editing" &&
                props.dashboardMode.position === "expanded")
            }
          >
            {ref => (
              <button
                type="button"
                ref={ref}
                disabled={csvRes.loading}
                className={clsx(
                  csvRes.loading
                    ? "bg-gray-100"
                    : "bg-white hover:bg-gray-100 border border-border-tertiary",
                  "py-0.5 px-2 rounded-full text-ink-400  flex items-center gap-x-1 h-full aspect-square"
                )}
                onClick={onDownloadCSV}
              >
                {csvRes.loading ? (
                  <Spin />
                ) : (
                  <>
                    <PiFileCsvLight className="w-3.5 h-3.5 shrink-0" />
                    <span>CSV</span>
                  </>
                )}
              </button>
            )}
          </TooltipV2>
        </div>
      </div>
    </div>
  );
}

// =====================================
// ⬢ SQL Aborted
// =====================================
function SQLAborted(props: {
  dashboardMode: DashboardMode | null;
  toggleResultHidden: () => void;
  isResultHidden: boolean;
}) {
  return (
    <div className="text-xs">
      {!props.dashboardMode && (
        <div className="p-3 text-xs text-gray-300 flex items-center justify-end">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[12px] text-red-700 ring-1 ring-inset ring-red-600/10 hover:bg-red-100"
            onClick={props.toggleResultHidden}
          >
            contains errors
          </button>
        </div>
      )}
      <Transition
        as="div"
        show={!props.isResultHidden || props.dashboardMode !== null}
        enter="transition-all ease-in duration-300"
        enterFrom="max-h-0 overflow-hidden"
        enterTo="max-h-[70px] overflow-hidden"
        leave="transition-all ease-out duration-300"
        leaveFrom="max-h-[70px] overflow-hidden"
        leaveTo="max-h-0 overflow-hidden"
      >
        <div className="px-3.5 pb-4 pt-0.5">
          <div className="flex border border-red-300 p-2 gap-x-3 items-center">
            <ExclamationTriangleIcon className="text-red-500 h-6 w-6" />
            <div>
              <h4 className="font-semibold">Query aborted.</h4>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

// =====================================
// ⬢ SQL Syntax Error
// =====================================
function SQLSyntaxError(props: {
  result: SyntaxErrorRunQueryResult;
  isFixingWithAI: boolean;
  onFixWithAI?: () => void;
  canFixWithAI: boolean;
  dashboardMode: DashboardMode | null;
  isResultHidden: boolean;
  toggleResultHidden: () => void;
}) {
  return (
    <div className="text-xs">
      {!props.dashboardMode && (
        <div className="p-3 text-xs text-gray-300 flex items-center justify-end">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[12px] text-red-700 ring-1 ring-inset ring-red-600/10 hover:bg-red-100"
            onClick={props.toggleResultHidden}
          >
            contains errors
          </button>
        </div>
      )}

      <Transition
        as="div"
        show={!props.isResultHidden || props.dashboardMode !== null}
        enter="transition-all ease-in duration-300"
        enterFrom="max-h-0 overflow-hidden"
        enterTo="max-h-[300px] overflow-hidden"
        leave="transition-all ease-out duration-300"
        leaveFrom="max-h-[300px] overflow-hidden"
        leaveTo="max-h-0 overflow-hidden"
      >
        <div className="px-3.5 pb-4 pt-0.5">
          <div className="flex border border-red-300 p-4 gap-x-3 word-wrap">
            <div className="w-full">
              <span className="flex items-center gap-x-2 pb-2">
                <ExclamationTriangleIcon className="text-red-500 h-6 w-6" />
                <h4 className="font-semibold mb-2">
                  Your query could not be executed
                </h4>
              </span>
              <p>We received the following error:</p>
              <pre className="whitespace-pre-wrap ph-no-capture overflow-hidden">
                {props.result.message}
              </pre>
              {props.onFixWithAI && (
                <Tooltip
                  title="Missing OpenAI API key"
                  message="Admins can add an OpenAI key in settings."
                  className="inline-block"
                  tooltipClassname="w-40 text-center"
                  position="top"
                  active={!props.canFixWithAI}
                >
                  <button
                    type="button"
                    disabled={!props.canFixWithAI}
                    onClick={props.onFixWithAI}
                    className="mt-4 flex items-center border rounded-sm px-2 py-1 gap-x-2  border-border-secondary hover:bg-gray-50 hover:text-gray-700 disabled:bg-gray-200 disabled:border-0 disabled:cursor-not-allowed"
                  >
                    {props.isFixingWithAI ? (
                      <>
                        <Spin />
                        Fixing - click to cancel
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-3 h-3" />
                        Fix with AI
                      </>
                    )}
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

// =====================================
// ⬢ SQL Python Error
// =====================================
function SQLPythonError(props: {
  result: PythonErrorRunQueryResult;
  dashboardMode: DashboardMode | null;
  isResultHidden: boolean;
  toggleResultHidden: () => void;
}) {
  return (
    <div className="text-xs">
      {!props.dashboardMode && (
        <div className="p-3 text-xs text-gray-300 flex items-center justify-end">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-[12px] text-red-700 ring-1 ring-inset ring-red-600/10"
            onClick={props.toggleResultHidden}
          >
            contains errors
          </button>
        </div>
      )}

      <Transition
        as="div"
        show={!props.isResultHidden || props.dashboardMode !== null}
        enter="transition-all ease-in duration-300"
        enterFrom="max-h-0 overflow-hidden"
        enterTo="max-h-[100px] overflow-hidden"
        leave="transition-all ease-out duration-300"
        leaveFrom="max-h-[100px] overflow-hidden"
        leaveTo="max-h-0 overflow-hidden"
      >
        <div className="px-3.5 pb-4 pt-0.5">
          <div className="flex border border-red-300 p-4 gap-x-3 text-xs overflow-hidden word-wrap">
            <div className="w-full">
              <span className="flex items-center gap-x-2 pb-2">
                <ExclamationTriangleIcon className="text-red-500 h-6 w-6" />
                <h4 className="font-semibold">
                  Your code could not be executed
                </h4>
              </span>
              <p>We received the following error:</p>
              <pre className="whitespace-pre-wrap ph-no-capture">
                {props.result.ename} - {props.result.evalue}
              </pre>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

// =====================================
// ⬢ SQL Result Main Component
// =====================================
interface Props {
  blockId: string;
  documentId: string;
  workspaceId: string;
  result: RunQueryResult;
  page: number;
  dashboardPage: number;
  loadingPage: boolean;
  dataframeName: string;
  isPublic: boolean;
  isResultHidden: boolean;
  toggleResultHidden: () => void;
  isFixingWithAI: boolean;
  onFixWithAI: () => void;
  dashboardMode: DashboardMode | null;
  canFixWithAI: boolean;
  sort: TableSort | null;
  isAddVisualizationDisabled: boolean;
  onAddVisualization: () => void;
  onChangeSort: (sort: TableSort | null) => void;
  onChangePage: (page: number) => void;
  dashboardPageSize: number;
  onChangeDashboardPageSize: (size: number) => void;
  hasTitle: boolean;
}
function SQLResult(props: Props) {
  switch (props.result.type) {
    case "success":
      return (
        <SQLSuccess
          result={props.result}
          page={props.page}
          dashboardPage={props.dashboardPage}
          isPublic={props.isPublic}
          documentId={props.documentId}
          workspaceId={props.workspaceId}
          dataframeName={props.dataframeName}
          isResultHidden={props.isResultHidden}
          toggleResultHidden={props.toggleResultHidden}
          blockId={props.blockId}
          dashboardMode={props.dashboardMode}
          sort={props.sort}
          onChangeSort={props.onChangeSort}
          loadingPage={props.loadingPage}
          onChangePage={props.onChangePage}
          isAddVisualizationDisabled={props.isAddVisualizationDisabled}
          onAddVisualization={props.onAddVisualization}
          dashboardPageSize={props.dashboardPageSize}
          onChangeDashboardPageSize={props.onChangeDashboardPageSize}
          hasTitle={props.hasTitle}
        />
      );
    case "abort-error":
      return (
        <SQLAborted
          dashboardMode={props.dashboardMode}
          toggleResultHidden={props.toggleResultHidden}
          isResultHidden={props.isResultHidden}
        />
      );
    case "syntax-error":
      return (
        <SQLSyntaxError
          result={props.result}
          isFixingWithAI={props.isFixingWithAI}
          onFixWithAI={props.onFixWithAI}
          canFixWithAI={props.canFixWithAI}
          dashboardMode={props.dashboardMode}
          isResultHidden={props.isResultHidden}
          toggleResultHidden={props.toggleResultHidden}
        />
      );
    case "python-error":
      return (
        <SQLPythonError
          result={props.result}
          dashboardMode={props.dashboardMode}
          isResultHidden={props.isResultHidden}
          toggleResultHidden={props.toggleResultHidden}
        />
      );
    default:
      return null;
  }
}

export default SQLResult;
