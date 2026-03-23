import type * as Y from "yjs";
import { useDropzone } from "react-dropzone";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDoubleRightIcon,
  DocumentPlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import type { SandwormFile } from "@sandworm/types";
import Link from "next/link";
import clsx from "clsx";
import type { ExecutionQueue } from "@sandworm/editor";
import {
  BlockType,
  addBlockGroup,
  getBlocks,
  getLayout,
} from "@sandworm/editor";
import { CloudArrowUpIcon as CloudArrowUpIconSolid } from "@heroicons/react/20/solid";

import { Cautious } from "@/components/Assets/Cautious";
import { UploadIcon } from "@/components/Assets/UploadIcon";
import { Trash } from "@/components/Assets/Trash";
import { Info } from "@/components/Assets/Info";

import type { UploadResult, UploadFile } from "../hooks/useFiles";
import { NEXT_PUBLIC_API_URL } from "../utils/env";
import { useEnvironmentStatus } from "../hooks/useEnvironmentStatus";
import { useFiles } from "../hooks/useFiles";

import { Tooltip } from "./ToolTips";
import Spin from "./Spin";

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["bytes", "kb", "mb", "gb", "tb", "pb", "eb", "zb", "yb"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  const sizeLabel = sizes[i];
  if (!sizeLabel) {
    return `${bytes} bytes`;
  }
  return parseFloat((bytes / k ** i).toFixed(dm)) + sizeLabel;
}

function DragOverlay({ isDragActive }: { isDragActive: boolean }) {
  return (
    <div
      className={clsx(
        isDragActive ? "visible" : "hidden",
        "absolute top-0 left-0 w-full h-full flex items-center justify-center"
      )}
    >
      <div className="absolute top-0 left-0 h-full w-full bg-[#FBFBFB] dark:bg-[#0C1015] opacity-70" />
      <div className="flex flex-col items-center justify-center gap-y-2 rounded-md bg-gray-50 dark:bg-base-100 p-4 relative border-2 border-dashed border-gray-300 dark:border-border-tertiary">
        <DocumentPlusIcon className="w-10 h-10 text-ink-400" />
        <span className="text-center text-ink-400 font-semibold text-xs">
          Drop files here to upload
        </span>
      </div>
    </div>
  );
}

function UploadPlaceholder({
  compact = false,
  onClick,
}: {
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "w-full text-left font-body focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A308F0] rounded-xl",
        compact ? "p-2" : "p-4"
      )}
    >
      <div
        className={clsx(
          "bg-[#FBFBFB] rounded-2xl border-2 border-dashed border-[#E9ECEF] dark:text-ink-400 text-ink-300 dark:bg-base-100  dark:border-border-tertiary",
          compact
            ? "flex items-center justify-between px-2 py-2 text-sm  "
            : "flex flex-col items-center justify-center h-full p-8 text-center"
        )}
      >
        <div
          className={clsx(
            compact ? "flex items-center gap-x-2" : "flex flex-col items-center"
          )}
        >
          <UploadIcon className={compact ? "w-4 h-4" : ""} />
          <span className={compact ? "whitespace-nowrap" : "mt-2"}>
            Click or drag and drop files here
          </span>
        </div>
      </div>
    </button>
  );
}

interface UploadResultItemProps {
  result: UploadResult;
  onRemove: (file: File) => void;
}
function UploadResultItem(props: UploadResultItemProps) {
  const message: string = useMemo(() => {
    switch (props.result.outcome) {
      case "aborted":
        return "Upload aborted";
      case "file-exists":
        return "File already exists";
      case "unexpected":
        return "An unexpected error occurred";
      case "success":
        return "Upload successful";
      default:
        return "";
    }
  }, [props.result.outcome]);

  const onRemove = useCallback(() => {
    props.onRemove(props.result.file);
  }, [props.onRemove, props.result.file]);

  return (
    <div className="px-4 py-2 font-body ">
      <div>
        <div className="flex justify-between pb-1">
          <div
            className="font-medium pr-2 text-sm break-all"
            title={props.result.file.name}
          >
            {props.result.file.name}
          </div>
          <div>
            <button
              type="button"
              className="text-ink-400 disabled:cursor-not-allowed text-xs hover:text-ink-400"
              onClick={onRemove}
            >
              ok
            </button>
          </div>
        </div>
        <div className="font-medium text-ink-400 text-xs">{message}</div>
      </div>
    </div>
  );
}

interface FileItemProps {
  workspaceId: string;
  file: SandwormFile;
  onUseInPython: (file: SandwormFile) => void;
  onUseInSQL: (file: SandwormFile) => void;
  onDelete: (file: SandwormFile) => void;
  isDeleting: boolean;
  canUse: boolean;
}
function FileItem(props: FileItemProps) {
  const onUseInPython = useCallback(() => {
    props.onUseInPython(props.file);
  }, [props.onUseInPython, props.file]);

  const onUseInSQL = useCallback(() => {
    props.onUseInSQL(props.file);
  }, [props.onUseInSQL, props.file]);

  const onRemove = useCallback(() => {
    props.onDelete(props.file);
  }, [props.onDelete, props.file]);

  return (
    <div className="px-4 py-3 font-body  border border-[#E9ECEF] rounded-xl my-2  dark:bg-base-100 dark:border-border-tertiary">
      <div>
        <div className="flex justify-between pb-0.5">
          <div
            className="font-medium pr-2 text-sm break-all"
            title={props.file.name}
          >
            {props.file.name}
          </div>
          <div>
            <button
              type="button"
              className="text-ink-400 dark:text-ink-100 hover:text-red-500 disabled:cursor-not-allowed"
              onClick={onRemove}
              disabled={props.isDeleting}
            >
              {props.isDeleting ? <Spin /> : <Trash className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-x-2 font-medium text-[#6C757D] dark:text-ink-400 text-xs">
          {formatBytes(props.file.size)}
          <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
            <circle cx={1} cy={1} r={1} />
          </svg>
          {props.file.mimeType ?? "unknown"}
        </div>
      </div>
      <div className="flex pt-3 text-[0.7rem] font-medium space-x-2.5">
        <Tooltip
          position="manual"
          title=""
          message="You must be editing a notebook to use this file."
          active={!props.canUse}
          tooltipClassname="-top-1 w-44 -translate-y-full"
        >
          <button
            type="button"
            className="text-ink-400 hover:text-ink-400 disabled:hover:text-ink-400  disabled:cursor-not-allowed bg-[#F7E8FF] dark:text-ink-100 dark:bg-[#2a1a3a]
 rounded-md px-1.5 py-0.5"
            onClick={onUseInPython}
            disabled={props.isDeleting || !props.canUse}
          >
            Use in Python
          </button>
        </Tooltip>
        <Tooltip
          title=""
          message="You must be editing a notebook to use this file."
          active={!props.canUse}
          tooltipClassname="w-44"
        >
          <button
            type="button"
            className="text-ink-400 hover:text-ink-400 disabled:hover:text-ink-400  disabled:cursor-not-allowed  bg-[#F7E8FF] dark:text-ink-100 dark:bg-[#2a1a3a] rounded-md px-1.5 py-0.5"
            onClick={onUseInSQL}
            disabled={props.isDeleting || !props.canUse}
          >
            Query in SQL
          </button>
        </Tooltip>
        <div
          className={clsx(
            "text-ink-400  bg-[#F7E8FF] dark:text-ink-100 dark:bg-[#2a1a3a] rounded-md px-1.5 py-0.5",
            props.isDeleting ? "cursor-not-allowed" : "hover:text-ink-400"
          )}
        >
          {props.isDeleting ? (
            "Download"
          ) : (
            <Link
              href={`${NEXT_PUBLIC_API_URL()}/workspaces/${
                props.workspaceId
              }/files/file?path=${encodeURIComponent(props.file.relCwdPath)}`}
              target="_blank"
            >
              Download
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface UploadingItemProps {
  upload: UploadFile;
  onAbort: (f: File) => void;
}
function UploadingItem(props: UploadingItemProps) {
  const onAbort = useCallback(() => {
    props.onAbort(props.upload.file);
  }, [props.onAbort, props.upload.file]);

  return (
    <div className="px-4 py-3 font-body ">
      <div>
        <div className="flex items-center justify-between pb-1">
          <div
            className="font-medium pr-2 text-sm break-all"
            title={props.upload.file.name}
          >
            {props.upload.file.name}
          </div>
          <button
            type="button"
            className="text-ink-400  hover:text-red-500 disabled:cursor-not-allowed text-xs"
            onClick={onAbort}
            disabled={props.upload.status !== "uploading"}
          >
            abort
          </button>
        </div>
        <div className="flex items-center gap-x-2 font-medium text-ink-400 text-xs">
          {formatBytes(props.upload.uploaded)} /{" "}
          {formatBytes(props.upload.file.size)}
        </div>
      </div>
    </div>
  );
}

interface WaitingItemProps {
  file: File;
  onAbort: (f: File) => void;
}
function WaitingItem(props: WaitingItemProps) {
  const onAbort = useCallback(() => {
    props.onAbort(props.file);
  }, [props.onAbort, props.file]);

  return (
    <div className="px-4 py-3 font-body ">
      <div>
        <div className="flex items-center justify-between pb-1">
          <div className="font-medium pr-2 text-sm break-all">
            {props.file.name}
          </div>
          <button
            type="button"
            className="text-ink-400 hover:text-red-500 disabled:cursor-not-allowed text-xs"
            onClick={onAbort}
          >
            abort
          </button>
        </div>
        <div className="flex items-center gap-x-2 font-medium text-ink-400 text-xs">
          {formatBytes(0)} / {formatBytes(props.file.size)}
        </div>
      </div>
    </div>
  );
}

interface ReplaceDialogProps {
  fileName: string;
  open: boolean;
  onReplaceYes: () => void;
  onReplaceAll: () => void;
  onReplaceNo: () => void;
}

function ReplaceDialog(props: ReplaceDialogProps) {
  const [fileName, setFileName] = useState(props.fileName);
  useEffect(() => {
    if (props.fileName !== "" && props.fileName !== fileName) {
      setFileName(props.fileName);
    }
  }, [props.fileName, fileName]);

  return (
    <Transition show={props.open}>
      <Dialog onClose={props.onReplaceNo} className="relative z-[100]">
        <Transition.Child
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0 font-body "
        >
          <div className="fixed inset-0 bg-[#0000001A] transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white dark:bg-base-100 px-4 pb-4 pt-5 text-left  transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 border-[#E9ECEF] font-body font-medium">
                <div>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full ">
                    <Cautious />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <div className="mt-2">
                      <p className="text-sm text-ink-100">
                        File{" "}
                        <span className=" text-[#ff0000] px-1">{fileName}</span>{" "}
                        already exists. Do you want to replace it?
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
                  <button
                    type="button"
                    onClick={props.onReplaceYes}
                    className="mt-3 inline-flex w-full justify-center rounded-[10px] bg-[#A308F0] px-3 py-1.5 text-sm text-white   hover:bg-[#A308F0] sm:col-start-1 sm:mt-0 font-body "
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={props.onReplaceAll}
                    className="mt-3 inline-flex w-full justify-center rounded-[10px] bg-[#F8F9FA] px-3 py-1.5 text-sm text-ink-100 shadow-sm ring-1 ring-inset ring-[#DEE2E6] hover:bg-gray-50 sm:col-start-2 sm:mt-0 font-body  dark:text-black "
                  >
                    Yes to all
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={props.onReplaceNo}
                    className="mt-3 inline-flex w-full justify-center rounded-[10px] bg-[#F8F9FA] px-3 py-1.5 text-sm text-ink-100 shadow-sm ring-1 ring-inset ring-[#DEE2E6] hover:bg-gray-50 sm:col-start-3 sm:mt-0 font-body  dark:text-black"
                  >
                    No
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

interface Props {
  workspaceId: string;
  visible: boolean;
  onHide: () => void;
  userId: string | null;
  yDoc?: Y.Doc;
  executionQueue?: ExecutionQueue;
}
export default function Files(props: Props) {
  const { startedAt: environmentStartedAt } = useEnvironmentStatus(
    props.workspaceId
  );

  const [search, setSearch] = useState("");

  const onUseInPython = useCallback(
    (file: SandwormFile) => {
      if (!props.yDoc || !props.executionQueue) {
        return;
      }
      const mimeTypeMap: Record<string, string> = {
        "application/json": "json",
        "text/csv": "csv",
        "application/vnd.ms-excel": "xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "xlsx",
      };

      const fileExtension = file.mimeType
        ? mimeTypeMap[file.mimeType] || ""
        : "";

      const source =
        fileExtension !== ""
          ? `import pandas as pd
df = pd.read_${fileExtension}('${file.relCwdPath}')
df`
          : `file = open('${file.relCwdPath}').read()
file`;

      const layout = getLayout(props.yDoc);
      const blocks = getBlocks(props.yDoc);
      const blockId = addBlockGroup(
        layout,
        blocks,
        {
          type: BlockType.Python,
          source,
        },
        layout.length
      );

      const pythonBlock = blocks.get(blockId);
      if (!pythonBlock) {
        return;
      }

      props.executionQueue.enqueueBlock(
        pythonBlock,
        props.userId,
        environmentStartedAt,
        {
          _tag: "python",
          isSuggestion: false,
        }
      );
    },
    [props.yDoc, props.executionQueue, props.userId, environmentStartedAt]
  );

  const onUseInSQL = useCallback(
    (file: SandwormFile) => {
      if (!props.yDoc || !props.executionQueue) {
        return;
      }

      const table = file.relCwdPath
        // replace `\` with `\\`
        .replace(/\\/g, "\\\\")
        // replace `'` with `''`
        .replace(/'/g, "''")
        // replace `"` with `\"`
        .replace(/"/g, '\\"');

      const extension = file.name.split(".").pop();
      let source = `SELECT * FROM '${table}' LIMIT 1000000`;
      if (extension === "xlsx") {
        source = `SELECT * FROM st_read('${table}') LIMIT 1000000`;
      }

      const layout = getLayout(props.yDoc);
      const blocks = getBlocks(props.yDoc);

      const blockId = addBlockGroup(
        layout,
        blocks,
        {
          type: BlockType.SQL,
          dataSourceId: null,
          isFileDataSource: true,
          source,
        },
        layout.length
      );

      const sqlBlock = blocks.get(blockId);
      if (!sqlBlock) {
        return;
      }

      props.executionQueue.enqueueBlock(
        sqlBlock,
        props.userId,
        environmentStartedAt,
        {
          _tag: "sql",
          isSuggestion: false,
          selectedCode: null,
        }
      );
    },
    [props.yDoc, props.executionQueue, props.userId, environmentStartedAt]
  );

  const [
    { files, deleting, upload },
    {
      del,
      onDrop,
      onReplaceYes,
      onReplaceAll,
      onReplaceNo,
      onAbort,
      onRemoveResult,
    },
  ] = useFiles(props.workspaceId, props.visible ? 5000 : 0);

  const onRemove = useCallback(
    (file: SandwormFile) => {
      del(file.relCwdPath);
    },
    [del]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openUpload,
  } = useDropzone({
    onDrop,
    noClick: true,
  });

  const isAskingReplace =
    upload._tag === "uploading" && upload.current.status === "asking-replace";

  const actualFiles = useMemo(
    () =>
      files.filter(file => {
        const s = search.trim();
        if (s !== "") {
          const name = file.name.trim();
          return name.toLowerCase().includes(s.toLowerCase());
        }

        if (upload._tag === "idle") {
          return true;
        }

        if (
          upload.current.file.name === file.relCwdPath &&
          upload.current.status === "uploading"
        ) {
          return false;
        }

        return true;
      }),
    [files, upload, search]
  );

  const results = useMemo(
    () => upload.results.filter(f => f.outcome !== "success"),
    [upload.results]
  );

  return (
    <>
      <Transition
        as="div"
        show={props.visible}
        className="h-full overflow-hidden flex-shrink-0 font-body "
        enter="transition-[width] duration-300 ease-in-out"
        enterFrom="w-0"
        enterTo="w-[354px]"
        leave="transition-[width] duration-300 ease-in-out"
        leaveFrom="w-[354px]"
        leaveTo="w-0"
      >
        <input
          id="file-upload"
          className="sr-only"
          type="file"
          {...getInputProps()}
        />

        <div
          className="relative w-[354px] flex flex-col border-l dark:border-border-tertiary border-border-secondary h-full bg-white  dark:bg-base-100 "
          {...getRootProps()}
        >
          <div className="flex justify-between border-b p-6 space-x-3 border-[#E9ECEF]  dark:border-border-tertiary ">
            <div>
              <h3 className="text-lg font-medium leading-6 text-ink-100 pr-1.5">
                Files
              </h3>
              <p className="text-ink-400 text-sm pt-1">
              Upload files to your notebook for analysis
              </p>
            </div>

            <button
              type="button"
              className="absolute z-10 top-7 transform rounded-full border border-gray-300  text-ink-400 bg-base-100 hover:bg-gray-100 w-6 h-6 flex justify-center items-center right-3 -translate-x-1/2 dark:border-border-tertiary"
              onClick={props.onHide}
            >
              <ChevronDoubleRightIcon className="w-3 h-3" />
            </button>

            {/*    <div>
              <button
                type="button"
                className="flex items-center gap-x-2 rounded-lg bg-[#A308F0] px-3 py-1 text-sm hover:bg-primary-300 text-white disabled:cursor-not-allowed disabled:bg-gray-200"
                onClick={openUpload}
              >
                Add
              </button>
            </div> */}
          </div>
          {(upload._tag === "uploading" || results.length > 0) && (
            <>
              <div className="relative flex px-4 py-2 text-xs font-medium border-b dark:border-border-tertiary border-[#FEFEFF] bg-gray-50  dark:bg-base-100  text-gray-600 justify-between">
                <div className="flex gap-x-1">
                  <CloudArrowUpIconSolid className="w-4 h-4 text-ink-400" />
                  Uploading
                </div>
              </div>
              <ul className="divide-y divide-solid overflow-y-auto border-b border-[#FEFEFF] dark:border-border-tertiary divide-[#FEFEFF] dark:divide-border-tertiary">
                {results.map(result => (
                  <li key={result.file.name}>
                    <UploadResultItem
                      result={result}
                      onRemove={onRemoveResult}
                    />
                  </li>
                ))}
                {upload._tag === "uploading" && (
                  <li>
                    <UploadingItem upload={upload.current} onAbort={onAbort} />
                  </li>
                )}
                {upload._tag === "uploading" &&
                  upload.rest.map(f => (
                    <li key={f.name}>
                      <WaitingItem file={f} onAbort={onAbort} />
                    </li>
                  ))}
              </ul>
            </>
          )}
          {(actualFiles.length > 0 || upload._tag === "idle") && (
            <>
              <div className="relative flex px-4 py-2 text-xs font-medium border-b border-[#E9ECEF] dark:bg-base-100  dark:border-border-tertiary  text-ink-400 justify-between">
                <div className="flex gap-x-1">
                  <span className="font-mono">/home/sandwormuser</span>
                </div>
                <Tooltip
                  title=""
                  message="Files will be uploaded to this location. You can read them from disk."
                  position="left"
                  active
                  tooltipClassname="w-44"
                >
                  <Info />
                </Tooltip>
              </div>
              <div className="px-4 py-0 flex items-center border-b dark:border-border-tertiary border-border-secondary group focus-within:border-[#7104A8]">
                <MagnifyingGlassIcon className="h-4 w-4 text-ink-300  group-focus-within:text-[#7104A8]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full h-8 border-0 placeholder-[#868E96] dark:placeholder-ink-400 text-sm text-ink-100 focus:outline-none focus:ring-0 pl-2"
                  onChange={e => setSearch(e.target.value)}
                  value={search}
                />
              </div>
              {!isDragActive && (
                <UploadPlaceholder compact onClick={openUpload} />
              )}
              {actualFiles.length > 0 ? (
                <ul className="flex-1  overflow-y-auto px-3">
                  {actualFiles
                    .filter(f => !f.isDirectory)
                    .map(file => (
                      <li key={file.path}>
                        <FileItem
                          workspaceId={props.workspaceId}
                          file={file}
                          onUseInPython={onUseInPython}
                          onUseInSQL={onUseInSQL}
                          onDelete={onRemove}
                          isDeleting={deleting[file.name] ?? false}
                          canUse={props.yDoc !== undefined}
                        />
                      </li>
                    ))}
                </ul>
              ) : (
                !isDragActive && (
                  <div className="flex-1 p-4">
                    <div className="flex items-center flex-col justify-center h-full text-ink-400  bg-[#FBFBFB] rounded-lg border-2 border-dashed border-[#E9ECEF] p-8 text-center dark:bg-base-100 dark:border-border-tertiary">
                      <UploadIcon />
                      <span className="mt-2 text-sm">
                        Click or drag and drop files here to upload them
                      </span>
                    </div>
                  </div>
                )
              )}
              <DragOverlay isDragActive={isDragActive} />
            </>
          )}
        </div>
      </Transition>
      <ReplaceDialog
        fileName={upload._tag === "uploading" ? upload.current.file.name : ""}
        open={isAskingReplace}
        onReplaceYes={onReplaceYes}
        onReplaceAll={onReplaceAll}
        onReplaceNo={onReplaceNo}
      />
    </>
  );
}
